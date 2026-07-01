package com.example.becommerce.dto.response.technician;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Aggregated data for the technician overview/dashboard page (TN5):
 * headline stats, today's schedule, and earnings trend.
 */
@Getter
@Builder
public class TechnicianDashboardResponse {

    /** Orders accepted/assigned/scheduled/in-progress but not yet completed. */
    private final long newOrders;
    /** All-time completed orders. */
    private final long completedOrders;
    /** Orders completed today. */
    private final long completedToday;
    /** Earnings (final price of completed orders) today. */
    private final long todayEarnings;
    /** Earnings this calendar month. */
    private final long monthEarnings;

    private final List<ScheduleItem> todaySchedule;
    private final List<EarningPoint> earnings7d;
    private final List<EarningPoint> earnings30d;

    @Getter
    @Builder
    public static class ScheduleItem {
        private final String code;
        private final String serviceName;
        private final String deviceName;
        private final String customerName;
        private final String address;
        private final LocalDateTime scheduledAt;
        private final LocalDateTime expectedTime;
        private final String status; // apiValue, e.g. "in-progress"
    }

    @Getter
    @Builder
    public static class EarningPoint {
        private final String label;
        private final long amount;
    }
}
