package com.example.becommerce.entity.enums;

import java.util.Locale;

/**
 * Supported wallet payment methods.
 */
public enum PaymentMethod {
    VIETQR,
    VNPAY,
    MOMO,
    BANK_TRANSFER,
    CASH;

    /**
     * Bank-transfer style methods: the customer pays into the platform, so the
     * technician's personal wallet must be credited with the invoice amount.
     * CASH is excluded because the technician already collected money directly.
     */
    public boolean isBankTransfer() {
        return this == VNPAY || this == BANK_TRANSFER || this == VIETQR || this == MOMO;
    }

    public String apiValue() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static PaymentMethod from(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return PaymentMethod.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}


