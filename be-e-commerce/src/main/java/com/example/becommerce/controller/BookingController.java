package com.example.becommerce.controller;

import com.example.becommerce.dto.request.booking.CreateBookingRequest;
import com.example.becommerce.dto.response.ApiResponse;
import com.example.becommerce.dto.response.booking.BookingSubmitResponse;
import com.example.becommerce.dto.response.booking.BrandResponse;
import com.example.becommerce.dto.response.booking.DeviceTypeResponse;
import com.example.becommerce.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/device-types")
    public ResponseEntity<ApiResponse<List<DeviceTypeResponse>>> getDeviceTypes(
            @RequestParam String categoryCode) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getDeviceTypesByCategory(categoryCode)));
    }

    @GetMapping("/brands")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getBrands(
            @RequestParam String categoryCode) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getBrandsByCategory(categoryCode)));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingSubmitResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(bookingService.createBooking(request)));
    }
}
