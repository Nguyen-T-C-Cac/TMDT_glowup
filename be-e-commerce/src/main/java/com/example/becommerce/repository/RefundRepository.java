package com.example.becommerce.repository;

import com.example.becommerce.entity.Refund;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByOrder_IdOrderByCreatedAtDesc(Long orderId);

    Page<Refund> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
            "select coalesce(sum(r.amount), 0) from Refund r where r.order.id = :orderId and r.status = 'COMPLETED'")
    BigDecimal sumCompletedByOrder(Long orderId);
}
