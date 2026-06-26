package com.example.becommerce.controller;

import com.example.becommerce.dto.request.admin.RefundRequest;
import com.example.becommerce.dto.response.ApiResponse;
import com.example.becommerce.dto.response.PagedResponse;
import com.example.becommerce.dto.response.admin.RefundResponse;
import com.example.becommerce.service.RefundService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class RefundController {

    private final RefundService refundService;

    @PostMapping("/orders/{code}/refund")
    public ResponseEntity<ApiResponse<RefundResponse>> refundOrder(
            @PathVariable("code") String orderCode,
            @Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(ApiResponse.success(refundService.createRefund(orderCode, request)));
    }

    @GetMapping("/refunds")
    public ResponseEntity<ApiResponse<PagedResponse<RefundResponse>>> listRefunds(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        return ResponseEntity.ok(ApiResponse.success(refundService.getRefunds(page, size)));
    }
}
