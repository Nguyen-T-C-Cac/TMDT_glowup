package com.example.becommerce.entity.enums;

import java.util.Locale;

/**
 * How an admin refund is delivered to the customer.
 *
 * <ul>
 *   <li>{@link #WALLET} — credit the customer's personal wallet (in-system).</li>
 *   <li>{@link #BANK_TRANSFER} — admin pays the customer out-of-band to the bank
 *       account they provided; the platform only records the account for reconciliation
 *       and does NOT touch the customer wallet.</li>
 * </ul>
 */
public enum RefundMethod {
    WALLET,
    BANK_TRANSFER;

    public String apiValue() {
        return name().toLowerCase(Locale.ROOT);
    }

    /** Lenient parse: defaults to WALLET for null/blank/unknown values. */
    public static RefundMethod from(String raw) {
        if (raw == null || raw.isBlank()) {
            return WALLET;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        try {
            return RefundMethod.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            return WALLET;
        }
    }
}
