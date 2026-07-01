package com.example.becommerce.dto.request.warranty;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectWarrantyRequest {

    @NotBlank(message = "Lý do từ chối không được trống")
    private String reason;
}
