package com.example.becommerce.dto.response.schedule;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder @JsonInclude(JsonInclude.Include.NON_NULL)
public class ScheduleSlotResponse {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String title;
    private String slotType;   // "MANUAL" | "ORDER"
    private String orderId;    // chỉ trả về nếu là slot từ đơn hàng (thợ xem)
    private String customerName;
    private String customerPhone;
    private String serviceDescription;
    private String address;
}
