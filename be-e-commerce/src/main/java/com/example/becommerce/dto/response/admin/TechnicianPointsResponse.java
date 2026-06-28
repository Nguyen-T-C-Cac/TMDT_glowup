package com.example.becommerce.dto.response.admin;

import com.example.becommerce.entity.PointTransaction;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TechnicianPointsResponse {

    private final String technicianCode;
    private final String technicianName;
    private final long rewardPoints;
    private final List<HistoryItem> history;

    @Getter
    @Builder
    public static class HistoryItem {
        private final long points;
        private final long balanceAfter;
        private final String type;
        private final String note;
        private final String orderCode;
        private final LocalDateTime createdAt;

        public static HistoryItem of(PointTransaction tx) {
            return HistoryItem.builder()
                    .points(tx.getPoints())
                    .balanceAfter(tx.getBalanceAfter())
                    .type(tx.getType() == null ? null : tx.getType().apiValue())
                    .note(tx.getNote())
                    .orderCode(tx.getOrder() != null ? tx.getOrder().getCode() : null)
                    .createdAt(tx.getCreatedAt())
                    .build();
        }
    }
}
