package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.response.VnpayIpnResponse;
import com.example.becommerce.dto.mapper.MessageMapper;
import com.example.becommerce.dto.response.chat.MessageResponse;
import com.example.becommerce.entity.Conversation;
import com.example.becommerce.entity.Invoice;
import com.example.becommerce.entity.Message;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.Quotation;
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
import com.example.becommerce.repository.SystemSettingRepository;
import com.example.becommerce.repository.WalletRepository;
import com.example.becommerce.repository.WalletTransactionRepository;
import com.example.becommerce.service.PaymentGatewayService;
import com.example.becommerce.service.VoucherService;
import com.example.becommerce.service.WalletSettlementService;
import com.example.becommerce.service.WsEventPublisher;
import com.example.becommerce.utils.HmacUtils;
import com.example.becommerce.utils.TransactionCodeGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayServiceImpl implements PaymentGatewayService {

    private static final DateTimeFormatter VNPAY_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletRepository walletRepository;
    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final TransactionCodeGenerator transactionCodeGenerator;
    private final MessageMapper messageMapper;
    private final WalletSettlementService settlementService;
    private final VoucherService voucherService;
    private final WsEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Value("${app.payment.vnpay.tmn-code:}")
    private String vnpayTmnCode;
    @Value("${app.payment.vnpay.secret-key:}")
    private String vnpaySecretKey;
    @Value("${app.payment.vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayPayUrl;
    @Value("${app.payment.vnpay.return-url:http://localhost:3000/wallet/topup-result}")
    private String vnpayReturnUrl;
    @Value("${app.payment.vnpay.payment-return-url:http://localhost:3000/orders/%s}")
    private String vnpayPaymentReturnUrl;
    @Value("${app.payment.vnpay.ip-address:127.0.0.1}")
    private String vnpayIpAddress;

    @Override
    @Transactional
    public GatewayCheckoutData createCheckout(WalletTransaction transaction, PaymentMethod paymentMethod) {
        if (paymentMethod != PaymentMethod.VNPAY) {
            throw AppException.badRequest(ErrorCode.INVALID_PAYMENT_METHOD, "Hiện tại chỉ hỗ trợ thanh toán bằng VNPay");
        }
        return createVnpayCheckout(transaction);
    }

    @Override
    @Transactional
    public VnpayIpnResponse processVnpayIpn(Map<String, String> queryParams) {
        String secureHash = queryParams.get("vnp_SecureHash");
        if (secureHash == null || !isVnpaySignatureValid(queryParams, secureHash)) {
            return VnpayIpnResponse.builder().RspCode("97").Message("Invalid signature").build();
        }

        String transactionCode = queryParams.get("vnp_TxnRef");
        WalletTransaction tx = walletTransactionRepository.findByTransactionCode(transactionCode).orElse(null);
        if (tx == null) {
            return VnpayIpnResponse.builder().RspCode("01").Message("Transaction not found").build();
        }
        if (tx.getProcessedAt() != null || tx.getStatus() == TransactionStatus.SUCCESS) {
            return VnpayIpnResponse.builder().RspCode("02").Message("Already processed").build();
        }

        BigDecimal amount = new BigDecimal(queryParams.getOrDefault("vnp_Amount", "0")).divide(BigDecimal.valueOf(100));
        if (amount.compareTo(tx.getAmount()) != 0) {
            return VnpayIpnResponse.builder().RspCode("04").Message("Invalid amount").build();
        }

        boolean success = "00".equals(queryParams.get("vnp_ResponseCode"))
                && "00".equals(queryParams.get("vnp_TransactionStatus"));
        tx.setGatewayTransactionId(queryParams.get("vnp_TransactionNo"));
        tx.setGatewayPayload(toJsonSafe(queryParams));
        if (success) {
            if (tx.getType() == TransactionType.PAYMENT) {
                confirmOrderPayment(tx);
            } else {
                confirmTopupAndCreditWallet(tx);
            }
        } else {
            markTransactionFailed(tx);
        }
        return VnpayIpnResponse.builder().RspCode("00").Message("Confirm Success").build();
    }

    private GatewayCheckoutData createVnpayCheckout(WalletTransaction tx) {
        require(vnpayTmnCode, "VNPay TMN code is missing");
        require(vnpaySecretKey, "VNPay secret key is missing");

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        // vnp_ExpireDate PHẢI cùng múi giờ (GMT+7) và sau vnp_CreateDate. Không dùng
        // tx.getExpiredAt() vì nó được set bằng LocalDateTime.now() (UTC) → lệch 7 tiếng,
        // khiến ExpireDate < CreateDate → VNPay báo "giao dịch quá thời gian chờ" ngay lập tức.
        LocalDateTime expireAt = now.plusMinutes(30);

        boolean isPayment = tx.getType() == TransactionType.PAYMENT;
        String orderInfo = isPayment
                ? "Thanh toan don hang - " + tx.getTransactionCode()
                : "Nap tien vi - " + tx.getTransactionCode();
        String returnUrl = isPayment && tx.getOrder() != null
                ? String.format(vnpayPaymentReturnUrl, tx.getOrder().getCode())
                : vnpayReturnUrl;

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayTmnCode);
        params.put("vnp_Amount", tx.getAmount().multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
        params.put("vnp_CreateDate", VNPAY_TIME_FORMAT.format(now));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_IpAddr", vnpayIpAddress);
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_TxnRef", tx.getTransactionCode());
        params.put("vnp_ExpireDate", VNPAY_TIME_FORMAT.format(expireAt));

        String secureHash = HmacUtils.hmacSha512(buildVnpayQuery(params), vnpaySecretKey);
        params.put("vnp_SecureHash", secureHash);

        tx.setGatewayRequestId(tx.getTransactionCode());
        tx.setGatewayPayload(toJsonSafe(params));
        walletTransactionRepository.save(tx);

        return new GatewayCheckoutData(vnpayPayUrl + "?" + buildVnpayQuery(params), null, null);
    }

    private boolean isVnpaySignatureValid(Map<String, String> params, String secureHash) {
        Map<String, String> filtered = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if ("vnp_SecureHash".equals(entry.getKey()) || "vnp_SecureHashType".equals(entry.getKey())) {
                continue;
            }
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                filtered.put(entry.getKey(), entry.getValue());
            }
        }
        return HmacUtils.hmacSha512(buildVnpayQuery(filtered), vnpaySecretKey).equalsIgnoreCase(secureHash);
    }

    private void confirmTopupAndCreditWallet(WalletTransaction tx) {
        Wallet wallet = walletRepository.findWithLockByUser_Id(tx.getWallet().getUser().getId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy ví"));
        wallet.normalizeForPersistence();
        wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
        wallet.setTotalEarned(wallet.getTotalEarned().add(tx.getAmount()));
        // Auto-unlock the account when topping up restores the credit balance.
        settlementService.syncWalletLock(wallet, wallet.getUser());
        walletRepository.save(wallet);

        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setProcessedAt(LocalDateTime.now());
        walletTransactionRepository.save(tx);
    }

    private void confirmOrderPayment(WalletTransaction tx) {
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setProcessedAt(LocalDateTime.now());
        walletTransactionRepository.save(tx);
        
        Order order = tx.getOrder();
        if (order != null && order.getStatus() != OrderStatus.COMPLETED) {
            Invoice invoice = invoiceRepository.findByOrder_Id(order.getId()).orElse(null);
            Long payableAmount = invoice != null && invoice.getPayableAmount() != null
                    ? invoice.getPayableAmount()
                    : (invoice != null ? invoice.getTotalPrice() : order.getFinalPrice());

            order.setFinalPrice(payableAmount);
            order.setStatus(OrderStatus.COMPLETED);
            order.setCompletedAt(LocalDateTime.now());
            orderRepository.save(order);

            if (invoice != null) {
                invoice.setStatus(InvoiceStatus.PAID_VNPAY);
                invoice.setPaymentMethod("VNPAY");
                invoice.setPaidAt(LocalDateTime.now());
                invoice.setTransactionCode(tx.getTransactionCode());
                invoiceRepository.save(invoice);

                // Update the invoice message content with paid status
                updateInvoiceMessage(invoice, order);

                User customer = order.getCustomer();
                if (customer != null) {
                    try {
                        voucherService.finalizeRewards(customer, order, invoice.getVoucherCode(),
                                invoice.getPointsUsed() != null ? invoice.getPointsUsed() : 0L, payableAmount);
                    } catch (Exception ex) {
                        log.warn("Failed to finalize voucher/points rewards for order {}: {}", order.getCode(), ex.getMessage());
                    }
                }
            }

            // Unified settlement: credit the technician's PERSONAL wallet with the
            // invoice amount (bank transfer) and deduct the fixed commission fee from
            // the CREDIT wallet (negative allowed → account lock).
            settlementService.settleCompletedOrder(order, PaymentMethod.VNPAY);
            // Push realtime cho thợ biết số dư ví đã cập nhật
            // Lấy ví thợ SAU khi settlement đã chạy xong
            User technician = order.getTechnician();
            if (technician != null) {
                try {
                    walletRepository.findByUser_Id(technician.getId()).ifPresent(techWallet ->
                        eventPublisher.publishWalletUpdated(
                            technician.getCode(),
                            techWallet.getPersonalBalance() != null
                                ? techWallet.getPersonalBalance()
                                : BigDecimal.ZERO
                        )
                    );
                } catch (Exception ex) {
                    log.warn("Failed to publish wallet update event for technician {}: {}",
                        technician.getCode(), ex.getMessage());
                }
            }

            eventPublisher.publishOrderStatusChanged(
                    order.getCode(), OrderStatus.IN_PROGRESS.apiValue(), OrderStatus.COMPLETED.apiValue());
        }
    }

    private BigDecimal getFixedCommissionFee() {
        return systemSettingRepository.findByKey("fixed_commission_fee")
                .map(s -> {
                    try {
                        return new BigDecimal(s.getValue());
                    } catch (Exception ex) {
                        return new BigDecimal("10000");
                    }
                })
                .orElse(new BigDecimal("10000"));
    }

    private BigDecimal safePersonalBalance(Wallet wallet) {
        return wallet.getPersonalBalance() != null ? wallet.getPersonalBalance() : BigDecimal.ZERO;
    }

    private void updateInvoiceMessage(Invoice invoice, Order order) {
        try {
            Conversation conversation = conversationRepository.findByOrder_Id(order.getId()).orElse(null);
            if (conversation == null) return;

            Map<String, Object> updatedData = new java.util.LinkedHashMap<>();
            updatedData.put("invoiceCode", invoice.getCode());
            updatedData.put("totalPrice", invoice.getTotalPrice());
            updatedData.put("serviceName", order.getServiceName() != null ? order.getServiceName() : "");
            updatedData.put("subService", order.getSubService() != null ? order.getSubService() : "");
            updatedData.put("description", order.getDescription() != null ? order.getDescription() : "");
            updatedData.put("status", invoice.getStatus().name());
            updatedData.put("createdAt", invoice.getCreatedAt() != null ? invoice.getCreatedAt().toString() : "");
            updatedData.put("voucherCode", invoice.getVoucherCode());
            updatedData.put("discountAmount", invoice.getDiscountAmount());
            updatedData.put("pointsUsed", invoice.getPointsUsed());
            updatedData.put("pointsDiscountAmount", invoice.getPointsDiscountAmount());
            updatedData.put("payableAmount", invoice.getPayableAmount() != null ? invoice.getPayableAmount() : invoice.getTotalPrice());
            String updatedJson = objectMapper.writeValueAsString(updatedData);

            messageRepository.findByConversation_IdAndTypeOrderBySentAtDesc(conversation.getId(), MessageType.INVOICE)
                    .stream()
                    .findFirst()
                    .ifPresent(msg -> {
                        msg.setContent(updatedJson);
                        Message saved = messageRepository.save(msg);
                        MessageResponse response = messageMapper.toResponse(saved, null, null);
                        eventPublisher.publishMessageNew(conversation.getCode(), response);
                    });
        } catch (Exception e) {
            log.warn("Failed to update invoice message for invoice {}: {}", invoice.getCode(), e.getMessage());
        }
    }

    private void markTransactionFailed(WalletTransaction tx) {
        tx.setStatus(TransactionStatus.FAILED);
        tx.setProcessedAt(LocalDateTime.now());
        walletTransactionRepository.save(tx);
    }

    private String buildVnpayQuery(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) {
                sb.append('&');
            }
            sb.append(entry.getKey()).append('=').append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }
        return sb.toString();
    }

    private String toJsonSafe(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return "{}";
        }
    }

    private void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw AppException.badRequest(ErrorCode.PAYMENT_GATEWAY_ERROR, message);
        }
    }
}



