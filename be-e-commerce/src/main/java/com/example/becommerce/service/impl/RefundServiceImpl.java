package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.request.admin.RefundRequest;
import com.example.becommerce.dto.response.PagedResponse;
import com.example.becommerce.dto.response.admin.RefundResponse;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.Refund;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.Wallet;
import com.example.becommerce.entity.WalletTransaction;
import com.example.becommerce.entity.enums.OrderStatus;
import com.example.becommerce.entity.enums.RefundStatus;
import com.example.becommerce.entity.enums.TransactionStatus;
import com.example.becommerce.entity.enums.TransactionType;
import com.example.becommerce.entity.enums.WalletType;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.OrderRepository;
import com.example.becommerce.repository.RefundRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.repository.WalletRepository;
import com.example.becommerce.repository.WalletTransactionRepository;
import com.example.becommerce.service.RefundService;
import com.example.becommerce.service.WalletSettlementService;
import com.example.becommerce.utils.TransactionCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final WalletSettlementService settlementService;
    private final TransactionCodeGenerator txCodeGenerator;

    @Override
    @Transactional
    public RefundResponse createRefund(String orderCode, RefundRequest request) {
        User admin = getCurrentUser();

        Order order = orderRepository.findByCodeAndDeletedFalse(orderCode)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy đơn hàng " + orderCode));

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw AppException.badRequest(ErrorCode.BAD_REQUEST,
                    "Chỉ có thể hoàn tiền cho đơn đã hoàn thành/đã thanh toán");
        }

        BigDecimal amount = request.getAmount();
        BigDecimal orderTotal = order.getFinalPrice() != null
                ? BigDecimal.valueOf(order.getFinalPrice()) : BigDecimal.ZERO;
        BigDecimal alreadyRefunded = refundRepository.sumCompletedByOrder(order.getId());
        if (amount.add(alreadyRefunded).compareTo(orderTotal) > 0) {
            throw AppException.badRequest(ErrorCode.BAD_REQUEST,
                    "Tổng tiền hoàn (" + amount.add(alreadyRefunded) + ") vượt giá trị đơn (" + orderTotal + ")");
        }

        User customer = order.getCustomer();
        if (customer == null) {
            throw AppException.badRequest(ErrorCode.BAD_REQUEST, "Đơn không có khách hàng để hoàn tiền");
        }
        User technician = order.getTechnician();

        Refund refund = refundRepository.save(Refund.builder()
                .code(txCodeGenerator.generateTransactionCode(TransactionType.REFUND))
                .order(order)
                .customer(customer)
                .technician(technician)
                .amount(amount)
                .reason(request.getReason())
                .status(RefundStatus.PENDING)
                .createdBy(admin)
                .build());

        // 1) Advance the refund to the customer's personal wallet.
        Wallet customerWallet = walletRepository.findWithLockByUser_Id(customer.getId())
                .orElseGet(() -> walletRepository.save(Wallet.builder()
                        .user(customer).balance(BigDecimal.ZERO)
                        .personalBalance(BigDecimal.ZERO).currency("VND").build()));
        customerWallet.normalizeForPersistence();
        BigDecimal customerAfter = customerWallet.getPersonalBalance().add(amount);
        saveRefundTx(customerWallet, order, WalletType.PERSONAL, "ORDER_REFUND",
                "Hoàn tiền đơn " + order.getCode(), amount, customerAfter, "ADMIN",
                "Admin hoàn tiền cho khách: " + safeReason(request));
        customerWallet.setPersonalBalance(customerAfter);
        walletRepository.save(customerWallet);

        // 2) Deduct from the technician's credit wallet (negative allowed).
        BigDecimal technicianAfter = BigDecimal.ZERO;
        boolean technicianDebt = false;
        if (technician != null) {
            Wallet techWallet = walletRepository.findWithLockByUser_Id(technician.getId())
                    .orElseGet(() -> walletRepository.save(Wallet.builder()
                            .user(technician).balance(BigDecimal.ZERO)
                            .personalBalance(BigDecimal.ZERO).currency("VND").build()));
            techWallet.normalizeForPersistence();
            technicianAfter = techWallet.getBalance().subtract(amount);
            saveRefundTx(techWallet, order, WalletType.CREDIT, "REFUND_DEDUCTION",
                    "Trừ hoàn tiền đơn " + order.getCode(), amount.negate(), technicianAfter, "ADMIN",
                    "Trừ do admin hoàn tiền khách: " + safeReason(request));
            techWallet.setBalance(technicianAfter);

            // 3) Lock the technician account if the credit wallet went negative.
            settlementService.syncWalletLock(techWallet, technician);
            walletRepository.save(techWallet);
            technicianDebt = technicianAfter.signum() < 0;
        }

        refund.setStatus(RefundStatus.COMPLETED);
        refund.setTechnicianDebt(technicianDebt);
        refund.setResolvedAt(LocalDateTime.now());
        refundRepository.save(refund);

        log.info("Refund {} of {} for order {} by admin {} (technicianDebt={})",
                refund.getCode(), amount, order.getCode(), admin.getCode(), technicianDebt);

        boolean technicianLocked = technician != null && technician.isLocked();
        return RefundResponse.of(refund, technicianAfter, technicianLocked);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RefundResponse> getRefunds(int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        Page<Refund> result = refundRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(safePage - 1, safeSize));
        return PagedResponse.of(
                result.getContent().stream().map(RefundResponse::ofSummary).toList(),
                safePage, safeSize, result.getTotalElements());
    }

    private void saveRefundTx(Wallet wallet, Order order, WalletType walletType, String category,
                              String title, BigDecimal amount, BigDecimal afterBalance,
                              String actor, String note) {
        walletTransactionRepository.save(WalletTransaction.builder()
                .transactionCode(txCodeGenerator.generateTransactionCode(TransactionType.REFUND))
                .wallet(wallet)
                .order(order)
                .type(TransactionType.REFUND)
                .walletType(walletType)
                .category(category)
                .title(title)
                .amount(amount)
                .fee(BigDecimal.ZERO)
                .netAmount(amount)
                .afterBalance(afterBalance.longValueExact())
                .relatedOrderCode(order.getCode())
                .note(note)
                .actor(actor)
                .status(TransactionStatus.SUCCESS)
                .processedAt(LocalDateTime.now())
                .build());
    }

    private String safeReason(RefundRequest request) {
        return request.getReason() == null || request.getReason().isBlank()
                ? "(không ghi lý do)" : request.getReason();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw AppException.unauthorized("Người dùng chưa đăng nhập");
        }
        return userRepository.findByEmailAndDeletedFalse(authentication.getName())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng hiện tại"));
    }
}
