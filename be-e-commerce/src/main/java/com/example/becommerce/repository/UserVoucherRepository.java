package com.example.becommerce.repository;

import com.example.becommerce.entity.UserVoucher;
import com.example.becommerce.entity.enums.UserVoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {

    Optional<UserVoucher> findByUser_IdAndVoucher_Id(Long userId, Long voucherId);

    Optional<UserVoucher> findByUser_IdAndVoucher_CodeAndStatus(Long userId, String voucherCode, UserVoucherStatus status);

    List<UserVoucher> findByUser_IdAndStatusOrderBySavedAtDesc(Long userId, UserVoucherStatus status);

    long countByVoucher_Id(Long voucherId);
}
