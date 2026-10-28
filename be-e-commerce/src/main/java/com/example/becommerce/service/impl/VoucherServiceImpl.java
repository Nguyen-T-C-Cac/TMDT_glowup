package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.response.InvoiceDiscountResponse;
import com.example.becommerce.dto.response.VoucherResponse;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.UserVoucher;
import com.example.becommerce.entity.Voucher;
import com.example.becommerce.entity.Wallet;
import com.example.becommerce.entity.enums.UserVoucherStatus;
import com.example.becommerce.entity.enums.VoucherDiscountType;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.SystemSettingRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.repository.UserVoucherRepository;
import com.example.becommerce.repository.VoucherRepository;
import com.example.becommerce.repository.WalletRepository;
import com.example.becommerce.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    /** Never let a voucher/points combo push the payable amount below this. */
    private static final long MIN_PAYABLE_AMOUNT = 1000L;

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final WalletRepository walletRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final UserRepository userRepository;

    @Override
    public List<VoucherResponse> listAvailableVouchers() {
        User current = getCurrentUserOrNull();
        List<Voucher> vouchers = voucherRepository.findByActiveTrueOrderByCreatedAtDesc();

        return vouchers.stream()
                .filter(v -> !v.isExpired())
                .filter(v -> v.getQuota() == null || userVoucherRepository.countByVoucher_Id(v.getId()) < v.getQuota())
                .map(v -> toResponse(v, current))
                .toList();
    }

    @Override
    public List<VoucherResponse> listSavedVouchers() {
        User current = getCurrentUser();
        return userVoucherRepository.findByUser_IdAndStatusOrderBySavedAtDesc(current.getId(), UserVoucherStatus.SAVED)
                .stream()
                .filter(uv -> !uv.getVoucher().isExpired())
                .map(uv -> toResponse(uv.getVoucher(), true, false))
                .toList();
    }

    @Override
    @Transactional
    public VoucherResponse saveVoucher(String code) {
        User current = getCurrentUser();
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy voucher"));

        if (!voucher.isActive() || voucher.isExpired()) {
            throw AppException.badRequest(ErrorCode.VOUCHER_EXPIRED, "Voucher đã hết hạn hoặc không còn khả dụng");
        }
        if (voucher.getQuota() != null && userVoucherRepository.countByVoucher_Id(voucher.getId()) >= voucher.getQuota()) {
            throw AppException.badRequest(ErrorCode.VOUCHER_OUT_OF_QUOTA, "Voucher đã hết lượt lưu");
        }

        userVoucherRepository.findByUser_IdAndVoucher_Id(current.getId(), voucher.getId())
                .ifPresent(existing -> {
                    throw AppException.conflict(ErrorCode.VOUCHER_ALREADY_SAVED, "Bạn đã lưu voucher này rồi");
                });

        UserVoucher saved = UserVoucher.builder()
                .user(current)
                .voucher(voucher)
                .status(UserVoucherStatus.SAVED)
                .build();
        userVoucherRepository.save(saved);

        log.info("User {} saved voucher {}", current.getCode(), voucher.getCode());
        return toResponse(voucher, true, false);
    }

    @Override
    public long getMyRewardPoints() {
        User current = getCurrentUser();
        return walletRepository.findByUser_Id(current.getId())
                .map(Wallet::getRewardPoints)
                .orElse(0L);
    }

    @Override
    @Transactional
    public InvoiceDiscountResponse computeDiscount(User customer, String invoiceCode, long totalPrice,
                                                    String voucherCode, Long pointsToUse) {
        long availablePoints = walletRepository.findByUser_Id(customer.getId())
                .map(Wallet::getRewardPoints)
                .orElse(0L);

        long discountAmount = 0L;
        String appliedVoucherCode = null;

        if (voucherCode != null && !voucherCode.isBlank()) {
            UserVoucher userVoucher = userVoucherRepository
                    .findByUser_IdAndVoucher_CodeAndStatus(customer.getId(), voucherCode, UserVoucherStatus.SAVED)
                    .orElseThrow(() -> AppException.badRequest(ErrorCode.VOUCHER_NOT_SAVED,
                            "Bạn chưa lưu voucher này, hãy lưu voucher trước khi sử dụng"));

            Voucher voucher = userVoucher.getVoucher();
            if (!voucher.isActive() || voucher.isExpired()) {
                throw AppException.badRequest(ErrorCode.VOUCHER_EXPIRED, "Voucher đã hết hạn");
            }
            if (totalPrice < voucher.getMinOrderAmount()) {
                throw AppException.badRequest(ErrorCode.VOUCHER_NOT_APPLICABLE,
                        "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng voucher này");
            }

            discountAmount = voucher.getDiscountType() == VoucherDiscountType.PERCENT
                    ? Math.round(totalPrice * voucher.getDiscountValue() / 100.0)
                    : voucher.getDiscountValue();

            if (voucher.getMaxDiscountAmount() != null) {
                discountAmount = Math.min(discountAmount, voucher.getMaxDiscountAmount());
            }
            discountAmount = Math.min(discountAmount, totalPrice);
            appliedVoucherCode = voucher.getCode();
        }

        long requestedPoints = pointsToUse == null ? 0L : Math.max(0L, pointsToUse);
        long pointValueVnd = getLongSetting("customer_point_value_vnd", 1000L);
        long maxDiscountAllowed = Math.max(0L, totalPrice - MIN_PAYABLE_AMOUNT);
        int maxDiscountPercent = (int) getLongSetting("customer_max_discount_percent", 50L);
        maxDiscountAllowed = Math.min(maxDiscountAllowed, Math.round(totalPrice * maxDiscountPercent / 100.0));

        long remainingForPoints = Math.max(0L, maxDiscountAllowed - discountAmount);
        long maxPointsUsable = pointValueVnd > 0 ? remainingForPoints / pointValueVnd : 0L;

        long pointsUsed = Math.min(requestedPoints, Math.min(availablePoints, maxPointsUsable));
        long pointsDiscountAmount = pointsUsed * pointValueVnd;

        long payableAmount = totalPrice - discountAmount - pointsDiscountAmount;
        if (payableAmount < MIN_PAYABLE_AMOUNT) {
            payableAmount = Math.max(MIN_PAYABLE_AMOUNT, totalPrice - discountAmount - pointsDiscountAmount);
        }

        return InvoiceDiscountResponse.builder()
                .invoiceCode(invoiceCode)
                .totalPrice(totalPrice)
                .voucherCode(appliedVoucherCode)
                .discountAmount(discountAmount)
                .pointsUsed(pointsUsed)
                .pointsDiscountAmount(pointsDiscountAmount)
                .payableAmount(payableAmount)
                .availablePoints(availablePoints)
                .build();
    }

    @Override
    @Transactional
    public void finalizeRewards(User customer, Order order, String voucherCode, long pointsUsed, long payableAmount) {
        if (voucherCode != null && !voucherCode.isBlank()) {
            userVoucherRepository.findByUser_IdAndVoucher_CodeAndStatus(customer.getId(), voucherCode, UserVoucherStatus.SAVED)
                    .ifPresent(uv -> {
                        uv.setStatus(UserVoucherStatus.USED);
                        uv.setUsedAt(LocalDateTime.now());
                        uv.setOrder(order);
                        userVoucherRepository.save(uv);
                    });
        }

        Wallet wallet = walletRepository.findWithLockByUser_Id(customer.getId()).orElse(null);
        if (wallet == null) {
            return;
        }
        long currentPoints = wallet.getRewardPoints();

        if (pointsUsed > 0) {
            currentPoints = Math.max(0L, currentPoints - pointsUsed);
        }

        long earnPer10k = getLongSetting("customer_points_per_10k", 1L);
        long earnedPoints = payableAmount > 0 ? (payableAmount / 10000L) * earnPer10k : 0L;
        currentPoints += earnedPoints;

        wallet.setRewardPoints(currentPoints);
        walletRepository.save(wallet);

        log.info("Finalized rewards for customer {}: -{} points used, +{} points earned, balance={}",
                customer.getCode(), pointsUsed, earnedPoints, currentPoints);
    }

    private VoucherResponse toResponse(Voucher voucher, User current) {
        boolean saved = current != null
                && userVoucherRepository.findByUser_IdAndVoucher_Id(current.getId(), voucher.getId()).isPresent();
        boolean used = current != null
                && userVoucherRepository.findByUser_IdAndVoucher_Id(current.getId(), voucher.getId())
                    .map(uv -> uv.getStatus() == UserVoucherStatus.USED)
                    .orElse(false);
        return toResponse(voucher, saved, used);
    }

    private VoucherResponse toResponse(Voucher voucher, boolean saved, boolean used) {
        return VoucherResponse.builder()
                .code(voucher.getCode())
                .title(voucher.getTitle())
                .description(voucher.getDescription())
                .tone(voucher.getTone())
                .badge(voucher.getBadge())
                .discountType(voucher.getDiscountType().apiValue())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .endAt(voucher.getEndAt())
                .saved(saved)
                .used(used)
                .build();
    }

    private long getLongSetting(String key, long defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(setting -> {
                    try {
                        return Long.parseLong(setting.getValue().trim());
                    } catch (Exception ex) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    private User getCurrentUser() {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw AppException.unauthorized("Người dùng chưa đăng nhập");
        }
        return user;
    }

    private User getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmailAndDeletedFalse(authentication.getName()).orElse(null);
    }
}
