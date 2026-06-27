package com.example.becommerce.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmbeddedBooking {

    private String id;
    private String code;
    private String categoryName;
    private String deviceTypeName;
    private String brandName;
    private String customerName;
    private String technicianName;
    private String description;
    private String urgency;
    private LocalDate scheduledDate;
    private String preferredTime;
    private String address;
    private String phone;
    private String status;
    private List<String> imageUrls;
}
