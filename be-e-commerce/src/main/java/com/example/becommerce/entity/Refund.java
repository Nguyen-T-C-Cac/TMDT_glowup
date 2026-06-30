package com.example.becommerce.entity;

import com.example.becommerce.entity.enums.RefundMethod;
import com.example.becommerce.entity.enums.RefundStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * An admin-initiated refund: the platform advances money back to the customer,
 * then deducts it from the technician's credit wallet (negative allowed).
 */
@Entity
@Table(name = "refunds",
        indexes = {
                @Index(name = "idx_refunds_order", columnList = "order_id"),
                @Index(name = "idx_refunds_technician", columnList = "technician_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician;

    @Column(nullable = false, precision = 19, scale = 0)
    private BigDecimal amount;

    @Column(length = 500)
    private String reason;

    /** How the money is returned to the customer. Defaults to in-system wallet credit. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @ColumnDefault("'WALLET'")
    @Builder.Default
    private RefundMethod method = RefundMethod.WALLET;

    /** Customer bank details — only captured for BANK_TRANSFER refunds (admin enters them manually). */
    @Column(name = "customer_bank_name", length = 120)
    private String customerBankName;

    @Column(name = "customer_bank_account_number", length = 40)
    private String customerBankAccountNumber;

    @Column(name = "customer_bank_account_owner", length = 120)
    private String customerBankAccountOwner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RefundStatus status = RefundStatus.PENDING;

    /** True when deducting the refund pushed the technician's credit wallet negative. */
    @Column(name = "technician_debt", nullable = false)
    @Builder.Default
    private boolean technicianDebt = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
