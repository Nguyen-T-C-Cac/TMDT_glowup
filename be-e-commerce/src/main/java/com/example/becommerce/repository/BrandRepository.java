package com.example.becommerce.repository;

import com.example.becommerce.entity.Brand;
import com.example.becommerce.entity.enums.VisibilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findByCode(String code);

    boolean existsByCode(String code);

    long count();

    List<Brand> findByCategory_IdAndStatusAndDeletedFalseOrderByNameAsc(Long categoryId, VisibilityStatus status);

    List<Brand> findByCategory_CodeAndStatusAndDeletedFalseOrderByNameAsc(String categoryCode, VisibilityStatus status);
}
