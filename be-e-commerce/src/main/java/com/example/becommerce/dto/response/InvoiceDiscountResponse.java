package com.example.becommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InvoiceDiscountResponse {
    private String invoiceCode;
    private Long totalPrice;
    private String voucherCode;
    private Long discountAmount;
    private Long pointsUsed;
    private Long pointsDiscountAmount;
    private Long payableAmount;
    private Long availablePoints;
}
