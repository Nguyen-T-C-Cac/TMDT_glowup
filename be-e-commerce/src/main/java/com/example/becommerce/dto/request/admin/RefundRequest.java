package com.example.becommerce.dto.request.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RefundRequest {

    /** Amount to refund. May be less than the order total for a partial refund. */
    @NotNull(message = "Số tiền hoàn là bắt buộc")
    @DecimalMin(value = "1", message = "Số tiền hoàn phải lớn hơn 0")
    private BigDecimal amount;

    @Size(max = 500, message = "Lý do tối đa 500 ký tự")
    private String reason;

    /** "wallet" (default) or "bank-transfer". Parsed leniently server-side. */
    private String method;

    @Size(max = 120, message = "Tên ngân hàng tối đa 120 ký tự")
    private String customerBankName;

    @Size(max = 40, message = "Số tài khoản tối đa 40 ký tự")
    private String customerBankAccountNumber;

    @Size(max = 120, message = "Tên chủ tài khoản tối đa 120 ký tự")
    private String customerBankAccountOwner;
}
