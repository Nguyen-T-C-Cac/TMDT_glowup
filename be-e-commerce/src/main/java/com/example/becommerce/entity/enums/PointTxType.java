package com.example.becommerce.entity.enums;

import java.util.Locale;

/**
 * Reason a technician's reward-point balance changed.
 */
public enum PointTxType {
    ORDER_COMPLETED,   // points awarded for a successfully completed order
    REFUND_REVERSAL,   // points reversed when an order is refunded/cancelled
    ADMIN_ADJUST;      // manual adjustment by an admin

    public String apiValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
