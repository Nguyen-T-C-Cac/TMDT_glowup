package com.example.becommerce.dto.request.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotBlank(message = "Mã dịch vụ không được trống")
    private String categoryCode;

    private String deviceTypeCode;

    private String brandCode;

    private String technicianCode;

    @NotBlank(message = "Mô tả sự cố không được trống")
    private String description;

    private String urgency;

    private LocalDate scheduledDate;

    private String preferredTime;

    @NotBlank(message = "Địa chỉ không được trống")
    private String address;

    private String phone;

    private List<String> imageUrls;
}
