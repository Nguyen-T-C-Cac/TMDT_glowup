package com.example.becommerce.dto.response.warranty;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PreviousWarrantyClaimResponse {

    private String id;
    private String description;
    private List<String> images;
    private LocalDateTime scheduledAt;
    private String rejectReason;
    private LocalDateTime createdAt;
}
/* chứa thông tin yêu cầu bảo hành trước bị từ chối. */