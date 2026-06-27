package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.mapper.MessageMapper;
import com.example.becommerce.dto.request.booking.CreateBookingRequest;
import com.example.becommerce.dto.response.chat.EmbeddedBooking;
import com.example.becommerce.dto.response.chat.MessageResponse;
import com.example.becommerce.dto.response.booking.BookingResponse;
import com.example.becommerce.dto.response.booking.BookingSubmitResponse;
import com.example.becommerce.dto.response.booking.BrandResponse;
import com.example.becommerce.dto.response.booking.DeviceTypeResponse;
import com.example.becommerce.entity.*;
import com.example.becommerce.entity.enums.*;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.*;
import com.example.becommerce.service.BookingService;
import com.example.becommerce.service.NotificationService;
import com.example.becommerce.service.WsEventPublisher;
import com.example.becommerce.utils.BookingCodeGenerator;
import com.example.becommerce.utils.ConversationCodeGenerator;
import com.example.becommerce.utils.MessageCodeGenerator;
import com.example.becommerce.utils.OrderCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final CategoryRepository categoryRepository;
    private final DeviceTypeRepository deviceTypeRepository;
    private final BrandRepository brandRepository;
    private final BookingRepository bookingRepository;
    private final BookingImageRepository bookingImageRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final TechnicianProfileRepository technicianProfileRepository;
    private final OrderRepository orderRepository;
    private final OrderCodeGenerator orderCodeGenerator;
    private final BookingCodeGenerator bookingCodeGenerator;
    private final ConversationCodeGenerator conversationCodeGenerator;
    private final MessageCodeGenerator messageCodeGenerator;
    private final MessageMapper messageMapper;
    private final WsEventPublisher eventPublisher;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<DeviceTypeResponse> getDeviceTypesByCategory(String categoryCode) {
        List<DeviceType> types = deviceTypeRepository
                .findByCategory_CodeAndStatusAndDeletedFalseOrderByNameAsc(categoryCode, VisibilityStatus.ACTIVE);
        return types.stream()
                .map(dt -> DeviceTypeResponse.builder()
                        .code(dt.getCode())
                        .name(dt.getName())
                        .categoryCode(categoryCode)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getBrandsByCategory(String categoryCode) {
        List<Brand> brands = brandRepository
                .findByCategory_CodeAndStatusAndDeletedFalseOrderByNameAsc(categoryCode, VisibilityStatus.ACTIVE);
        return brands.stream()
                .map(b -> BrandResponse.builder()
                        .code(b.getCode())
                        .name(b.getName())
                        .categoryCode(categoryCode)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingSubmitResponse createBooking(CreateBookingRequest request) {
        log.info("createBooking started: categoryCode={}, description={}", request.getCategoryCode(),
                request.getDescription() != null ? request.getDescription().substring(0, Math.min(50, request.getDescription().length())) : "");

        try {
            User customer = getCurrentUser();
            log.debug("Authenticated customer: code={}, id={}", customer.getCode(), customer.getId());

            // 1. Find category
            Category category = categoryRepository.findByCodeAndDeletedFalse(request.getCategoryCode())
                    .orElseThrow(() -> AppException.notFound("Không tìm thấy dịch vụ"));
            log.debug("Found category: code={}, title={}", category.getCode(), category.getTitle());

            // 2. Find device type (optional)
            DeviceType deviceType = null;
            if (request.getDeviceTypeCode() != null && !request.getDeviceTypeCode().isBlank()) {
                log.debug("Looking up deviceType by code: {}", request.getDeviceTypeCode());
                deviceType = deviceTypeRepository.findByCode(request.getDeviceTypeCode())
                        .orElse(null);
            }

            // 3. Find brand (optional)
            Brand brand = null;
            if (request.getBrandCode() != null && !request.getBrandCode().isBlank()) {
                log.debug("Looking up brand by code: {}", request.getBrandCode());
                brand = brandRepository.findByCode(request.getBrandCode())
                        .orElse(null);
            }

            // 4. Find technician
            User technician;
            if (request.getTechnicianCode() != null && !request.getTechnicianCode().isBlank()) {
                log.debug("Using specified technician: {}", request.getTechnicianCode());
                technician = userRepository.findByCodeAndDeletedFalse(request.getTechnicianCode())
                        .orElseThrow(() -> AppException.notFound("Không tìm thấy thợ"));
                if (technician.getRole() != Role.TECHNICIAN) {
                    throw AppException.badRequest(ErrorCode.VALIDATION_ERROR, "Tài khoản không phải là thợ");
                }
            } else {
                technician = findAvailableTechnician(category);
                if (technician == null) {
                    throw AppException.badRequest(ErrorCode.NO_TECHNICIAN_AVAILABLE,
                            "Hiện chưa có thợ khả dụng cho dịch vụ này");
                }
                log.debug("Assigned available technician: code={}", technician.getCode());
            }

            // 5. Parse urgency
            UrgencyLevel urgency = UrgencyLevel.NORMAL;
            if (request.getUrgency() != null && !request.getUrgency().isBlank()) {
                try {
                    urgency = UrgencyLevel.valueOf(request.getUrgency().trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid urgency value '{}', falling back to NORMAL", request.getUrgency());
                    urgency = UrgencyLevel.NORMAL;
                }
            }

            // 6. Create or reuse conversation
            log.debug("Finding or creating conversation for customer={} technician={}", customer.getId(), technician.getId());
            Conversation conversation = conversationRepository
                    .findFirstByCustomer_IdAndTechnician_IdOrderByLastMessageAtDesc(customer.getId(), technician.getId())
                    .orElseGet(() -> {
                        Conversation newConv = Conversation.builder()
                                .code(conversationCodeGenerator.generate())
                                .customer(customer)
                                .technician(technician)
                                .build();
                        log.debug("Created new conversation: {}", newConv.getCode());
                        return conversationRepository.save(newConv);
                    });

            // 7. Save booking
            String bookingCode = bookingCodeGenerator.generate();
            log.debug("Creating booking with code={}", bookingCode);
            Booking booking = Booking.builder()
                    .code(bookingCode)
                    .category(category)
                    .deviceType(deviceType)
                    .brand(brand)
                    .customer(customer)
                    .technician(technician)
                    .description(request.getDescription())
                    .urgency(urgency)
                    .scheduledDate(request.getScheduledDate())
                    .preferredTime(request.getPreferredTime())
                    .address(request.getAddress())
                    .phone(request.getPhone())
                    .conversation(conversation)
                    .status(BookingStatus.PENDING)
                    .build();
            booking = bookingRepository.save(booking);
            log.debug("Booking saved: id={}, code={}", booking.getId(), booking.getCode());

            // 8. Save images
            if (request.getImageUrls() != null) {
                for (String url : request.getImageUrls()) {
                    if (url != null && !url.isBlank()) {
                        BookingImage image = BookingImage.builder()
                                .booking(booking)
                                .url(url)
                                .build();
                        bookingImageRepository.save(image);
                    }
                }
            }

            // 8b. Create linked Order with status NEW so it appears in "Yêu cầu mới"
            List<String> imageUrls = request.getImageUrls() != null
                    ? request.getImageUrls()
                    : List.of();

            String orderCode = orderCodeGenerator.generate();
            Order order = Order.builder()
                    .code(orderCode)
                    .customer(customer)
                    .technician(technician)
                    .deviceName(category.getTitle())
                    .description(request.getDescription())
                    .address(request.getAddress())
                    .serviceCategory("booking")
                    .status(OrderStatus.NEW)
                    .build();
            if (request.getScheduledDate() != null) {
                order.setScheduledAt(request.getScheduledDate().atStartOfDay());
            }
            if (imageUrls != null) {
                for (String url : imageUrls) {
                    if (url != null && !url.isBlank()) {
                        order.getImages().add(OrderImage.builder()
                                .order(order)
                                .url(url.trim())
                                .role("booking")
                                .build());
                    }
                }
            }
            order = orderRepository.save(order);
            booking.setOrder(order);
            booking = bookingRepository.save(booking);
            conversation.setOrder(order);
            conversationRepository.save(conversation);
            log.debug("Linked order {} to booking {} and conversation {}", orderCode, bookingCode, conversation.getCode());

            // 9. Build booking summary and create BOOKING message
            String summaryJson = buildBookingSummary(booking, imageUrls);
            log.debug("Booking summary JSON: {}", summaryJson);

            String msgCode = messageCodeGenerator.generate();
            log.debug("Creating booking message with code={}", msgCode);
            Message message = Message.builder()
                    .code(msgCode)
                    .conversation(conversation)
                    .sender(null)
                    .type(MessageType.BOOKING)
                    .content(summaryJson)
                    .title("Yêu cầu sửa chữa mới")
                    .build();
            message = messageRepository.save(message);
            log.debug("Booking message saved: id={}, sentAt={}", message.getId(), message.getSentAt());

            // 10. Update conversation last message timestamp
            conversation.setLastMessageAt(message.getSentAt());
            conversationRepository.save(conversation);

            // 11. Publish WebSocket event
            try {
                MessageResponse msgResponse = messageMapper.toResponse(message, customer, null);
                eventPublisher.publishMessageNew(conversation.getCode(), msgResponse);
            } catch (Exception ex) {
                log.warn("Failed to publish WS event for booking {}: {}", booking.getCode(), ex.getMessage());
            }

            // 12. Notify technician
            try {
                notificationService.createNotification(
                        technician,
                        NotificationType.CHAT_MESSAGE,
                        "Yêu cầu sửa chữa mới từ " + customer.getFullName(),
                        "Dịch vụ: " + category.getTitle() + " | " + booking.getDescription(),
                        Map.<String, Object>of(
                                "conversationId", conversation.getCode(),
                                "bookingId", booking.getCode(),
                                "senderName", customer.getFullName()
                        ));
            } catch (Exception ex) {
                log.warn("Failed to push booking notification to {}: {}", technician.getCode(), ex.getMessage());
            }

            log.info("Booking {} created for customer={} with technician={} in conversation={}",
                    booking.getCode(), customer.getCode(), technician.getCode(), conversation.getCode());

            // 13. Build response
            BookingResponse bookingResponse = toBookingResponse(booking, imageUrls);

            return BookingSubmitResponse.builder()
                    .booking(bookingResponse)
                    .conversationId(conversation.getCode())
                    .orderId(orderCode)
                    .build();

        } catch (AppException ex) {
            log.warn("AppException in createBooking: [{}] {}", ex.getErrorCode(), ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error in createBooking: ", ex);
            throw ex;
        }
    }

    // ===============================================================
    // ACCEPT BOOKING (technician)
    // ===============================================================

    @Override
    @Transactional
    public void acceptBooking(String code) {
        log.info("acceptBooking started: code={}", code);
        try {
            Booking booking = bookingRepository.findByCode(code)
                    .orElseGet(() -> bookingRepository.findByOrder_Code(code).orElse(null));
            if (booking == null) {
                throw AppException.notFound("Không tìm thấy yêu cầu sửa chữa " + code);
            }

            User technician = getCurrentUser();
            if (technician.getRole() != Role.TECHNICIAN) {
                throw AppException.forbidden("Chỉ thợ mới có thể chấp nhận yêu cầu");
            }
            if (!booking.getTechnician().getId().equals(technician.getId())) {
                throw AppException.forbidden("Bạn không phải thợ được chỉ định cho yêu cầu này");
            }
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw AppException.conflict(ErrorCode.INVALID_ORDER_STATUS_TRANSITION,
                        "Yêu cầu đã được xử lý trước đó");
            }

            // Update booking status
            booking.setStatus(BookingStatus.CONFIRMED);
            Booking savedBooking = bookingRepository.save(booking);

            // Update linked order status
            Order order = savedBooking.getOrder();
            if (order != null && order.getStatus() == OrderStatus.NEW) {
                OrderStatus from = order.getStatus();
                order.setTechnician(technician);
                order.setStatus(OrderStatus.SCHEDULED);
                if (order.getScheduledAt() == null && savedBooking.getScheduledDate() != null) {
                    order.setScheduledAt(savedBooking.getScheduledDate().atStartOfDay());
                }
                orderRepository.save(order);
                eventPublisher.publishOrderStatusChanged(
                        order.getCode(), from.apiValue(), OrderStatus.SCHEDULED.apiValue());
            }

            // Update booking message content with new status
            Conversation conversation = savedBooking.getConversation();
            if (conversation != null) {
                List<String> imageUrls = booking.getImages() != null
                        ? booking.getImages().stream().map(BookingImage::getUrl).toList()
                        : List.of();

                String convCode = conversation.getCode();
                // Find and update existing BOOKING message
                messageRepository.findByConversation_IdAndTypeOrderBySentAtDesc(
                        conversation.getId(), MessageType.BOOKING).stream()
                        .findFirst()
                        .ifPresent(msg -> {
                            String updatedJson = buildBookingSummary(savedBooking, imageUrls);
                            msg.setContent(updatedJson);
                            messageRepository.save(msg);

                            // Re-publish updated booking message via WS
                            try {
                                MessageResponse msgResponse = messageMapper.toResponse(msg, technician, null);
                                eventPublisher.publishMessageNew(convCode, msgResponse);
                            } catch (Exception ex) {
                                log.warn("Failed to re-publish booking message after accept: {}", ex.getMessage());
                            }
                        });

                // Create system message for the acceptance
                String sysCode = messageCodeGenerator.generate();
                Message systemMsg = Message.builder()
                        .code(sysCode)
                        .conversation(conversation)
                        .sender(null)
                        .type(MessageType.SYSTEM)
                        .content("Đã chấp nhận yêu cầu sửa chữa")
                        .title("Yêu cầu sửa chữa")
                        .build();
                systemMsg = messageRepository.save(systemMsg);
                conversation.setLastMessageAt(systemMsg.getSentAt());
                conversationRepository.save(conversation);

                try {
                    MessageResponse sysResponse = messageMapper.toResponse(systemMsg, technician, null);
                    eventPublisher.publishMessageNew(conversation.getCode(), sysResponse);
                } catch (Exception ex) {
                    log.warn("Failed to publish system message for accept: {}", ex.getMessage());
                }
            }

            // Notify customer
            try {
                notificationService.createNotification(
                        savedBooking.getCustomer(),
                        NotificationType.CHAT_MESSAGE,
                        "Yêu cầu sửa chữa đã được chấp nhận",
                        "Yêu cầu " + savedBooking.getCode() + " đã được thợ " + technician.getFullName() + " chấp nhận.",
                        Map.<String, Object>of(
                                "conversationId", conversation != null ? conversation.getCode() : "",
                                "bookingId", savedBooking.getCode(),
                                "senderName", technician.getFullName()
                        ));
            } catch (Exception ex) {
                log.warn("Failed to push accept notification to customer: {}", ex.getMessage());
            }

            log.info("Booking {} accepted by technician {}", savedBooking.getCode(), technician.getCode());
        } catch (AppException ex) {
            log.warn("AppException in acceptBooking: [{}] {}", ex.getErrorCode(), ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error in acceptBooking: ", ex);
            throw ex;
        }
    }

    // ===============================================================
    // REJECT BOOKING (technician)
    // ===============================================================

    @Override
    @Transactional
    public void rejectBooking(String code) {
        log.info("rejectBooking started: code={}", code);
        try {
            Booking booking = bookingRepository.findByCode(code)
                    .orElseGet(() -> bookingRepository.findByOrder_Code(code).orElse(null));
            if (booking == null) {
                throw AppException.notFound("Không tìm thấy yêu cầu sửa chữa " + code);
            }

            User technician = getCurrentUser();
            if (technician.getRole() != Role.TECHNICIAN) {
                throw AppException.forbidden("Chỉ thợ mới có thể từ chối yêu cầu");
            }
            if (!booking.getTechnician().getId().equals(technician.getId())) {
                throw AppException.forbidden("Bạn không phải thợ được chỉ định cho yêu cầu này");
            }
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw AppException.conflict(ErrorCode.INVALID_ORDER_STATUS_TRANSITION,
                        "Yêu cầu đã được xử lý trước đó");
            }

            // Update booking status
            booking.setStatus(BookingStatus.CANCELLED);
            Booking savedBooking = bookingRepository.save(booking);

            // Update linked order status
            Order order = savedBooking.getOrder();
            if (order != null && order.getStatus() == OrderStatus.NEW) {
                OrderStatus from = order.getStatus();
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                eventPublisher.publishOrderStatusChanged(
                        order.getCode(), from.apiValue(), OrderStatus.CANCELLED.apiValue());
            }

            // Update booking message content with new status
            Conversation conversation = savedBooking.getConversation();
            if (conversation != null) {
                String convCode = conversation.getCode();
                List<String> imageUrls = booking.getImages() != null
                        ? booking.getImages().stream().map(BookingImage::getUrl).toList()
                        : List.of();

                messageRepository.findByConversation_IdAndTypeOrderBySentAtDesc(
                        conversation.getId(), MessageType.BOOKING).stream()
                        .findFirst()
                        .ifPresent(msg -> {
                            String updatedJson = buildBookingSummary(savedBooking, imageUrls);
                            msg.setContent(updatedJson);
                            messageRepository.save(msg);

                            try {
                                MessageResponse msgResponse = messageMapper.toResponse(msg, technician, null);
                                eventPublisher.publishMessageNew(convCode, msgResponse);
                            } catch (Exception ex) {
                                log.warn("Failed to re-publish booking message after reject: {}", ex.getMessage());
                            }
                        });

                // Create system message for the rejection
                String sysCode = messageCodeGenerator.generate();
                Message systemMsg = Message.builder()
                        .code(sysCode)
                        .conversation(conversation)
                        .sender(null)
                        .type(MessageType.SYSTEM)
                        .content("Đã từ chối yêu cầu sửa chữa")
                        .title("Yêu cầu sửa chữa")
                        .build();
                systemMsg = messageRepository.save(systemMsg);
                conversation.setLastMessageAt(systemMsg.getSentAt());
                conversationRepository.save(conversation);

                try {
                    MessageResponse sysResponse = messageMapper.toResponse(systemMsg, technician, null);
                    eventPublisher.publishMessageNew(conversation.getCode(), sysResponse);
                } catch (Exception ex) {
                    log.warn("Failed to publish system message for reject: {}", ex.getMessage());
                }
            }

            // Notify customer
            try {
                notificationService.createNotification(
                        savedBooking.getCustomer(),
                        NotificationType.CHAT_MESSAGE,
                        "Yêu cầu sửa chữa đã bị từ chối",
                        "Yêu cầu " + savedBooking.getCode() + " đã bị thợ " + technician.getFullName() + " từ chối.",
                        Map.<String, Object>of(
                                "conversationId", conversation != null ? conversation.getCode() : "",
                                "bookingId", savedBooking.getCode(),
                                "senderName", technician.getFullName()
                        ));
            } catch (Exception ex) {
                log.warn("Failed to push reject notification to customer: {}", ex.getMessage());
            }

            log.info("Booking {} rejected by technician {}", savedBooking.getCode(), technician.getCode());
        } catch (AppException ex) {
            log.warn("AppException in rejectBooking: [{}] {}", ex.getErrorCode(), ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error in rejectBooking: ", ex);
            throw ex;
        }
    }

    private String buildBookingSummary(Booking booking, List<String> imageUrls) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"id\":\"").append(escapeJson(booking.getCode())).append("\",");
        sb.append("\"code\":\"").append(escapeJson(booking.getCode())).append("\",");
        sb.append("\"categoryName\":\"").append(escapeJson(
                booking.getCategory() != null ? booking.getCategory().getTitle() : "")).append("\",");
        sb.append("\"deviceTypeName\":\"").append(escapeJson(
                booking.getDeviceType() != null ? booking.getDeviceType().getName() : "")).append("\",");
        sb.append("\"brandName\":\"").append(escapeJson(
                booking.getBrand() != null ? booking.getBrand().getName() : "")).append("\",");
        sb.append("\"customerName\":\"").append(escapeJson(
                booking.getCustomer().getFullName())).append("\",");
        sb.append("\"technicianName\":\"").append(escapeJson(
                booking.getTechnician().getFullName())).append("\",");
        sb.append("\"description\":\"").append(escapeJson(
                booking.getDescription() != null ? booking.getDescription() : "")).append("\",");
        sb.append("\"urgency\":\"").append(escapeJson(booking.getUrgency().name())).append("\",");
        sb.append("\"scheduledDate\":");
        if (booking.getScheduledDate() != null) {
            sb.append("\"").append(booking.getScheduledDate().toString()).append("\"");
        } else {
            sb.append("null");
        }
        sb.append(",");
        sb.append("\"preferredTime\":\"").append(escapeJson(
                booking.getPreferredTime() != null ? booking.getPreferredTime() : "")).append("\",");
        sb.append("\"address\":\"").append(escapeJson(
                booking.getAddress() != null ? booking.getAddress() : "")).append("\",");
        sb.append("\"phone\":\"").append(escapeJson(
                booking.getPhone() != null ? booking.getPhone() : "")).append("\",");
        sb.append("\"status\":\"").append(escapeJson(booking.getStatus().name())).append("\",");
        sb.append("\"imageUrls\":[");
        if (imageUrls != null && !imageUrls.isEmpty()) {
            sb.append(imageUrls.stream()
                    .map(u -> "\"" + escapeJson(u) + "\"")
                    .collect(Collectors.joining(",")));
        }
        sb.append("]}");
        return sb.toString();
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private BookingResponse toBookingResponse(Booking booking, List<String> imageUrls) {
        return BookingResponse.builder()
                .id(booking.getCode())
                .code(booking.getCode())
                .categoryCode(booking.getCategory() != null ? booking.getCategory().getCode() : null)
                .categoryName(booking.getCategory() != null ? booking.getCategory().getTitle() : null)
                .deviceTypeCode(booking.getDeviceType() != null ? booking.getDeviceType().getCode() : null)
                .deviceTypeName(booking.getDeviceType() != null ? booking.getDeviceType().getName() : null)
                .brandCode(booking.getBrand() != null ? booking.getBrand().getCode() : null)
                .brandName(booking.getBrand() != null ? booking.getBrand().getName() : null)
                .customerCode(booking.getCustomer().getCode())
                .customerName(booking.getCustomer().getFullName())
                .technicianCode(booking.getTechnician().getCode())
                .technicianName(booking.getTechnician().getFullName())
                .description(booking.getDescription())
                .urgency(booking.getUrgency().name())
                .scheduledDate(booking.getScheduledDate())
                .preferredTime(booking.getPreferredTime())
                .address(booking.getAddress())
                .phone(booking.getPhone())
                .status(booking.getStatus().name())
                .conversationId(booking.getConversation() != null ? booking.getConversation().getCode() : null)
                .imageUrls(imageUrls)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private User findAvailableTechnician(Category category) {
        List<TechnicianProfile> profiles = technicianProfileRepository
                .findByVerificationStatusAndUserDeletedFalse(
                        VerificationStatus.APPROVED);
        if (profiles.isEmpty()) return null;
        return profiles.get(0).getUser();
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
