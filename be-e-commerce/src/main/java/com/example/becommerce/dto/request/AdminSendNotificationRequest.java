package com.example.becommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AdminSendNotificationRequest {

    @NotBlank(message = "Tiêu đề là bắt buộc")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @NotBlank(message = "Nội dung là bắt buộc")
    @Size(max = 1000, message = "Nội dung không được vượt quá 1000 ký tự")
    private String body;

    @NotEmpty(message = "Danh sách người nhận là bắt buộc")
    private List<String> recipientCodes;

    private String type;
}
