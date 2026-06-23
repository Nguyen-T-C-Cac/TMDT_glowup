package com.example.becommerce.repository;

import com.example.becommerce.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByCode(String code);

    Optional<Invoice> findByOrder_Id(Long orderId);

    boolean existsByOrder_Id(Long orderId);
}
