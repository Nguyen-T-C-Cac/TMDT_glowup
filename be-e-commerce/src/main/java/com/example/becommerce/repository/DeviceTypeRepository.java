package com.example.becommerce.repository;

import com.example.becommerce.entity.DeviceType;
import com.example.becommerce.entity.enums.VisibilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTypeRepository extends JpaRepository<DeviceType, Long> {

    Optional<DeviceType> findByCode(String code);

    boolean existsByCode(String code);

    long count();

    List<DeviceType> findByCategory_IdAndStatusAndDeletedFalseOrderByNameAsc(Long categoryId, VisibilityStatus status);

    List<DeviceType> findByCategory_CodeAndStatusAndDeletedFalseOrderByNameAsc(String categoryCode, VisibilityStatus status);
}
