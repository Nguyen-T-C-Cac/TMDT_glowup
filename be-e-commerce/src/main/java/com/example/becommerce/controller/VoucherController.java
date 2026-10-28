package com.example.becommerce.controller;

import com.example.becommerce.dto.response.ApiResponse;
import com.example.becommerce.dto.response.VoucherResponse;
import com.example.becommerce.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> listAvailable() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.listAvailableVouchers()));
    }

    @GetMapping("/saved")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> listSaved() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.listSavedVouchers()));
    }

    @PostMapping("/{code}/save")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VoucherResponse>> save(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.saveVoucher(code)));
    }

    @GetMapping("/points")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> myPoints() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("rewardPoints", voucherService.getMyRewardPoints())));
    }
}
