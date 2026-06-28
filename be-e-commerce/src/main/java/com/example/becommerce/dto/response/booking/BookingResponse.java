package com.example.becommerce.dto.response.booking;

import com.example.becommerce.dto.response.chat.ConversationCreatedResponse;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {

    private String id;
    private String code;
    private String categoryCode;
    private String categoryName;
    private String deviceTypeCode;
    private String deviceTypeName;
    private String brandCode;
    private String brandName;
    private String customerCode;
    private String customerName;
    private String technicianCode;
    private String technicianName;
    private String description;
    private String urgency;
    private LocalDate scheduledDate;
    private String preferredTime;
    private String address;
    private String phone;
    private String status;
    private String conversationId;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
}
