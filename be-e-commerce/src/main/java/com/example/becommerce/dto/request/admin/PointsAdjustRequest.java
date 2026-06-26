package com.example.becommerce.dto.request.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointsAdjustRequest {

    /** Signed point delta to apply: positive to add, negative to subtract. */
    @NotNull(message = "Số điểm điều chỉnh là bắt buộc")
    private Long points;

    @Size(max = 255, message = "Lý do tối đa 255 ký tự")
    private String reason;
}
