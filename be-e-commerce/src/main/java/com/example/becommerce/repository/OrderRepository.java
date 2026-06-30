package com.example.becommerce.repository;

import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByCodeAndDeletedFalse(String code);

    boolean existsByCode(String code);

    long countByDeletedFalse();

    long countByTechnician_IdAndStatusAndDeletedFalse(Long technicianId, OrderStatus status);
    long countByCompletedAtBetweenAndStatusAndDeletedFalse(LocalDateTime from, LocalDateTime to, OrderStatus status);

    // New: count completed orders in range (deleted=false)
    long countByCompletedAtBetweenAndDeletedFalse(LocalDateTime from, LocalDateTime to);

    // New: count by category within range (deleted=false)
    long countByCategoryIdAndCompletedAtBetweenAndDeletedFalse(Long categoryId, LocalDateTime from, LocalDateTime to);

    // Aggregate final_price grouped by month (yyyy-MM)
    @org.springframework.data.jpa.repository.Query(value = "SELECT to_char(completed_at, 'YYYY-MM') as period, COALESCE(SUM(final_price),0) as total " +
            "FROM orders " +
            "WHERE deleted = false AND completed_at BETWEEN :from AND :to " +
            "GROUP BY period ORDER BY period", nativeQuery = true)
    java.util.List<Object[]> sumFinalPriceGroupByMonth(java.time.LocalDateTime from, java.time.LocalDateTime to);

    // Aggregate final_price grouped by day (yyyy-MM-dd)
    @org.springframework.data.jpa.repository.Query(value = "SELECT to_char(completed_at, 'YYYY-MM-DD') as period, COALESCE(SUM(final_price),0) as total " +
            "FROM orders " +
            "WHERE deleted = false AND completed_at BETWEEN :from AND :to " +
            "GROUP BY period ORDER BY period", nativeQuery = true)
    java.util.List<Object[]> sumFinalPriceGroupByDay(java.time.LocalDateTime from, java.time.LocalDateTime to);

    // Recent orders page within completedAt range, ordered by scheduledAt desc
    Page<Order> findByCompletedAtBetweenAndDeletedFalseOrderByScheduledAtDesc(LocalDateTime from, LocalDateTime to, Pageable pageable);

    // ===== Technician dashboard (TN5) =====

    /** Orders of a technician scheduled within [from, to], earliest first — drives "today's schedule". */
    List<Order> findByTechnician_IdAndScheduledAtBetweenAndDeletedFalseOrderByScheduledAtAsc(
            Long technicianId, LocalDateTime from, LocalDateTime to);

    /** Count a technician's orders currently in any of the given statuses (e.g. active/in-progress). */
    long countByTechnician_IdAndStatusInAndDeletedFalse(Long technicianId, Collection<OrderStatus> statuses);

    /** Count a technician's orders of one status completed within [from, to]. */
    long countByTechnician_IdAndStatusAndCompletedAtBetweenAndDeletedFalse(
            Long technicianId, OrderStatus status, LocalDateTime from, LocalDateTime to);

    /** Sum a technician's COMPLETED earnings within [from, to]. */
    @Query(value = "SELECT COALESCE(SUM(final_price), 0) FROM orders "
            + "WHERE deleted = false AND technician_id = :techId AND status = 'COMPLETED' "
            + "AND completed_at BETWEEN :from AND :to", nativeQuery = true)
    long sumTechnicianEarningsBetween(@Param("techId") Long techId,
                                      @Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to);

    /** Daily COMPLETED earnings of a technician within [from, to] as (yyyy-MM-dd, total). */
    @Query(value = "SELECT to_char(completed_at, 'YYYY-MM-DD') AS period, COALESCE(SUM(final_price), 0) AS total "
            + "FROM orders "
            + "WHERE deleted = false AND technician_id = :techId AND status = 'COMPLETED' "
            + "AND completed_at BETWEEN :from AND :to "
            + "GROUP BY period ORDER BY period", nativeQuery = true)
    List<Object[]> sumTechnicianEarningsGroupByDay(@Param("techId") Long techId,
                                                   @Param("from") LocalDateTime from,
                                                   @Param("to") LocalDateTime to);
}