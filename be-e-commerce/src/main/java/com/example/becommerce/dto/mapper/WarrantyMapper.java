package com.example.becommerce.dto.mapper;

import com.example.becommerce.dto.response.order.OrderPartySummary;
import com.example.becommerce.dto.response.warranty.PreviousWarrantyClaimResponse;
import com.example.becommerce.dto.response.warranty.WarrantyResponse;
import com.example.becommerce.entity.WarrantyClaim;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class WarrantyMapper {

    public WarrantyResponse toResponse(WarrantyClaim claim) {
        return toResponse(claim, null);
    }

    public WarrantyResponse toResponse(WarrantyClaim claim, WarrantyClaim previousRejectedClaim) {
        return toResponse(claim, previousRejectedClaim, null);
    }

    public WarrantyResponse toResponse(
            WarrantyClaim claim,
            WarrantyClaim previousRejectedClaim,
            Long claimCount
    ) {
        if (claim == null) return null;

        List<String> images = claim.getImages();
        Long remainingDays = calculateRemainingDays(claim.getWarrantyExpiresAt());

        return WarrantyResponse.builder()
                .id(claim.getCode())
                .orderId(claim.getOrder() == null ? null : claim.getOrder().getCode())
                .status(claim.getStatus() == null ? null : claim.getStatus().apiValue())
                .claimCount(claimCount)
                .description(claim.getDescription())
                .images(images != null && !images.isEmpty() ? images : null)
                .scheduledAt(claim.getScheduledAt())
                .warrantyExpiresAt(claim.getWarrantyExpiresAt())
                .remainingDays(remainingDays)
                .rejectReason(claim.getRejectReason())
                .technician(claim.getTechnician() == null ? null : OrderPartySummary.builder()
                        .id(claim.getTechnician().getCode())
                        .fullName(claim.getTechnician().getFullName())
                        .phone(claim.getTechnician().getPhone())
                        .avatar(claim.getTechnician().getAvatar())
                        .build())
                .previousRejectedClaim(previousRejectedClaim == null ? null : toPreviousRejectedClaimResponse(previousRejectedClaim))
                .createdAt(claim.getCreatedAt())
                .build();
    }

    private PreviousWarrantyClaimResponse toPreviousRejectedClaimResponse(WarrantyClaim claim) {
        if (claim == null) return null;

        return PreviousWarrantyClaimResponse.builder()
                .id(claim.getCode())
                .description(claim.getDescription())
                .images(claim.getImages() != null && !claim.getImages().isEmpty() ? claim.getImages() : null)
                .scheduledAt(claim.getScheduledAt())
                .rejectReason(claim.getRejectReason())
                .createdAt(claim.getCreatedAt())
                .build();
    }

    private Long calculateRemainingDays(LocalDateTime expiresAt) {
        if (expiresAt == null) return null;
        Duration remaining = Duration.between(LocalDateTime.now(), expiresAt);
        if (remaining.isNegative()) return 0L;
        long fullDays = remaining.toDays();
        return remaining.minusDays(fullDays).isZero() ? fullDays : fullDays + 1;
    }
}
