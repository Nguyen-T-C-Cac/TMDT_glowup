package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.mapper.ConversationMapper;
import com.example.becommerce.dto.mapper.MessageMapper;
import com.example.becommerce.dto.request.chat.CreateConversationRequest;
import com.example.becommerce.dto.request.chat.SendMessageRequest;
import com.example.becommerce.dto.response.PagedResponse;
import com.example.becommerce.dto.response.chat.ConversationCreatedResponse;
import com.example.becommerce.dto.response.chat.ConversationListItemResponse;
import com.example.becommerce.dto.response.chat.MessageResponse;
import com.example.becommerce.entity.Conversation;
import com.example.becommerce.entity.Message;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.enums.MessageType;
import com.example.becommerce.entity.enums.NotificationType;
import com.example.becommerce.entity.enums.Role;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.ConversationRepository;
import com.example.becommerce.repository.MessageRepository;
import com.example.becommerce.repository.OrderRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.service.ConversationService;
import com.example.becommerce.service.NotificationService;
import com.example.becommerce.service.WsEventPublisher;
import com.example.becommerce.utils.ConversationCodeGenerator;
import com.example.becommerce.utils.MessageCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Business rules for chat:
 *  - A conversation links exactly one customer and one technician.
 *  - Customers and technicians can both list & read; the participant model
 *    keys off whichever side the caller belongs to.
 *  - {@link Conversation#getCustomerLastReadAt()} /
 *    {@link Conversation#getTechnicianLastReadAt()} act as the read watermark.
 *  - Calling GET /messages bumps the watermark for the caller; this is how
 *    unread counters reset.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository      conversationRepository;
    private final MessageRepository           messageRepository;
    private final OrderRepository             orderRepository;
    private final UserRepository              userRepository;
    private final ConversationMapper          conversationMapper;
    private final MessageMapper               messageMapper;
    private final ConversationCodeGenerator   conversationCodeGenerator;
    private final MessageCodeGenerator        messageCodeGenerator;
    private final WsEventPublisher            eventPublisher;
    private final NotificationService         notificationService;

    // ===============================================================
    // LIST CONVERSATIONS
    // ===============================================================

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ConversationListItemResponse> listConversations(int page, int limit) {
        User viewer = getCurrentUser();

        Pageable pageable = PageRequest.of(
                Math.max(0, page - 1),
                limit);

        Page<Conversation> convPage = conversationRepository.findAllForUser(viewer.getId(), pageable);

        List<ConversationListItemResponse> items = convPage.getContent().stream()
                .map(c -> {
                    Message last = messageRepository
                            .findTopByConversation_IdOrderBySentAtDesc(c.getId())
                            .orElse(null);
                    LocalDateTime watermark = readWatermark(c, viewer);
                    long unread = countUnreadForParticipant(c.getId(), viewer.getId(), watermark);
                    return conversationMapper.toListItem(c, viewer, last, unread);
                })
                .filter(item -> item != null && item.getPartner() != null)
                .toList();

        return PagedResponse.of(items, page, limit, convPage.getTotalElements());
    }

    // ===============================================================
    // CREATE CONVERSATION
    // ===============================================================

    @Override
    @Transactional
    public ConversationCreatedResponse createConversation(CreateConversationRequest request) {
        User currentUser = getCurrentUser();

        // Admin can create conversations with customers or technicians
        if (currentUser.getRole() == Role.ADMIN) {
            return createAdminConversation(currentUser, request);
        }

        // Regular flow: customer starts a chat with technician
        if (currentUser.getRole() != Role.CUSTOMER) {
            throw AppException.forbidden("Chỉ khách hàng mới có thể mở cuộc trò chuyện");
        }

        User technician = userRepository.findByCodeAndDeletedFalse(request.getTechnicianId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy thợ " + request.getTechnicianId()));
        if (technician.getRole() != Role.TECHNICIAN) {
            throw AppException.badRequest(ErrorCode.VALIDATION_ERROR,
                    "Tài khoản đối tác không phải là thợ");
        }

        Optional<Conversation> existing = conversationRepository
                .findFirstByCustomer_IdAndTechnician_IdOrderByLastMessageAtDesc(currentUser.getId(), technician.getId());
        boolean isNewConversation = existing.isEmpty();

        Conversation conversation = existing.orElseGet(() -> Conversation.builder()
                .code(conversationCodeGenerator.generate())
                .customer(currentUser)
                .technician(technician)
                .build());

        if (request.getOrderId() != null && !request.getOrderId().isBlank()) {
            Order order = orderRepository.findByCodeAndDeletedFalse(request.getOrderId())
                    .orElseThrow(() -> AppException.notFound("Không tìm thấy đơn " + request.getOrderId()));
            conversation.setOrder(order);
        }

        Conversation saved = conversationRepository.save(conversation);
        log.info("Conversation {} between customer={} technician={} (order={})",
                saved.getCode(), currentUser.getCode(), technician.getCode(),
                saved.getOrder() == null ? "-" : saved.getOrder().getCode());

        if (isNewConversation) {
            notifyChatRecipient(
                    technician,
                    currentUser.getFullName(),
                    "Khách hàng mới muốn trò chuyện",
                    currentUser.getFullName() + " đã mở cuộc trò chuyện với bạn.",
                    saved);
        }

        return conversationMapper.toCreatedResponse(saved, currentUser);
    }

    // ===============================================================
    // LIST MESSAGES
    // ===============================================================

    @Override
    @Transactional
    public PagedResponse<MessageResponse> listMessages(String conversationCode, int page, int limit) {
        Conversation conversation = findConversation(conversationCode);
        User viewer = getCurrentUser();
        ensureParticipant(conversation, viewer);

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit);
        Page<Message> msgPage = messageRepository.findByConversation_IdOrderBySentAtDesc(
                conversation.getId(), pageable);

        // Snapshot watermark BEFORE updating it so we still mark current page
        // as read appropriately on the FE.
        LocalDateTime watermark = readWatermark(conversation, viewer);

        List<MessageResponse> items = msgPage.getContent().stream()
                .map(m -> messageMapper.toResponse(m, viewer, watermark))
                .toList();

        // Bump caller's watermark to NOW
        LocalDateTime now = LocalDateTime.now();
        if (viewer.getId().equals(conversation.getCustomer().getId())) {
            conversation.setCustomerLastReadAt(now);
        } else {
            conversation.setTechnicianLastReadAt(now);
        }
        conversationRepository.save(conversation);

        return PagedResponse.of(items, page, limit, msgPage.getTotalElements());
    }

    // ===============================================================
    // SEND MESSAGE
    // ===============================================================

    @Override
    @Transactional
    public MessageResponse sendMessage(String conversationCode, SendMessageRequest request) {
        Conversation conversation = findConversation(conversationCode);
        User sender = getCurrentUser();
        ensureParticipant(conversation, sender);

        MessageType type;
        try {
            type = MessageType.from(request.getType());
        } catch (IllegalArgumentException ex) {
            throw AppException.badRequest(ErrorCode.VALIDATION_ERROR, "Loại tin nhắn không hợp lệ");
        }
        if (type == MessageType.QUOTATION) {
            throw AppException.badRequest(ErrorCode.VALIDATION_ERROR,
                    "Quotation phải được tạo qua /quotes endpoint");
        }

        Message message = Message.builder()
                .code(messageCodeGenerator.generate())
                .conversation(conversation)
                .sender(sender)
                .type(type)
                .content(request.getContent())
                .title(request.getTitle())
                .build();
        Message saved = messageRepository.save(message);

        // Touch conversation so listing sorts correctly.
        conversation.setLastMessageAt(saved.getSentAt());
        conversationRepository.save(conversation);

        MessageResponse response = messageMapper.toResponse(saved, sender, readWatermark(conversation, sender));
        eventPublisher.publishMessageNew(conversation.getCode(), response);

        User recipient = conversationMapper.partnerOf(conversation, sender);
        if (recipient != null) {
            String preview = request.getContent() == null ? "" : request.getContent().trim();
            if (preview.length() > 120) {
                preview = preview.substring(0, 117) + "...";
            }
            notifyChatRecipient(
                    recipient,
                    sender.getFullName(),
                    "Tin nhắn mới từ " + sender.getFullName(),
                    preview.isBlank() ? "Bạn có tin nhắn mới" : preview,
                    conversation);
        }

        return response;
    }

    // ===============================================================
    // DELETE CONVERSATION (per-user soft delete)
    // ===============================================================

    @Override
    @Transactional
    public void deleteConversation(String conversationCode) {
        Conversation conversation = findConversation(conversationCode);
        User viewer = getCurrentUser();
        ensureParticipant(conversation, viewer);

        LocalDateTime now = LocalDateTime.now();
        boolean isCustomer = conversation.getCustomer() != null
                && conversation.getCustomer().getId().equals(viewer.getId());
        boolean isTechnician = conversation.getTechnician() != null
                && conversation.getTechnician().getId().equals(viewer.getId());

        if (isCustomer) {
            conversation.setCustomerDeletedAt(now);
        } else if (isTechnician) {
            conversation.setTechnicianDeletedAt(now);
        } else {
            // Admin không thuộc một trong hai phía thì không có "hộp thoại của mình" để xóa.
            throw AppException.forbidden("Không thể xóa cuộc trò chuyện này");
        }
        conversationRepository.save(conversation);
        log.info("Conversation {} soft-deleted for user {}", conversation.getCode(), viewer.getCode());
    }

    // ===============================================================
    // Admin conversation helpers
    // ===============================================================

    /**
     * Admin creates a conversation with either a customer or a technician.
     * The admin is stored as one side of the conversation (technician for admin-customer,
     * customer for admin-technician) to fit the existing schema.
     */
    @Transactional
    protected ConversationCreatedResponse createAdminConversation(User admin,
                                                                    CreateConversationRequest request) {
        User customer;
        User technician;

        if (request.getCustomerId() != null && !request.getCustomerId().isBlank()) {
            // Admin messaging a customer — admin takes the technician slot
            customer = userRepository.findByCodeAndDeletedFalse(request.getCustomerId())
                    .orElseThrow(() -> AppException.notFound(
                            "Không tìm thấy khách hàng " + request.getCustomerId()));
            if (customer.getRole() != Role.CUSTOMER) {
                throw AppException.badRequest(ErrorCode.VALIDATION_ERROR,
                        "Tài khoản không phải là khách hàng");
            }
            technician = admin;
        } else if (request.getTechnicianId() != null && !request.getTechnicianId().isBlank()) {
            // Admin messaging a technician — admin takes the customer slot
            customer = admin;
            technician = userRepository.findByCodeAndDeletedFalse(request.getTechnicianId())
                    .orElseThrow(() -> AppException.notFound(
                            "Không tìm thấy thợ " + request.getTechnicianId()));
            if (technician.getRole() != Role.TECHNICIAN) {
                throw AppException.badRequest(ErrorCode.VALIDATION_ERROR,
                        "Tài khoản không phải là thợ");
            }
        } else {
            throw AppException.badRequest(ErrorCode.VALIDATION_ERROR,
                    "Vui lòng cung cấp customerId hoặc technicianId");
        }

        // Check for existing admin-user conversation
        Optional<Conversation> existing = conversationRepository
                .findFirstByCustomer_IdAndTechnician_IdOrderByLastMessageAtDesc(customer.getId(), technician.getId());
        boolean isNewConversation = existing.isEmpty();

        Conversation conversation = existing.orElseGet(() -> Conversation.builder()
                .code(conversationCodeGenerator.generate())
                .customer(customer)
                .technician(technician)
                .build());

        if (request.getOrderId() != null && !request.getOrderId().isBlank()) {
            Order order = orderRepository.findByCodeAndDeletedFalse(request.getOrderId())
                    .orElseThrow(() -> AppException.notFound("Không tìm thấy đơn " + request.getOrderId()));
            conversation.setOrder(order);
        }

        Conversation saved = conversationRepository.save(conversation);
        log.info("Admin conversation {} between admin={} and partner={} (order={})",
                saved.getCode(), admin.getCode(),
                customer.getId().equals(admin.getId()) ? technician.getCode() : customer.getCode(),
                saved.getOrder() == null ? "-" : saved.getOrder().getCode());

        if (isNewConversation) {
            User recipient = customer.getId().equals(admin.getId()) ? technician : customer;
            notifyChatRecipient(
                    recipient,
                    "Quản trị viên",
                    "Tin nhắn từ quản trị viên",
                    "Quản trị viên nền tảng đã gửi tin nhắn cho bạn.",
                    saved);
        }

        return conversationMapper.toCreatedResponse(saved, admin);
    }

    // ===============================================================
    // Helpers
    // ===============================================================

    private void notifyChatRecipient(User recipient, String senderName, String title, String body,
                                     Conversation conversation) {
        try {
            notificationService.createNotification(
                    recipient,
                    NotificationType.CHAT_MESSAGE,
                    title,
                    body,
                    Map.of(
                            "conversationId", conversation.getCode(),
                            "senderName", senderName,
                            "orderId", conversation.getOrder() == null
                                    ? ""
                                    : conversation.getOrder().getCode()));
        } catch (Exception ex) {
            log.warn("Failed to push chat notification to {}: {}", recipient.getCode(), ex.getMessage());
        }
    }

    private long countUnreadForParticipant(Long conversationId, Long userId, LocalDateTime watermark) {
        if (watermark == null) {
            return messageRepository.countUnreadAll(conversationId, userId);
        }
        return messageRepository.countUnreadSince(conversationId, userId, watermark);
    }

    private LocalDateTime readWatermark(Conversation conversation, User user) {
        if (conversation.getCustomer() != null && conversation.getCustomer().getId().equals(user.getId())) {
            return conversation.getCustomerLastReadAt();
        }
        if (conversation.getTechnician() != null && conversation.getTechnician().getId().equals(user.getId())) {
            return conversation.getTechnicianLastReadAt();
        }
        return null;
    }

    private void ensureParticipant(Conversation conversation, User user) {
        if (user.getRole() == Role.ADMIN) return;
        boolean ok = (conversation.getCustomer() != null
                        && conversation.getCustomer().getId().equals(user.getId()))
                || (conversation.getTechnician() != null
                        && conversation.getTechnician().getId().equals(user.getId()));
        if (!ok) {
            throw AppException.forbidden("Bạn không phải thành viên của cuộc trò chuyện này");
        }
    }

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
