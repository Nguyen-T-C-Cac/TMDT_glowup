package com.example.becommerce.service.impl;


import com.example.becommerce.dto.request.schedule.CreateScheduleSlotRequest;
import com.example.becommerce.dto.response.schedule.ScheduleSlotResponse;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.TechnicianScheduleSlot;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.enums.Role;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.TechnicianScheduleSlotRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.service.ScheduleSlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleSlotServiceImpl implements ScheduleSlotService {
 
    private final TechnicianScheduleSlotRepository slotRepository;
    private final UserRepository                   userRepository;
 
    // ----------------------------------------------------------------
    // Thợ thêm slot thủ công
    // ----------------------------------------------------------------
 
    @Override
    @Transactional
    public ScheduleSlotResponse createSlot(Long technicianId, CreateScheduleSlotRequest req) {
        if (req.getEndTime().isBefore(req.getStartTime()) ||
            req.getEndTime().isEqual(req.getStartTime())) {
            throw AppException.badRequest("VALIDATION_ERROR", "Thời gian kết thúc phải sau thời gian bắt đầu");
        }
 
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy kỹ thuật viên"));
 
        TechnicianScheduleSlot slot = TechnicianScheduleSlot.builder()
                .technician(technician)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .title(req.getTitle())
                .note(req.getNote())
                .slotType("MANUAL")
                .build();
 
        TechnicianScheduleSlot saved = slotRepository.save(slot);
        log.info("Manual slot created: id={} technician={}", saved.getId(), technicianId);
        return toFullResponse(saved);
    }
 
    // ----------------------------------------------------------------
    // Thợ xóa slot thủ công
    // ----------------------------------------------------------------
 
    @Override
    @Transactional
    public void deleteSlot(Long technicianId, Long slotId) {
        TechnicianScheduleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy slot"));
 
        if (!slot.getTechnician().getId().equals(technicianId)) {
            throw AppException.forbidden("Bạn không có quyền xóa slot này");
        }
        if ("ORDER".equals(slot.getSlotType())) {
            throw AppException.badRequest("VALIDATION_ERROR",
                    "Không thể xóa lịch từ đơn hàng. Hủy đơn hàng để gỡ lịch.");
        }
 
        slotRepository.delete(slot);
        log.info("Manual slot deleted: id={} technician={}", slotId, technicianId);
    }
 
    // ----------------------------------------------------------------
    // Thợ xem lịch của mình (đầy đủ thông tin đơn hàng)
    // ----------------------------------------------------------------
 
    @Override
    @Transactional(readOnly = true)
    public List<ScheduleSlotResponse> getSlotsForTechnician(Long technicianId, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end   = to.atTime(LocalTime.MAX);
 
        return slotRepository
                .findByTechnician_IdAndStartTimeBetween(technicianId, start, end)
                .stream()
                .map(this::toFullResponse)
                .toList();
    }
 
    // ----------------------------------------------------------------
    // Lấy slot hôm nay — dashboard thợ
    // ----------------------------------------------------------------
 
    @Override
    @Transactional(readOnly = true)
    public List<ScheduleSlotResponse> getTodaySlots(Long technicianId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = LocalDate.now().atTime(LocalTime.MAX);
 
        return slotRepository
                .findByTechnician_IdAndStartTimeBetween(technicianId, startOfDay, endOfDay)
                .stream()
                .map(this::toFullResponse)
                .toList();
    }
 
    // ----------------------------------------------------------------
    // Khách xem lịch công khai của thợ (chỉ startTime + endTime)
    // ----------------------------------------------------------------
 
    @Override
    @Transactional(readOnly = true)
    public List<ScheduleSlotResponse> getPublicSlots(String technicianCode, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end   = to.atTime(LocalTime.MAX);
 
        return slotRepository
                .findByTechnician_CodeAndStartTimeBetween(technicianCode, start, end)
                .stream()
                .map(this::toPublicResponse)
                .toList();
    }
 
    // ----------------------------------------------------------------
    // Hook: tự động tạo slot khi đơn chuyển sang SCHEDULED
    // ----------------------------------------------------------------
 
    @Override
    @Transactional
    public void createSlotFromOrder(Order order) {
        if (order.getTechnician() == null || order.getScheduledAt() == null) {
            log.warn("createSlotFromOrder: order {} missing technician or scheduledAt — skip", order.getCode());
            return;
        }
 
        // Xóa slot cũ nếu đã tồn tại (thợ đổi lịch)
        slotRepository.findByOrder_Id(order.getId())
                .ifPresent(slotRepository::delete);
 
        LocalDateTime start = order.getScheduledAt();
        LocalDateTime end   = (order.getExpectedTime() != null)
                ? order.getExpectedTime()
                : start.plusHours(2); // mặc định 2 giờ nếu chưa có giờ kết thúc
 
        TechnicianScheduleSlot slot = TechnicianScheduleSlot.builder()
                .technician(order.getTechnician())
                .order(order)
                .startTime(start)
                .endTime(end)
                .title(order.getServiceName())
                .slotType("ORDER")
                .build();
 
        slotRepository.save(slot);
        log.info("ORDER slot auto-created: orderId={} technicianId={} start={}",
                order.getId(), order.getTechnician().getId(), start);
    }
 
    // ----------------------------------------------------------------
    // Mappers
    // ----------------------------------------------------------------
 
    /** Trả đầy đủ thông tin — chỉ dùng cho thợ */
    private ScheduleSlotResponse toFullResponse(TechnicianScheduleSlot slot) {
        ScheduleSlotResponse.ScheduleSlotResponseBuilder builder = ScheduleSlotResponse.builder()
                .id(slot.getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .title(slot.getTitle())
                .slotType(slot.getSlotType());
 
        if (slot.getOrder() != null) {
            Order o = slot.getOrder();
            builder
                .orderId(o.getCode())
                .serviceDescription(buildServiceDesc(o))
                .address(o.getAddress());
 
            if (o.getCustomer() != null) {
                builder
                    .customerName(o.getCustomer().getFullName())
                    .customerPhone(o.getCustomer().getPhone());
            }
        }
 
        return builder.build();
    }
 
    /** Chỉ trả startTime + endTime — dùng cho khách xem */
    private ScheduleSlotResponse toPublicResponse(TechnicianScheduleSlot slot) {
        return ScheduleSlotResponse.builder()
                .id(slot.getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .build();
    }
 
    private String buildServiceDesc(Order o) {
        StringBuilder sb = new StringBuilder();
        if (o.getServiceName() != null) sb.append(o.getServiceName());
        if (o.getDeviceName()   != null) sb.append(" - ").append(o.getDeviceName());
        return sb.length() > 0 ? sb.toString() : o.getCode();
    }
}
