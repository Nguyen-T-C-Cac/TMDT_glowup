package com.example.becommerce.controller;

import com.example.becommerce.dto.request.schedule.CreateScheduleSlotRequest;
import com.example.becommerce.dto.response.ApiResponse;
import com.example.becommerce.dto.response.schedule.ScheduleSlotResponse;
import com.example.becommerce.entity.User;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.service.ScheduleSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
 
import java.time.LocalDate;
import java.util.List;
 
@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class ScheduleSlotController {
 
    private final ScheduleSlotService slotService;
    private final UserRepository      userRepository;
 
    // ----------------------------------------------------------------
    // Thợ xem lịch của mình (đầy đủ thông tin đơn hàng)
    // GET /api/technicians/me/slots?from=2025-06-01&to=2025-06-07
    // ----------------------------------------------------------------
 
    @GetMapping("/me/slots")
    public ResponseEntity<ApiResponse<List<ScheduleSlotResponse>>> mySlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
 
        Long techId = getCurrentUserId();
        return ResponseEntity.ok(
                ApiResponse.success(slotService.getSlotsForTechnician(techId, from, to)));
    }
 
    // ----------------------------------------------------------------
    // Thợ thêm slot thủ công
    // POST /api/technicians/me/slots
    // ----------------------------------------------------------------
 
    @PostMapping("/me/slots")
    public ResponseEntity<ApiResponse<ScheduleSlotResponse>> createSlot(
            @Valid @RequestBody CreateScheduleSlotRequest req) {
 
        Long techId = getCurrentUserId();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(slotService.createSlot(techId, req)));
    }
 
    // ----------------------------------------------------------------
    // Thợ xóa slot thủ công
    // DELETE /api/technicians/me/slots/{slotId}
    // ----------------------------------------------------------------
 
    @DeleteMapping("/me/slots/{slotId}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable Long slotId) {
        Long techId = getCurrentUserId();
        slotService.deleteSlot(techId, slotId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
 
    // ----------------------------------------------------------------
    // Lịch hôm nay — widget TodaySchedule trên dashboard thợ
    // GET /api/technicians/me/slots/today
    // ----------------------------------------------------------------
 
    @GetMapping("/me/slots/today")
    public ResponseEntity<ApiResponse<List<ScheduleSlotResponse>>> todaySlots() {
        Long techId = getCurrentUserId();
        return ResponseEntity.ok(
                ApiResponse.success(slotService.getTodaySlots(techId)));
    }
 
    // ----------------------------------------------------------------
    // Khách xem lịch của thợ — chỉ hiện giờ bận, không có thông tin đơn hàng
    // GET /api/technicians/{id}/slots/public?from=...&to=...
    // ----------------------------------------------------------------
 
    @GetMapping("/{id}/slots/public")
    public ResponseEntity<ApiResponse<List<ScheduleSlotResponse>>> publicSlots(
            @PathVariable("id") String technicianCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
 
        return ResponseEntity.ok(
                ApiResponse.success(slotService.getPublicSlots(technicianCode, from, to)));
    }
 
    // ----------------------------------------------------------------
    // Helper: lấy userId từ SecurityContext (giống pattern trong BookingServiceImpl)
    // ----------------------------------------------------------------
 
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw AppException.unauthorized("Người dùng chưa đăng nhập");
        }
        String email = auth.getName();
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng hiện tại"));
        return user.getId();
    }
}