package com.example.becommerce.controller;

import com.example.becommerce.dto.request.warranty.CreateWarrantyRequest;
import com.example.becommerce.dto.request.warranty.RejectWarrantyRequest;
import com.example.becommerce.dto.response.ApiResponse;
import com.example.becommerce.dto.response.warranty.WarrantyResponse;
import com.example.becommerce.service.WarrantyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Warranty endpoints scoped under an order:
 *  - POST  /api/orders/:id/warranty         — file a claim
 *  - GET   /api/orders/:id/warranty         — fetch the latest claim for the order
 *  - POST  /api/warranty/:code/accept       — technician accepts warranty
 *  - POST  /api/warranty/:code/reject       — technician rejects with reason
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class OrderWarrantyController {

    private final WarrantyService warrantyService;

    @PostMapping("/orders/{id}/warranty")
    public ResponseEntity<ApiResponse<WarrantyResponse>> createWarranty(
            @PathVariable("id") String orderCode,
            @Valid @RequestBody CreateWarrantyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(warrantyService.createWarranty(orderCode, request)));
    }

    @GetMapping("/orders/{id}/warranty")
    public ResponseEntity<ApiResponse<WarrantyResponse>> getWarranty(@PathVariable("id") String orderCode) {
        return ResponseEntity.ok(ApiResponse.success(warrantyService.getWarrantyByOrder(orderCode)));
    }

    @PostMapping("/warranty/{code}/accept")
    public ResponseEntity<ApiResponse<WarrantyResponse>> acceptWarranty(@PathVariable("code") String warrantyCode) {
        return ResponseEntity.ok(ApiResponse.success(warrantyService.acceptWarranty(warrantyCode)));
    }

    @PostMapping("/warranty/{code}/complete")
    public ResponseEntity<ApiResponse<WarrantyResponse>> completeWarranty(@PathVariable("code") String warrantyCode) {
        return ResponseEntity.ok(ApiResponse.success(warrantyService.completeWarranty(warrantyCode)));
    }

    @PostMapping("/warranty/{code}/reject")
    public ResponseEntity<ApiResponse<WarrantyResponse>> rejectWarranty(
            @PathVariable("code") String warrantyCode,
            @Valid @RequestBody RejectWarrantyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(warrantyService.rejectWarranty(warrantyCode, request.getReason())));
    }
}
