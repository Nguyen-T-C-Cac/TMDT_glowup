package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.mapper.MessageMapper;
import com.example.becommerce.dto.mapper.QuotationMapper;
import com.example.becommerce.dto.request.quotation.CreateQuotationRequest;
import com.example.becommerce.dto.request.quotation.ReviseQuotationRequest;
import com.example.becommerce.dto.response.quotation.AcceptQuotationResponse;
import com.example.becommerce.dto.response.quotation.QuotationResponse;
import com.example.becommerce.entity.Conversation;
import com.example.becommerce.entity.Message;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.Quotation;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.enums.MessageType;
import com.example.becommerce.entity.enums.NotificationType;
import com.example.becommerce.entity.enums.OrderStatus;
import com.example.becommerce.entity.enums.QuotationStatus;
import com.example.becommerce.entity.enums.Role;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.BookingRepository;
import com.example.becommerce.repository.ConversationRepository;
import com.example.becommerce.repository.MessageRepository;
import com.example.becommerce.repository.OrderRepository;
import com.example.becommerce.repository.QuotationRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.service.NotificationService;
import com.example.becommerce.service.QuotationService;
import com.example.becommerce.service.WsEventPublisher;
import com.example.becommerce.utils.MessageCodeGenerator;
import com.example.becommerce.utils.OrderCodeGenerator;
import com.example.becommerce.utils.QuotationCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Business rules for quotations:
 *  - Only the technician of a conversation can post a quote.
 *  - Posting a quote also writes a "quotation" message into the conversation.
 *  - Only the customer of the conversation can accept it.
 *  - On accept, the accepted quote is converted into an Order in SCHEDULED status.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuotationServiceImpl implements QuotationService {

    private final QuotationRepository      quotationRepository;
    private final ConversationRepository   conversationRepository;
    private final MessageRepository        messageRepository;
    private final BookingRepository        bookingRepository;
    private final OrderRepository          orderRepository;
    private final UserRepository           userRepository;
    private final QuotationMapper          quotationMapper;
    private final MessageMapper            messageMapper;
    private final QuotationCodeGenerator   quotationCodeGenerator;
    private final MessageCodeGenerator     messageCodeGenerator;
    private final OrderCodeGenerator       orderCodeGenerator;
    private final WsEventPublisher         eventPublisher;
    private final NotificationService      notificationService;

    // ===============================================================
    // CREATE QUOTE
    // ===============================================================

    @Override
    @Transactional
    public QuotationResponse createQuotation(String conversationCode, CreateQuotationRequest request) {
        Conversation conversation = findConversation(conversationCode);
        User sender = getCurrentUser();

        if (sender.getRole() != Role.TECHNICIAN) {
            throw AppException.forbidden("Chỉ thợ mới có thể tạo báo giá");
        }
        if (conversation.getTechnician() == null
                || !conversation.getTechnician().getId().equals(sender.getId())) {
            throw AppException.forbidden("Bạn không phải thợ của cuộc trò chuyện này");
        }

        Quotation quotation = Quotation.builder()
                .code(quotationCodeGenerator.generate())
                .conversation(conversation)
                .technician(sender)
                .serviceName(request.getServiceName())
                .description(request.getDescription())
                .price(request.getPrice())
                .scheduledAt(request.getScheduledAt())
                .notes(request.getNotes())
                .status(QuotationStatus.PENDING)
                .build();
        Quotation savedQuote = quotationRepository.save(quotation);

        // Embed the quote in the conversation thread.
        Message message = Message.builder()
                .code(messageCodeGenerator.generate())
                .conversation(conversation)
                .sender(sender)
                .type(MessageType.QUOTATION)
                .content(null)
                .quotation(savedQuote)
                .build();
        Message savedMessage = messageRepository.save(message);

        conversation.setLastMessageAt(savedMessage.getSentAt());
        conversationRepository.save(conversation);

        // Push the embedded quotation message to chat subscribers.
        eventPublisher.publishMessageNew(
                conversation.getCode(),
                messageMapper.toResponse(savedMessage, sender, savedMessage.getSentAt()));

        log.info("Quotation {} posted by technician {} in conversation {}",
                savedQuote.getCode(), sender.getCode(), conversation.getCode());

        return quotationMapper.toResponse(savedQuote);
    }

    // ===============================================================
    // ACCEPT QUOTE → SPAWN ORDER
    // ===============================================================

    @Override
    @Transactional
    public AcceptQuotationResponse acceptQuotation(String quotationCode) {
        Quotation quotation = quotationRepository.findByCode(quotationCode)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy báo giá " + quotationCode));

        Conversation conversation = quotation.getConversation();
        Order linkedOrder = conversation.getOrder();
        User customer = getCurrentUser();

        if (customer.getRole() != Role.CUSTOMER
                || conversation.getCustomer() == null
                || !conversation.getCustomer().getId().equals(customer.getId())) {
            throw AppException.forbidden("Chỉ khách hàng của cuộc trò chuyện mới có thể chấp nhận báo giá");
        }
        if (quotation.getStatus() != QuotationStatus.PENDING) {
            throw AppException.badRequest(ErrorCode.QUOTATION_NOT_PENDING,
                    "Báo giá không còn ở trạng thái chờ duyệt");
        }

        String resolvedAddress = linkedOrder != null && linkedOrder.getAddress() != null && !linkedOrder.getAddress().isBlank()
                ? linkedOrder.getAddress()
                : customer.getAddress();

        Order order = linkedOrder;
        OrderStatus previousStatus = order != null ? order.getStatus() : null;
        if (order == null) {
            order = Order.builder()
                    .code(orderCodeGenerator.generate())
                    .customer(customer)
                    .technician(quotation.getTechnician())
                    .status(OrderStatus.NEW)
                    .build();
        }

        order.setCustomer(customer);
        order.setTechnician(quotation.getTechnician());
        order.setServiceName(quotation.getServiceName());
        order.setSubService(linkedOrder != null ? linkedOrder.getSubService() : null);
        order.setServiceCategory(linkedOrder != null && linkedOrder.getServiceCategory() != null
                ? linkedOrder.getServiceCategory()
                : "booking");
        order.setDeviceName(linkedOrder != null ? linkedOrder.getDeviceName() : null);
        order.setDescription(quotation.getDescription());
        order.setAddress(resolvedAddress);
        order.setEstimatedPrice(quotation.getPrice());
        order.setScheduledAt(quotation.getScheduledAt());
        order.setExpectedTime(quotation.getScheduledAt());
        order.setStatus(OrderStatus.SCHEDULED);

        Order savedOrder = orderRepository.save(order);
        conversation.setOrder(savedOrder);

        quotation.setStatus(QuotationStatus.ACCEPTED);
        quotation.setAcceptedAt(LocalDateTime.now());
        quotation.setOrder(savedOrder);
        Quotation savedQuote = quotationRepository.save(quotation);

        bookingRepository.findFirstByConversation_IdOrderByCreatedAtDesc(conversation.getId())
                .ifPresent(booking -> {
                    booking.setOrder(savedOrder);
                    bookingRepository.save(booking);
                });

        conversationRepository.save(conversation);

        // The accepted quote now appears in the scheduled orders flow.
        eventPublisher.publishOrderStatusChanged(
                savedOrder.getCode(),
                previousStatus == null ? null : previousStatus.apiValue(),
                OrderStatus.SCHEDULED.apiValue());

        // Notify the technician their quote was accepted.
        try {
            notificationService.createNotification(
                    quotation.getTechnician(),
                    NotificationType.ORDER_ACCEPTED,
                    "Báo giá được chấp nhận",
                    "Khách " + customer.getFullName() + " đã chấp nhận báo giá "
                            + savedQuote.getCode() + " → đơn " + savedOrder.getCode(),
                    java.util.Map.of(
                            "quotationId", savedQuote.getCode(),
                            "orderId", savedOrder.getCode()));
        } catch (Exception ex) {
            log.warn("Failed to notify technician on quote acceptance: {}", ex.getMessage());
        }

        log.info("Quotation {} accepted by customer {} → order {}",
                savedQuote.getCode(), customer.getCode(), savedOrder.getCode());

        return quotationMapper.toAcceptResponse(savedQuote);
    }

    // ===============================================================
    // REJECT QUOTE
    // ===============================================================

    @Override
    @Transactional
    public QuotationResponse rejectQuotation(String quotationCode) {
        Quotation quotation = quotationRepository.findByCode(quotationCode)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy báo giá " + quotationCode));

        Conversation conversation = quotation.getConversation();
        User customer = getCurrentUser();

        if (customer.getRole() != Role.CUSTOMER
                || conversation.getCustomer() == null
                || !conversation.getCustomer().getId().equals(customer.getId())) {
            throw AppException.forbidden("Chỉ khách hàng của cuộc trò chuyện mới có thể từ chối báo giá");
        }
        if (quotation.getStatus() != QuotationStatus.PENDING) {
            throw AppException.badRequest(ErrorCode.QUOTATION_NOT_PENDING,
                    "Báo giá không còn ở trạng thái chờ duyệt");
        }

        quotation.setStatus(QuotationStatus.REJECTED);
        quotation.setRejectedAt(LocalDateTime.now());
        Quotation savedQuote = quotationRepository.save(quotation);

        log.info("Quotation {} rejected by customer {}", savedQuote.getCode(), customer.getCode());
        return quotationMapper.toResponse(savedQuote);
    }

        // ===============================================================
        // REVISE QUOTE (thợ sửa báo giá bị từ chối, gửi lại cho khách)
        // ===============================================================

        @Override
        @Transactional
        public QuotationResponse reviseQuotation(String quotationCode, ReviseQuotationRequest req) {
        Quotation old = quotationRepository.findByCode(quotationCode)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy báo giá " + quotationCode));

        User sender = getCurrentUser();

        if (sender.getRole() != Role.TECHNICIAN) {
                throw AppException.forbidden("Chỉ thợ mới có thể sửa báo giá");
        }
        if (!old.getTechnician().getId().equals(sender.getId())) {
                throw AppException.forbidden("Bạn không phải thợ của báo giá này");
        }
        if (old.getStatus() != QuotationStatus.REJECTED) {
                throw AppException.badRequest(ErrorCode.QUOTATION_NOT_REJECTED,
                        "Chỉ có thể sửa báo giá đã bị từ chối");
        }

        Conversation conversation = old.getConversation();

        // Tạo quotation mới PENDING thay thế cái cũ
        Quotation revised = Quotation.builder()
                .code(quotationCodeGenerator.generate())
                .conversation(conversation)
                .technician(sender)
                .serviceName(req.getServiceName())
                .description(req.getDescription())
                .price(req.getPrice())
                .scheduledAt(req.getScheduledAt())
                .notes(req.getNotes())
                .status(QuotationStatus.PENDING)
                .build();
        Quotation savedQuote = quotationRepository.save(revised);

        // Gửi message type=QUOTATION vào conversation (y chang createQuotation)
        Message message = Message.builder()
                .code(messageCodeGenerator.generate())
                .conversation(conversation)
                .sender(sender)
                .type(MessageType.QUOTATION)
                .content(null)
                .quotation(savedQuote)
                .build();
        Message savedMessage = messageRepository.save(message);

        conversation.setLastMessageAt(savedMessage.getSentAt());
        conversationRepository.save(conversation);

        // Push realtime cho khách
        eventPublisher.publishMessageNew(
                conversation.getCode(),
                messageMapper.toResponse(savedMessage, sender, savedMessage.getSentAt()));

        log.info("Quotation {} revised by technician {} → new quotation {} in conversation {}",
                quotationCode, sender.getCode(), savedQuote.getCode(), conversation.getCode());

        return quotationMapper.toResponse(savedQuote);
        }

    // ----------------------------------------------------------------

    private Conversation findConversation(String code) {
        return conversationRepository.findByCode(code)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy cuộc trò chuyện " + code));
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
