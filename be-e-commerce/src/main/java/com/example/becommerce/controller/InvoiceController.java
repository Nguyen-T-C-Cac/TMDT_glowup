package com.example.becommerce.controller;

import com.example.becommerce.dto.request.ApplyInvoiceDiscountRequest;
import com.example.becommerce.dto.response.InvoiceDiscountResponse;
import com.example.becommerce.dto.response.ApiResponse;
import com.example.becommerce.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/orders/{id}/invoice")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createInvoice(@PathVariable("id") String orderCode) {
        invoiceService.createInvoice(orderCode);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/apply-discount")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceDiscountResponse>> applyDiscount(
            @PathVariable("id") String orderCode,
            @RequestBody ApplyInvoiceDiscountRequest request) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.applyDiscount(orderCode, request)));
    }

    @PostMapping("/vnpay-checkout")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> createVnpayCheckout(@PathVariable("id") String orderCode) {
        String checkoutUrl = invoiceService.createVnpayCheckout(orderCode);
        return ResponseEntity.ok(ApiResponse.success(Map.of("checkoutUrl", checkoutUrl)));
    }

    @PostMapping("/confirm-cash")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> confirmCashPayment(@PathVariable("id") String orderCode) {
        invoiceService.confirmCashPayment(orderCode);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
