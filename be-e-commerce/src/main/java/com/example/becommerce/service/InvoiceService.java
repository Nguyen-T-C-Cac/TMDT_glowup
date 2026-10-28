package com.example.becommerce.service;

import com.example.becommerce.dto.request.ApplyInvoiceDiscountRequest;
import com.example.becommerce.dto.response.InvoiceDiscountResponse;
import com.example.becommerce.dto.response.VnpayIpnResponse;

import java.util.Map;

public interface InvoiceService {

    void createInvoice(String orderCode);

    InvoiceDiscountResponse applyDiscount(String orderCode, ApplyInvoiceDiscountRequest request);

    String createVnpayCheckout(String orderCode);

    void confirmCashPayment(String orderCode);
}
