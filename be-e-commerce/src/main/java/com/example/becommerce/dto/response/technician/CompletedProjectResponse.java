package com.example.becommerce.dto.response.technician;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

/**
 * Lightweight DTO representing a completed order shown in the
 * "Dự án đã làm" (completed projects) tab on a technician's public profile.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompletedProjectResponse {

    /** Order primary key */
    private Long id;

    /** Human-readable order code, e.g. GU-99210 */
    private String code;

    /** Name of the service category, e.g. "Điện lạnh" */
    private String serviceCategory;

    /** Name of the service, e.g. "Vệ sinh máy lạnh" */
    private String serviceName;

    /** Work description from the order */
    private String description;

    /** Device name / model specified in the order, e.g. "Máy lạnh Panasonic" */
    private String deviceName;
}