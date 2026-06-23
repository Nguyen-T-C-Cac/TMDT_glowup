package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.entity.Conversation;
import com.example.becommerce.entity.Invoice;
import com.example.becommerce.entity.Message;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.Wallet;
import com.example.becommerce.entity.WalletTransaction;
import com.example.becommerce.entity.enums.InvoiceStatus;
import com.example.becommerce.entity.enums.MessageType;
import com.example.becommerce.entity.enums.OrderStatus;
import com.example.becommerce.entity.enums.PaymentMethod;
import com.example.becommerce.entity.enums.TransactionStatus;
import com.example.becommerce.entity.enums.TransactionType;
import com.example.becommerce.entity.enums.WalletType;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.ConversationRepository;
import com.example.becommerce.repository.InvoiceRepository;
import com.example.becommerce.repository.MessageRepository;
import com.example.becommerce.repository.OrderRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.repository.WalletRepository;
import com.example.becommerce.repository.WalletTransactionRepository;
import com.example.becommerce.service.InvoiceService;
import com.example.becommerce.service.PaymentGatewayService;
import com.example.becommerce.service.WsEventPublisher;
import com.example.becommerce.utils.ConversationCodeGenerator;
import com.example.becommerce.utils.InvoiceCodeGenerator;
import com.example.becommerce.utils.MessageCodeGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final MessageCodeGenerator messageCodeGenerator;
    private final InvoiceCodeGenerator invoiceCodeGenerator;
    private final ConversationCodeGenerator conversationCodeGenerator;
    private final PaymentGatewayService paymentGatewayService;
    private final WsEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void createInvoice(String orderCode) {
        User technician = getCurrentUser();
        Order order = findOrder(orderCode);

        if (order.getTechnician() == null || !order.getTechnician().getId().equals(technician.getId())) {
            throw AppException.forbidden("Bạn không phải thợ phụ trách đơn này");
        }
        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw AppException.badRequest(ErrorCode.INVALID_ORDER_STATUS_TRANSITION,
                    "Chỉ có thể xuất hoá đơn cho đơn đang xử lý");
        }

        if (invoiceRepository.existsByOrder_Id(order.getId())) {
            throw AppException.conflict(ErrorCode.BAD_REQUEST, "Hoá đơn cho đơn này đã được tạo");
        }

        Conversation conversation = conversationRepository.findByOrder_Id(order.getId())
                .orElseGet(() ->
                    conversationRepository.findByCustomer_IdAndTechnician_Id(
                            order.getCustomer().getId(), order.getTechnician().getId())
                    .map(existing -> {
                        existing.setOrder(order);
                        Conversation saved = conversationRepository.save(existing);
                        log.info("Linked order {} to existing conversation {}", orderCode, saved.getCode());
                        return saved;
                    })
                    .orElseGet(() -> {
                        Conversation newConv = Conversation.builder()
                                .code(conversationCodeGenerator.generate())
                                .customer(order.getCustomer())
                                .technician(order.getTechnician())
                                .order(order)
                                .build();
                        Conversation saved = conversationRepository.save(newConv);
                        log.info("Auto-created conversation {} for order {}", saved.getCode(), orderCode);
                        return saved;
                    })
                );

        Long finalPrice = order.getFinalPrice() != null ? order.getFinalPrice()
                : (order.getEstimatedPrice() != null ? order.getEstimatedPrice() : 0L);

        String invoiceCode = invoiceCodeGenerator.generate();
        Invoice invoice = Invoice.builder()
                .code(invoiceCode)
                .order(order)
                .conversation(conversation)
                .technician(technician)
                .totalPrice(finalPrice)
                .status(InvoiceStatus.PENDING)
                .build();
        invoiceRepository.save(invoice);

        // Build invoice data as JSON content for the message
        String invoiceJson = buildInvoiceJson(invoice, order);

        Message message = Message.builder()
                .code(messageCodeGenerator.generate())
                .conversation(conversation)
                .sender(technician)
                .type(MessageType.INVOICE)
                .content(invoiceJson)
                .build();
        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(saved.getSentAt());
        conversationRepository.save(conversation);

        eventPublisher.publishMessageNew(conversation.getCode(), null);
        log.info("Invoice {} created for order {} by technician {}", invoiceCode, orderCode, technician.getCode());
    }

    @Override
    @Transactional
    public String createVnpayCheckout(String orderCode) {
        User customer = getCurrentUser();
        Order order = findOrder(orderCode);

        if (order.getCustomer() == null || !order.getCustomer().getId().equals(customer.getId())) {
            throw AppException.forbidden("Bạn không phải khách hàng của đơn này");
        }

        Invoice invoice = invoiceRepository.findByOrder_Id(order.getId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy hoá đơn cho đơn này"));

        if (invoice.getStatus() != InvoiceStatus.PENDING) {
            throw AppException.badRequest(ErrorCode.BAD_REQUEST, "Hoá đơn đã được thanh toán");
        }

        // Create a WalletTransaction for the payment
        Wallet customerWallet = walletRepository.findByUser_Id(customer.getId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy ví của khách hàng"));

        WalletTransaction transaction = WalletTransaction.builder()
                .transactionCode("PAY-" + invoice.getCode() + "-" + System.currentTimeMillis())
                .wallet(customerWallet)
                .order(order)
                .type(TransactionType.PAYMENT)
                .walletType(WalletType.PERSONAL)
                .category("ORDER_PAYMENT")
                .title("Thanh toán đơn hàng " + orderCode)
                .amount(BigDecimal.valueOf(invoice.getTotalPrice()))
                .fee(BigDecimal.ZERO)
                .netAmount(BigDecimal.valueOf(invoice.getTotalPrice()))
                .note("Thanh toán hoá đơn " + invoice.getCode())
                .actor("CUSTOMER")
                .status(TransactionStatus.AWAITING_PAYMENT)
                .paymentMethod(PaymentMethod.VNPAY)
                .expiredAt(LocalDateTime.now().plusMinutes(30))
                .build();

        transaction = walletTransactionRepository.save(transaction);

        // Update invoice with transaction code
        invoice.setTransactionCode(transaction.getTransactionCode());
        invoiceRepository.save(invoice);

        PaymentGatewayService.GatewayCheckoutData checkout = paymentGatewayService.createCheckout(transaction, PaymentMethod.VNPAY);
        return checkout.checkoutUrl();
    }

    @Override
    @Transactional
    public void confirmCashPayment(String orderCode) {
        User technician = getCurrentUser();
        Order order = findOrder(orderCode);

        if (order.getTechnician() == null || !order.getTechnician().getId().equals(technician.getId())) {
            throw AppException.forbidden("Bạn không phải thợ phụ trách đơn này");
        }

        Invoice invoice = invoiceRepository.findByOrder_Id(order.getId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy hoá đơn cho đơn này"));

        if (invoice.getStatus() != InvoiceStatus.PENDING) {
            throw AppException.badRequest(ErrorCode.BAD_REQUEST, "Hoá đơn đã được thanh toán");
        }

        // Deduct from technician's credit wallet (commission)
        Wallet techWallet = walletRepository.findWithLockByUser_Id(technician.getId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy ví của thợ"));

        BigDecimal amount = BigDecimal.valueOf(invoice.getTotalPrice());
        techWallet.normalizeForPersistence();
        if (techWallet.getBalance().compareTo(amount) < 0) {
            throw AppException.badRequest(ErrorCode.INSUFFICIENT_BALANCE,
                    "Số dư ví tín dụng không đủ để xác nhận. Vui lòng nạp thêm.");
        }
        techWallet.setBalance(techWallet.getBalance().subtract(amount));
        walletRepository.save(techWallet);

        // Record credit deduction transaction
        WalletTransaction deduction = WalletTransaction.builder()
                .transactionCode("CASH-" + invoice.getCode())
                .wallet(techWallet)
                .order(order)
                .type(TransactionType.PAYMENT)
                .walletType(WalletType.CREDIT)
                .category("CASH_CONFIRM")
                .title("Xác nhận thu tiền mặt - " + orderCode)
                .amount(amount.negate())
                .fee(BigDecimal.ZERO)
                .netAmount(amount.negate())
                .afterBalance(techWallet.getBalance().longValueExact())
                .note("Thợ xác nhận đã thu tiền mặt từ khách")
                .actor("TECHNICIAN")
                .status(TransactionStatus.SUCCESS)
                .processedAt(LocalDateTime.now())
                .build();
        walletTransactionRepository.save(deduction);

        // Update invoice
        invoice.setStatus(InvoiceStatus.PAID_CASH);
        invoice.setPaymentMethod("CASH");
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setTransactionCode(deduction.getTransactionCode());
        invoiceRepository.save(invoice);

        // Complete the order
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        orderRepository.save(order);

        eventPublisher.publishOrderStatusChanged(
                order.getCode(), OrderStatus.IN_PROGRESS.apiValue(), OrderStatus.COMPLETED.apiValue());

        log.info("Cash payment confirmed for order {} by technician {}", orderCode, technician.getCode());
    }

    private String buildInvoiceJson(Invoice invoice, Order order) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "invoiceCode", invoice.getCode(),
                    "totalPrice", invoice.getTotalPrice(),
                    "serviceName", order.getServiceName() != null ? order.getServiceName() : "",
                    "subService", order.getSubService() != null ? order.getSubService() : "",
                    "description", order.getDescription() != null ? order.getDescription() : "",
                    "status", invoice.getStatus().name(),
                    "createdAt", invoice.getCreatedAt() != null ? invoice.getCreatedAt().toString() : ""
            ));
        } catch (Exception e) {
            return "{}";
        }
    }

    private Order findOrder(String code) {
        return orderRepository.findByCodeAndDeletedFalse(code)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy đơn hàng " + code));
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
