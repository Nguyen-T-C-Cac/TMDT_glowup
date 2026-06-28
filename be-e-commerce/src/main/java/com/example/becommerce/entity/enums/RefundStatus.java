package com.example.becommerce.entity.enums;

import java.util.Locale;

/**
 * Lifecycle of an admin-initiated refund.
 */
public enum RefundStatus {
    PENDING,
    COMPLETED,
    FAILED;

    public String apiValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
