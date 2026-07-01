package com.example.becommerce.repository;

import com.example.becommerce.entity.TechnicianScheduleSlot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface TechnicianScheduleSlotRepository extends JpaRepository<TechnicianScheduleSlot, Long> {
 
    /** Lấy slot của thợ trong khoảng thời gian — dùng cho lịch tuần/tháng */
    List<TechnicianScheduleSlot> findByTechnician_IdAndStartTimeBetween(
            Long technicianId, LocalDateTime from, LocalDateTime to);
 
    /** Lấy slot trong tương lai — dùng cho lịch hôm nay (from = đầu ngày, to = cuối ngày) */
    List<TechnicianScheduleSlot> findByTechnician_IdAndStartTimeGreaterThanEqualOrderByStartTimeAsc(
            Long technicianId, LocalDateTime from);
 
    /** Tìm slot gắn với đơn hàng — để tránh tạo trùng */
    Optional<TechnicianScheduleSlot> findByOrder_Id(Long orderId);
 
    /** Tất cả slot của thợ */
    List<TechnicianScheduleSlot> findByTechnician_Id(Long technicianId);
 
    /** Lấy slot theo code của thợ — dùng cho API public */
    List<TechnicianScheduleSlot> findByTechnician_CodeAndStartTimeBetween(
            String technicianCode, LocalDateTime from, LocalDateTime to);
}