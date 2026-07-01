package com.example.becommerce.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmbeddedWarranty {

    private String event;
    private String warrantyId;
    private String description;
    private List<String> images;
    private String scheduledAt;
    private String warrantyExpiresAt;
    private String customerName;
    private String technicianName;
    private String note;
}
