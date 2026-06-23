package com.example.becommerce.service;

import com.example.becommerce.dto.response.VnpayIpnResponse;

import java.util.Map;

public interface InvoiceService {

    void createInvoice(String orderCode);

    String createVnpayCheckout(String orderCode);

    void confirmCashPayment(String orderCode);
}
