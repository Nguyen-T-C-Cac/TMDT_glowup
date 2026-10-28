package com.example.becommerce.entity.enums;

import java.util.Locale;

/**
 * How a voucher's discount value should be interpreted.
 */
public enum VoucherDiscountType {
    PERCENT,
    FIXED;

    public String apiValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
