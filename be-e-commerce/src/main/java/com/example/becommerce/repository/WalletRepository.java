package com.example.becommerce.repository;

import com.example.becommerce.entity.Wallet;
import com.example.becommerce.entity.enums.WalletStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long>, JpaSpecificationExecutor<Wallet> {

    Optional<Wallet> findByUser_Id(Long userId);

    boolean existsByUser_Id(Long userId);

    boolean existsByUser_IdAndCurrency(Long userId, String currency);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Wallet> findWithLockByUser_Id(Long userId);

    @Query("select coalesce(sum(w.balance), 0) from Wallet w")
    BigDecimal sumBalance();

    Page<Wallet> findByWalletStatus(WalletStatus walletStatus, Pageable pageable);

    @Query("select w from Wallet w join w.user u where u.role = 'TECHNICIAN' and u.deleted = false and u.status = :status")
    Page<Wallet> findTechnicianWalletsByStatus(@Param("status") String status, Pageable pageable);
}

