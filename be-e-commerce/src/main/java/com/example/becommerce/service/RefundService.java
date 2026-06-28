package com.example.becommerce.service;

import com.example.becommerce.dto.request.admin.RefundRequest;
import com.example.becommerce.dto.response.PagedResponse;
import com.example.becommerce.dto.response.admin.RefundResponse;

public interface RefundService {

    /**
     * Admin refunds (part of) an order to the customer. The platform advances the
     * money to the customer's wallet, then deducts it from the technician's credit
     * wallet — allowing the balance to go negative and locking the account.
     */
    RefundResponse createRefund(String orderCode, RefundRequest request);

    /** Paginated list of all refunds, newest first. */
    PagedResponse<RefundResponse> getRefunds(int page, int size);
}
