package com.example.becommerce.repository;

import com.example.becommerce.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    Page<PointTransaction> findByTechnician_IdOrderByCreatedAtDesc(Long technicianId, Pageable pageable);
}
