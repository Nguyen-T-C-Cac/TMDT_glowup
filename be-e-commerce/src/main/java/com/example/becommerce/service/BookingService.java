package com.example.becommerce.service;

import com.example.becommerce.dto.request.booking.CreateBookingRequest;
import com.example.becommerce.dto.response.booking.BookingSubmitResponse;
import com.example.becommerce.dto.response.booking.BrandResponse;
import com.example.becommerce.dto.response.booking.DeviceTypeResponse;

import java.util.List;

public interface BookingService {

    List<DeviceTypeResponse> getDeviceTypesByCategory(String categoryCode);

    List<BrandResponse> getBrandsByCategory(String categoryCode);

    BookingSubmitResponse createBooking(CreateBookingRequest request);

    void acceptBooking(String code);

    void rejectBooking(String code);
}
