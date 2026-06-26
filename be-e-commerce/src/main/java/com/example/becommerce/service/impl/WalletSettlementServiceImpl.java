package com.example.becommerce.service.impl;

import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.PointTransaction;
import com.example.becommerce.entity.TechnicianProfile;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.Wallet;
import com.example.becommerce.entity.WalletTransaction;
import com.example.becommerce.entity.enums.PaymentMethod;
import com.example.becommerce.entity.enums.PointTxType;
import com.example.becommerce.entity.enums.TransactionStatus;
import com.example.becommerce.entity.enums.TransactionType;
import com.example.becommerce.entity.enums.WalletStatus;
import com.example.becommerce.entity.enums.WalletType;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.OrderRepository;
import com.example.becommerce.repository.PointTransactionRepository;
import com.example.becommerce.repository.SystemSettingRepository;
import com.example.becommerce.repository.TechnicianProfileRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.repository.WalletRepository;
import com.example.becommerce.repository.WalletTransactionRepository;
import com.example.becommerce.service.WalletSettlementService;
import com.example.becommerce.utils.TransactionCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletSettlementServiceImpl implements WalletSettlementService {

    private static final BigDecimal DEFAULT_FEE = new BigDecimal("10000");
    private static final BigDecimal DEFAULT_MIN_BALANCE = new BigDecimal("20000");

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final TechnicianProfileRepository technicianProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final TransactionCodeGenerator txCodeGenerator;

    @Override
    @Transactional
    public void settleCompletedOrder(Order order, PaymentMethod method) {
        if (order == null) {
            return;
        }
        if (order.isSettled()) {
            log.info("Order {} already settled, skipping", order.getCode());
            return;
        }

        User technician = order.getTechnician();
        if (technician == null || order.getFinalPrice() == null || order.getFinalPrice() <= 0) {
            order.setSettled(true);
            orderRepository.save(order);
            return;
        }

        BigDecimal finalPrice = BigDecimal.valueOf(order.getFinalPrice());
        BigDecimal fee = getSetting("fixed_commission_fee", DEFAULT_FEE);
        boolean bankTransfer = method != null && method.isBankTransfer();

        Wallet wallet = walletRepository.findWithLockByUser_Id(technician.getId())
                .orElseGet(() -> walletRepository.save(Wallet.builder()
                        .user(technician)
                        .balance(BigDecimal.ZERO)
                        .personalBalance(BigDecimal.ZERO)
                        .currency("VND")
                        .build()));
        wallet.normalizeForPersistence();

        // 1) Credit the PERSONAL wallet only for bank-transfer payments.
        if (bankTransfer) {
            BigDecimal personalAfter = wallet.getPersonalBalance().add(finalPrice);
            recordTransaction(wallet, order, WalletType.PERSONAL, "REVENUE",
                    "Thu nhập đơn " + order.getCode(), finalPrice, personalAfter,
                    "Cộng " + finalPrice + " từ đơn " + order.getCode() + " (chuyển khoản)");
            wallet.setPersonalBalance(personalAfter);
            wallet.setTotalEarned(wallet.getTotalEarned().add(finalPrice));
        }

        // 2) Always deduct the fixed commission fee from the CREDIT wallet (negative allowed).
        BigDecimal creditAfter = wallet.getBalance().subtract(fee);
        recordTransaction(wallet, order, WalletType.CREDIT, "COMMISSION_DEDUCTION",
                "Trừ phí hoa hồng đơn " + order.getCode(), fee.negate(), creditAfter,
                "Phí hoa hồng cố định cho đơn " + order.getCode());
        wallet.setBalance(creditAfter);

        // 3) Recompute wallet status + lock the technician if the credit wallet is too low.
        syncWalletLock(wallet, technician);
        walletRepository.save(wallet);

        // 4) Award reward points (TN4).
        awardPoints(technician, order, finalPrice);

        order.setSettled(true);
        orderRepository.save(order);
        log.info("Settled order {} method={} bankTransfer={} fee={} creditAfter={}",
                order.getCode(), method, bankTransfer, fee, creditAfter);
    }

    @Override
    @Transactional(readOnly = true)
    public void assertActorNotLocked(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            if (user.isLocked()) {
                throw AppException.forbidden(user.getLockedReason() != null
                        ? user.getLockedReason()
                        : "Tài khoản đang bị khoá do ví tín dụng âm, vui lòng nạp tiền để mở khoá");
            }
        });
    }

    @Override
    @Transactional
    public void syncWalletLock(Wallet wallet, User owner) {
        BigDecimal minBalance = getSetting("minimum_commission_balance", DEFAULT_MIN_BALANCE);
        BigDecimal lockThreshold = getSetting("refund_lock_threshold", BigDecimal.ZERO);
        boolean autoLock = getBooleanSetting("auto_lock_enabled", true);

        wallet.setWalletStatus(WalletStatus.fromBalance(wallet.getBalance(), minBalance));

        boolean belowThreshold = wallet.getBalance().compareTo(lockThreshold) < 0;
        if (autoLock && belowThreshold && !owner.isLocked()) {
            owner.setLocked(true);
            owner.setLockedReason("Ví tín dụng âm (" + wallet.getBalance()
                    + "đ), vui lòng nạp tiền để mở khoá tài khoản");
            userRepository.save(owner);
            log.warn("Locked user {} due to credit balance {}", owner.getCode(), wallet.getBalance());
        } else if (!belowThreshold && owner.isLocked()) {
            owner.setLocked(false);
            owner.setLockedReason(null);
            userRepository.save(owner);
            log.info("Unlocked user {} after credit balance recovered to {}", owner.getCode(), wallet.getBalance());
        }
    }

    /**
     * Award reward points for a completed order:
     * {@code points = points_per_order + floor(finalPrice * points_rate / 100)}.
     * Both factors are admin-configurable via system_settings; either can be 0.
     */
    private void awardPoints(User technician, Order order, BigDecimal finalPrice) {
        long fixed = getSetting("points_per_order", BigDecimal.ZERO).longValue();
        BigDecimal rate = getSetting("points_rate", BigDecimal.ZERO);
        long fromRate = finalPrice.multiply(rate)
                .divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.DOWN)
                .longValue();
        long earned = fixed + fromRate;
        if (earned <= 0) {
            return;
        }

        TechnicianProfile profile = technicianProfileRepository.findByUser_Id(technician.getId()).orElse(null);
        if (profile == null) {
            log.warn("No technician profile for user {}, skipping points award", technician.getCode());
            return;
        }

        long balanceAfter = profile.getRewardPoints() + earned;
        profile.setRewardPoints(balanceAfter);
        technicianProfileRepository.save(profile);

        pointTransactionRepository.save(PointTransaction.builder()
                .technician(technician)
                .order(order)
                .points(earned)
                .balanceAfter(balanceAfter)
                .type(PointTxType.ORDER_COMPLETED)
                .note("Đơn " + order.getCode())
                .build());
        log.info("Awarded {} points to technician {} (balance={})", earned, technician.getCode(), balanceAfter);
    }

    private void recordTransaction(Wallet wallet, Order order, WalletType walletType, String category,
                                   String title, BigDecimal amount, BigDecimal afterBalance, String note) {
        walletTransactionRepository.save(WalletTransaction.builder()
                .transactionCode(txCodeGenerator.generateTransactionCode(TransactionType.COMMISSION))
                .wallet(wallet)
                .order(order)
                .type(TransactionType.COMMISSION)
                .walletType(walletType)
                .category(category)
                .title(title)
                .amount(amount)
                .fee(BigDecimal.ZERO)
                .netAmount(amount)
                .afterBalance(afterBalance.longValueExact())
                .relatedOrderCode(order.getCode())
                .note(note)
                .actor("SYSTEM")
                .status(TransactionStatus.SUCCESS)
                .processedAt(LocalDateTime.now())
                .build());
    }

    private BigDecimal getSetting(String key, BigDecimal def) {
        return systemSettingRepository.findByKey(key)
                .map(s -> {
                    try {
                        return new BigDecimal(s.getValue().trim());
                    } catch (Exception ex) {
                        return def;
                    }
                })
                .orElse(def);
    }

    private boolean getBooleanSetting(String key, boolean def) {
        return systemSettingRepository.findByKey(key)
                .map(s -> "true".equalsIgnoreCase(s.getValue().trim()) || "1".equals(s.getValue().trim()))
                .orElse(def);
    }
}
