package com.example.becommerce.dto.response.technician;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TechnicianScheduleResponse {

    private Map<String, String> weeklySchedule;
    private List<BookedSlot> bookedSlots;

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BookedSlot {
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String orderCode;
        private String status;
    }
}
