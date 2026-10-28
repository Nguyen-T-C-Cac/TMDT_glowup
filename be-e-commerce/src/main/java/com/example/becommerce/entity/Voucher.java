package com.example.becommerce.entity;

import com.example.becommerce.entity.enums.VoucherDiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * A voucher/promotion that customers can save from the rewards page and
 * later redeem when paying an order invoice.
 */
@Entity
@Table(name = "vouchers",
        indexes = {
                @Index(name = "idx_voucher_code", columnList = "code", unique = true)
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 500)
    private String description;

    /** UI tone used by the rewards page card, e.g. hot / vip / expiring / new. */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String tone = "hot";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String badge = "HOT";

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 10)
    @Builder.Default
    private VoucherDiscountType discountType = VoucherDiscountType.FIXED;

    /** Fixed amount in VND, or percent (0-100) depending on discountType. */
    @Column(name = "discount_value", nullable = false)
    private Long discountValue;

    /** Only relevant when discountType = PERCENT. Null = no cap. */
    @Column(name = "max_discount_amount")
    private Long maxDiscountAmount;

    @Column(name = "min_order_amount", nullable = false)
    @Builder.Default
    private Long minOrderAmount = 0L;

    /** Total number of times this voucher can be saved. Null = unlimited. */
    @Column
    private Integer quota;

    @Column(name = "per_user_limit", nullable = false)
    @Builder.Default
    private Integer perUserLimit = 1;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        LocalDateTime now = LocalDateTime.now();
        if (startAt != null && now.isBefore(startAt)) {
            return true;
        }
        return endAt != null && now.isAfter(endAt);
    }
}
