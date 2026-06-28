package com.example.becommerce.repository;

import com.example.becommerce.entity.BookingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingImageRepository extends JpaRepository<BookingImage, Long> {
}
