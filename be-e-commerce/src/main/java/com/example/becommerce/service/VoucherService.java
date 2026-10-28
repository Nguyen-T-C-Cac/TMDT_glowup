package com.example.becommerce.service;

import com.example.becommerce.dto.response.InvoiceDiscountResponse;
import com.example.becommerce.dto.response.VoucherResponse;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.User;

import java.util.List;

public interface VoucherService {

    /** Vouchers a customer can browse and save from the rewards page. */
    List<VoucherResponse> listAvailableVouchers();

    /** Vouchers the current customer has saved and not used yet. */
    List<VoucherResponse> listSavedVouchers();

    VoucherResponse saveVoucher(String code);

    /** Current customer's reward-points balance. */
    long getMyRewardPoints();

    /**
     * Validate & compute the discount for a given voucher code / points amount
     * against an invoice total, without persisting anything.
     */
    InvoiceDiscountResponse computeDiscount(User customer, String invoiceCode, long totalPrice,
                                             String voucherCode, Long pointsToUse);

    /**
     * Called once payment succeeds: marks the applied voucher as USED,
     * deducts the redeemed points and awards new reward points for the
     * amount actually paid.
     */
    void finalizeRewards(User customer, Order order, String voucherCode, long pointsUsed, long payableAmount);
}
