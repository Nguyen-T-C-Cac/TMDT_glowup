package com.example.becommerce.dto.request.schedule;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateScheduleSlotRequest {

    @NotNull(message = "Thời gian bắt đầu không được trống")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được trống")
    private LocalDateTime endTime;

    private String title;

    private String note;
}