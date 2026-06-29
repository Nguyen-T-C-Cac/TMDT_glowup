package com.example.becommerce.service;

import java.time.LocalDate;
import java.util.List;

import com.example.becommerce.dto.request.schedule.CreateScheduleSlotRequest;
import com.example.becommerce.dto.response.schedule.ScheduleSlotResponse;
import com.example.becommerce.entity.Order;


import com.example.becommerce.dto.request.schedule.CreateScheduleSlotRequest;
import com.example.becommerce.dto.response.schedule.ScheduleSlotResponse;
import com.example.becommerce.entity.Order;
 
import java.time.LocalDate;
import java.util.List;
 
public interface ScheduleSlotService {
 
    /** Thợ thêm slot thủ công */
    ScheduleSlotResponse createSlot(Long technicianId, CreateScheduleSlotRequest req);
 
    /** Thợ xóa slot — chỉ được xóa slot loại MANUAL */
    void deleteSlot(Long technicianId, Long slotId);
 
    /**
     * Lấy slot của thợ trong khoảng ngày.
     * Trả đầy đủ: orderId, customerName, customerPhone, serviceDescription, address.
     */
    List<ScheduleSlotResponse> getSlotsForTechnician(Long technicianId, LocalDate from, LocalDate to);
 
    /**
     * Lấy slot công khai — dùng cho màn khách xem profile thợ.
     * Chỉ trả id, startTime, endTime (không tiết lộ thông tin đơn hàng).
     * technicianCode = mã thợ (ví dụ "GP-001"), KHÔNG phải Long id.
     */
    List<ScheduleSlotResponse> getPublicSlots(String technicianCode, LocalDate from, LocalDate to);
 
    /** Lấy slot hôm nay — dùng cho widget TodaySchedule trên dashboard thợ */
    List<ScheduleSlotResponse> getTodaySlots(Long technicianId);
 
    /**
     * Hook tự động: được gọi trong OrderServiceImpl khi đơn chuyển sang SCHEDULED.
     * Tạo slot loại ORDER gắn với đơn hàng đó.
     */
    void createSlotFromOrder(Order order);
}