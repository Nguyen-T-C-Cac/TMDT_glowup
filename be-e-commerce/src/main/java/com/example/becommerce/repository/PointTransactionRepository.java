package com.example.becommerce.repository;

import com.example.becommerce.entity.PointTransaction;
import com.example.becommerce.entity.enums.PointTxType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    Page<PointTransaction> findByTechnician_IdOrderByCreatedAtDesc(Long technicianId, Pageable pageable);

    /** Total points of a given type awarded for one order (e.g. ORDER_COMPLETED). */
    @Query("SELECT COALESCE(SUM(p.points), 0) FROM PointTransaction p "
            + "WHERE p.order.id = :orderId AND p.type = :type")
    long sumPointsByOrderAndType(@Param("orderId") Long orderId, @Param("type") PointTxType type);

    /** Net points booked against one order (awarded positives + reversal negatives). */
    @Query("SELECT COALESCE(SUM(p.points), 0) FROM PointTransaction p WHERE p.order.id = :orderId")
    long sumPointsByOrder(@Param("orderId") Long orderId);
}
