package com.example.becommerce.repository;

import com.example.becommerce.entity.WarrantyClaim;
import com.example.becommerce.entity.enums.WarrantyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface WarrantyClaimRepository extends JpaRepository<WarrantyClaim, Long> {

    Optional<WarrantyClaim> findByOrder_Id(Long orderId);

    Optional<WarrantyClaim> findTopByOrder_IdOrderByCreatedAtDesc(Long orderId);

    long countByOrder_Id(Long orderId);

    Optional<WarrantyClaim> findTopByOrder_IdAndStatusAndCreatedAtBeforeOrderByCreatedAtDesc(
            Long orderId, WarrantyStatus status, LocalDateTime createdAt);

    boolean existsByOrder_Id(Long orderId);

    boolean existsByOrder_IdAndStatus(Long orderId, WarrantyStatus status);

    boolean existsByCode(String code);

    long count();

    Optional<WarrantyClaim> findByCode(String code);
}
