package com.example.becommerce.service;

import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.Wallet;
import com.example.becommerce.entity.enums.PaymentMethod;

/**
 * Single source of truth for what happens to a technician's wallet when an
 * order is paid for. Replaces the three divergent copies that previously lived
 * in OrderServiceImpl, InvoiceServiceImpl and PaymentGatewayServiceImpl.
 */
public interface WalletSettlementService {

    /**
     * Settle a completed/paid order exactly once (idempotent on {@code order.settled}):
     * <ul>
     *   <li>Always deduct the fixed commission fee from the technician's CREDIT wallet
     *       (negative balance allowed — triggers account lock).</li>
     *   <li>If {@code method} is a bank-transfer style payment, credit the invoice
     *       amount to the technician's PERSONAL wallet. Cash is NOT credited because
     *       the technician already collected the money directly.</li>
     *   <li>Award reward points to the technician (see TN4).</li>
     *   <li>Lock the technician account when the credit wallet drops below the
     *       configured threshold.</li>
     * </ul>
     */
    void settleCompletedOrder(Order order, PaymentMethod method);

    /**
     * Guard used at technician action entry points (accept / complete / withdraw).
     * Throws a forbidden error when the account is locked.
     */
    void assertActorNotLocked(Long userId);

    /**
     * Recompute wallet health tier and (un)lock the owner in both directions:
     * lock when the credit balance falls below the threshold, unlock when it
     * recovers. Shared by settlement, refund (TN2) and top-up flows. The caller
     * is responsible for persisting the wallet afterwards.
     */
    void syncWalletLock(Wallet wallet, User owner);
}
