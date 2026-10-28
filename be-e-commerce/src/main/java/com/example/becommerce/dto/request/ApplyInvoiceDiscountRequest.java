package com.example.becommerce.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Customer's chosen voucher (optional) and reward points to redeem when
 * paying an order invoice. Send voucherCode = null/blank to clear the
 * currently applied voucher.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplyInvoiceDiscountRequest {

    private String voucherCode;

    @Min(value = 0, message = "Số điểm sử dụng không được âm")
    private Long pointsToUse = 0L;
}
