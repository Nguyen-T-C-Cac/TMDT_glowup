package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.mapper.MessageMapper;
import com.example.becommerce.dto.mapper.WarrantyMapper;
import com.example.becommerce.dto.request.warranty.CreateWarrantyRequest;
import com.example.becommerce.dto.response.chat.MessageResponse;
import com.example.becommerce.dto.response.warranty.WarrantyResponse;
import com.example.becommerce.entity.Conversation;
import com.example.becommerce.entity.Message;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.OrderStatusHistory;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.WarrantyClaim;
import com.example.becommerce.entity.enums.MessageType;
import com.example.becommerce.entity.enums.NotificationType;
import com.example.becommerce.entity.enums.OrderActor;
import com.example.becommerce.entity.enums.OrderStatus;
import com.example.becommerce.entity.enums.Role;
import com.example.becommerce.entity.enums.WarrantyStatus;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.ConversationRepository;
import com.example.becommerce.repository.MessageRepository;
import com.example.becommerce.repository.OrderRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.repository.WarrantyClaimRepository;
import com.example.becommerce.service.NotificationService;
import com.example.becommerce.service.WarrantyService;
import com.example.becommerce.service.WsEventPublisher;
import com.example.becommerce.utils.ConversationCodeGenerator;
import com.example.becommerce.utils.MessageCodeGenerator;
import com.example.becommerce.utils.WarrantyCodeGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Warranty business rules:
 *  - A claim can be filed by the customer of the order, only after the order is COMPLETED.
 *  - warrantyExpiresAt = order.completedAt + (order.warrantyMonths OR default 3 months).
 *  - One claim per order at a time; new claim replaces the prior pending one.
 *  - When a claim is created -> chat message + notification sent to technician.
 *  - Technician can accept -> order returns to SCHEDULED and follows the repair lifecycle.
 *  - Technician can reject with reason -> customer notified.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WarrantyServiceImpl implements WarrantyService {

    private static final int DEFAULT_WARRANTY_MONTHS = 3;

    private final WarrantyClaimRepository warrantyRepository;
    private final OrderRepository         orderRepository;
    private final UserRepository          userRepository;
    private final ConversationRepository  conversationRepository;
    private final MessageRepository       messageRepository;
    private final WarrantyMapper          warrantyMapper;
    private final MessageMapper           messageMapper;
    private final WarrantyCodeGenerator   codeGenerator;
    private final ConversationCodeGenerator conversationCodeGenerator;
    private final MessageCodeGenerator    messageCodeGenerator;
    private final WsEventPublisher        eventPublisher;
    private final NotificationService     notificationService;
    private final ObjectMapper            objectMapper;

    @Override
    @Transactional
    public WarrantyResponse createWarranty(String orderCode, CreateWarrantyRequest request) {
        User customer = getCurrentUser();
        Order order = findOrder(orderCode);
        ensureCustomerOf(order, customer);

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw AppException.badRequest(ErrorCode.INVALID_ORDER_STATUS_TRANSITION,
                    "Chỉ có thể yêu cầu bảo hành đơn đã hoàn thành");
        }

        LocalDateTime expiresAt = computeExpiry(order);
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            throw AppException.badRequest(ErrorCode.WARRANTY_EXPIRED, "Thời hạn bảo hành đã hết");
        }

        WarrantyClaim claim = WarrantyClaim.builder()
                .code(codeGenerator.generate())
                .order(order)
                .customer(customer)
                .technician(order.getTechnician())
                .description(request.getDescription())
                .status(WarrantyStatus.PENDING)
                .scheduledAt(request.getScheduledAt())
                .warrantyExpiresAt(expiresAt)
                .build();

        if (request.getImages() != null) {
            request.getImages().stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(String::trim)
                    .forEach(claim.getImages()::add);
        }

        WarrantyClaim saved = warrantyRepository.save(claim);

        // Mark order as having a warranty claim
        order.setIsWarranty(true);
        orderRepository.save(order);

        log.info("Warranty {} created on order {} by customer {}", saved.getCode(), order.getCode(), customer.getCode());

        // Send chat message to the order's conversation
        User technician = order.getTechnician();
        if (technician != null) {
            sendWarrantyChatMessage(order, customer, technician, saved, "warranty_request");
            notifyUser(technician, NotificationType.WARRANTY_REQUEST,
                    "Yêu cầu bảo hành mới",
                    "Khách hàng " + customer.getFullName() + " đã gửi yêu cầu bảo hành cho đơn " + order.getCode(),
                    Map.of("orderId", order.getCode(), "warrantyId", saved.getCode()));
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyResponse getWarrantyByOrder(String orderCode) {
        Order order = findOrder(orderCode);
        User current = getCurrentUser();
        ensureReadable(order, current);

        WarrantyClaim claim = warrantyRepository.findTopByOrder_IdOrderByCreatedAtDesc(order.getId())
                .orElseThrow(() -> AppException.notFound("Đơn này chưa có yêu cầu bảo hành"));

        return toResponse(claim);
    }

    @Override
    @Transactional
    public WarrantyResponse acceptWarranty(String warrantyCode) {
        User technician = getCurrentUser();
        if (technician.getRole() != Role.TECHNICIAN) {
            throw AppException.forbidden("Chỉ thợ mới có thể chấp nhận bảo hành");
        }

        WarrantyClaim claim = warrantyRepository.findByCode(warrantyCode)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy yêu cầu bảo hành " + warrantyCode));

        if (claim.getStatus() != WarrantyStatus.PENDING) {
            throw AppException.badRequest(ErrorCode.INVALID_ORDER_STATUS_TRANSITION,
                    "Yêu cầu bảo hành này đã được xử lý");
        }

        if (claim.getTechnician() == null || !claim.getTechnician().getId().equals(technician.getId())) {
            throw AppException.forbidden("Bạn không phải thợ phụ trách đơn này");
        }

        claim.setStatus(WarrantyStatus.IN_PROGRESS);
        WarrantyClaim saved = warrantyRepository.save(claim);

        Order order = claim.getOrder();
        OrderStatus previousOrderStatus = order.getStatus();
        order.setStatus(OrderStatus.SCHEDULED);
        if (claim.getScheduledAt() != null) {
            order.setScheduledAt(claim.getScheduledAt());
        }
        order.setStartedAt(null);
        order.getStatusHistory().add(OrderStatusHistory.builder()
                .order(order)
                .fromStatus(previousOrderStatus)
                .toStatus(OrderStatus.SCHEDULED)
                .actor(OrderActor.TECHNICIAN)
                .actorUserId(technician.getId())
                .note("Thợ chấp nhận yêu cầu bảo hành")
                .build());
        orderRepository.save(order);
        eventPublisher.publishOrderStatusChanged(
                order.getCode(), previousOrderStatus.apiValue(), OrderStatus.SCHEDULED.apiValue());

        log.info("Warranty {} accepted by technician {} for order {}",
                warrantyCode, technician.getCode(), order.getCode());

        // Send chat message
        sendWarrantyStatusMessage(order, saved, "warranty_accepted", technician,
                "Thợ đã tiếp nhận yêu cầu. Đơn sẽ tiếp tục qua lịch hẹn và các bước sửa chữa bảo hành.");

        // Notify customer
        notifyUser(order.getCustomer(), NotificationType.WARRANTY_RESPONSE,
                "Yêu cầu bảo hành được chấp nhận",
                "Thợ " + technician.getFullName() + " đã chấp nhận yêu cầu bảo hành đơn " + order.getCode(),
                Map.of("orderId", order.getCode(), "warrantyId", claim.getCode()));

        return toResponse(claim);
    }

    @Override
    @Transactional
    public WarrantyResponse rejectWarranty(String warrantyCode, String reason) {
        User technician = getCurrentUser();
        if (technician.getRole() != Role.TECHNICIAN) {
            throw AppException.forbidden("Chỉ thợ mới có thể từ chối bảo hành");
        }

        WarrantyClaim claim = warrantyRepository.findByCode(warrantyCode)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy yêu cầu bảo hành " + warrantyCode));

        if (claim.getStatus() != WarrantyStatus.PENDING) {
            throw AppException.badRequest(ErrorCode.INVALID_ORDER_STATUS_TRANSITION,
                    "Yêu cầu bảo hành này đã được xử lý");
        }

        if (claim.getTechnician() == null || !claim.getTechnician().getId().equals(technician.getId())) {
            throw AppException.forbidden("Bạn không phải thợ phụ trách đơn này");
        }

        claim.setStatus(WarrantyStatus.REJECTED);
        claim.setRejectReason(reason);
        warrantyRepository.save(claim);

        Order order = claim.getOrder();
        order.setIsWarranty(false);
        orderRepository.save(order);

        log.info("Warranty {} rejected by technician {}: {}", warrantyCode, technician.getCode(), reason);

        // Send chat message
        sendWarrantyStatusMessage(order, claim, "warranty_rejected", technician, reason);

        // Notify customer
        notifyUser(order.getCustomer(), NotificationType.WARRANTY_RESPONSE,
                "Yêu cầu bảo hành bị từ chối",
                "Thợ " + technician.getFullName() + " đã từ chối bảo hành đơn " + order.getCode() + ". Lý do: " + reason,
                Map.of("orderId", order.getCode(), "warrantyId", claim.getCode()));

        return toResponse(claim);
    }

    private WarrantyResponse toResponse(WarrantyClaim claim) {
        WarrantyClaim previousRejectedClaim = findPreviousRejectedClaim(claim);
        long claimCount = warrantyRepository.countByOrder_Id(claim.getOrder().getId());
        return warrantyMapper.toResponse(claim, previousRejectedClaim, claimCount);
    }

    private WarrantyClaim findPreviousRejectedClaim(WarrantyClaim claim) {
        if (claim == null || claim.getStatus() == WarrantyStatus.REJECTED) {
            return null;
        }
        return warrantyRepository.findTopByOrder_IdAndStatusAndCreatedAtBeforeOrderByCreatedAtDesc(
                claim.getOrder().getId(), WarrantyStatus.REJECTED, claim.getCreatedAt())
                .orElse(null);
    }

    // ----------------------------------------------------------------

    private void sendWarrantyChatMessage(Order order, User customer, User technician,
                                          WarrantyClaim claim, String eventType) {
        try {
            Conversation conversation = conversationRepository.findByOrder_Id(order.getId())
                    .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .code(conversationCodeGenerator.generate())
                            .order(order)
                                .customer(customer)
                                .technician(technician)
                                .build();
                        return conversationRepository.save(newConv);
                    });

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("event", eventType);
            payload.put("warrantyId", claim.getCode());
            payload.put("description", claim.getDescription());
            payload.put("images", claim.getImages());
            payload.put("scheduledAt", claim.getScheduledAt() != null ? claim.getScheduledAt().toString() : null);
            payload.put("warrantyExpiresAt", claim.getWarrantyExpiresAt() != null ? claim.getWarrantyExpiresAt().toString() : null);
            payload.put("customerName", customer.getFullName());

            String jsonContent = objectMapper.writeValueAsString(payload);

            Message message = Message.builder()
                    .code(messageCodeGenerator.generate())
                    .conversation(conversation)
                    .sender(null) // system message
                    .type(MessageType.WARRANTY)
                    .content(jsonContent)
                    .title("Yêu cầu bảo hành")
                    .build();
            Message saved = messageRepository.save(message);

            conversation.setLastMessageAt(saved.getSentAt());
            conversationRepository.save(conversation);

            MessageResponse response = messageMapper.toResponse(saved, null, null);
            eventPublisher.publishMessageNew(conversation.getCode(), response);

        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize warranty chat message: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("Failed to send warranty chat message: {}", e.getMessage());
        }
    }

    private void sendWarrantyStatusMessage(Order order, WarrantyClaim claim,
                                            String eventType, User technician, String note) {
        try {
            Conversation conversation = conversationRepository.findByOrder_Id(order.getId()).orElse(null);
            if (conversation == null) return;

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("event", eventType);
            payload.put("warrantyId", claim.getCode());
            payload.put("technicianName", technician.getFullName());
            payload.put("note", note);

            String jsonContent = objectMapper.writeValueAsString(payload);

            Message message = Message.builder()
                    .code(messageCodeGenerator.generate())
                    .conversation(conversation)
                    .sender(null)
                    .type(MessageType.WARRANTY)
                    .content(jsonContent)
                    .title(eventType.equals("warranty_accepted")
                            ? "Yêu cầu bảo hành đã được tiếp nhận"
                            : "Yêu cầu bảo hành chưa được chấp nhận")
                    .build();
            Message saved = messageRepository.save(message);

            conversation.setLastMessageAt(saved.getSentAt());
            conversationRepository.save(conversation);

            MessageResponse response = messageMapper.toResponse(saved, null, null);
            eventPublisher.publishMessageNew(conversation.getCode(), response);

        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize warranty status message: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("Failed to send warranty status message: {}", e.getMessage());
        }
    }

    private LocalDateTime computeExpiry(Order order) {
        LocalDateTime previousExpiry = warrantyRepository.findTopByOrder_IdOrderByCreatedAtDesc(order.getId())
                .map(WarrantyClaim::getWarrantyExpiresAt)
                .orElse(null);
        if (previousExpiry != null) {
            return previousExpiry;
        }
        if (order.getCompletedAt() == null) return null;
        int months = order.getWarrantyMonths() != null ? order.getWarrantyMonths() : DEFAULT_WARRANTY_MONTHS;
        return order.getCompletedAt().plusMonths(months);
    }

    private void notifyUser(User user, NotificationType type, String title, String body, Map<String, Object> data) {
        if (user == null) return;
        try {
            notificationService.createNotification(user, type, title, body, data);
        } catch (Exception ex) {
            log.warn("Failed to create notification for {}: {}", user.getCode(), ex.getMessage());
        }
    }

    private Order findOrder(String code) {
        return orderRepository.findByCodeAndDeletedFalse(code)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy đơn hàng " + code));
    }

    private void ensureCustomerOf(Order order, User user) {
        if (user.getRole() != Role.CUSTOMER
                || order.getCustomer() == null
                || !order.getCustomer().getId().equals(user.getId())) {
            throw AppException.forbidden("Chỉ khách hàng đặt đơn mới được yêu cầu bảo hành");
        }
    }

    private void ensureReadable(Order order, User user) {
        if (user.getRole() == Role.ADMIN) return;
        boolean isCustomerOwner = user.getRole() == Role.CUSTOMER
                && order.getCustomer() != null
                && order.getCustomer().getId().equals(user.getId());
        boolean isTechnician = user.getRole() == Role.TECHNICIAN
                && order.getTechnician() != null
                && order.getTechnician().getId().equals(user.getId());
        if (!isCustomerOwner && !isTechnician) {
            throw AppException.forbidden("Bạn không có quyền xem bảo hành đơn này");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw AppException.unauthorized("Người dùng chưa đăng nhập");
        }
        String email = authentication.getName();
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng hiện tại"));
    }
}
