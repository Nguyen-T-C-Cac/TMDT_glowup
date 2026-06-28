package com.example.becommerce.dto.response.booking;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeviceTypeResponse {

    private String code;
    private String name;
    private String categoryCode;
}
