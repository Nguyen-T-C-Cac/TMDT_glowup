package com.example.becommerce.entity.enums;

import java.util.Locale;

/**
 * Lifecycle state of a voucher that a customer has saved.
 */
public enum UserVoucherStatus {
    SAVED,
    USED,
    EXPIRED;

    public String apiValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
