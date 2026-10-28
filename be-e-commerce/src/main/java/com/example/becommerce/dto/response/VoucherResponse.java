package com.example.becommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VoucherResponse {
    private String code;
    private String title;
    private String description;
    private String tone;
    private String badge;
    private String discountType;
    private Long discountValue;
    private Long maxDiscountAmount;
    private Long minOrderAmount;
    private LocalDateTime endAt;
    private boolean saved;
    private boolean used;
}
