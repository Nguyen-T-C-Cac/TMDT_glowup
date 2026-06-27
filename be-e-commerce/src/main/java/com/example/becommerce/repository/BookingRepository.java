package com.example.becommerce.repository;

import com.example.becommerce.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByCode(String code);

    Optional<Booking> findByOrder_Code(String orderCode);

    boolean existsByCode(String code);

    long count();
}
