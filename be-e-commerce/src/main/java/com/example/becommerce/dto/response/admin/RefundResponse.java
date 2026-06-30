package com.example.becommerce.dto.response.admin;

import com.example.becommerce.entity.Refund;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class RefundResponse {

    private final String code;
    private final String orderCode;
    private final String customerName;
    private final String technicianName;
    private final BigDecimal amount;
    private final String reason;
    private final String method;
    private final String customerBankName;
    private final String customerBankAccountNumber;
    private final String customerBankAccountOwner;
    private final String status;
    private final boolean technicianDebt;
    private final BigDecimal technicianBalanceAfter;
    private final boolean technicianLocked;
    private final LocalDateTime createdAt;

    /** Lightweight mapping for list views (balance-after not recomputed). */
    public static RefundResponse ofSummary(Refund refund) {
        boolean locked = refund.getTechnician() != null && refund.getTechnician().isLocked();
        return of(refund, null, locked);
    }

    public static RefundResponse of(Refund refund, BigDecimal technicianBalanceAfter, boolean technicianLocked) {
        return RefundResponse.builder()
                .code(refund.getCode())
                .orderCode(refund.getOrder() != null ? refund.getOrder().getCode() : null)
                .customerName(refund.getCustomer() != null ? refund.getCustomer().getFullName() : null)
                .technicianName(refund.getTechnician() != null ? refund.getTechnician().getFullName() : null)
                .amount(refund.getAmount())
                .reason(refund.getReason())
                .method(refund.getMethod() != null ? refund.getMethod().apiValue() : null)
                .customerBankName(refund.getCustomerBankName())
                .customerBankAccountNumber(refund.getCustomerBankAccountNumber())
                .customerBankAccountOwner(refund.getCustomerBankAccountOwner())
                .status(refund.getStatus().apiValue())
                .technicianDebt(refund.isTechnicianDebt())
                .technicianBalanceAfter(technicianBalanceAfter)
                .technicianLocked(technicianLocked)
                .createdAt(refund.getCreatedAt())
                .build();
    }
}
