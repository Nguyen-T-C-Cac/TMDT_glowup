package com.example.becommerce.service;

import com.example.becommerce.dto.request.technician.UpdateAvailabilityRequest;
import com.example.becommerce.dto.request.technician.UpdateTechnicianProfileRequest;
import com.example.becommerce.dto.response.PagedResponse;
import com.example.becommerce.dto.response.technician.AvailabilityResponse;
import com.example.becommerce.dto.response.technician.TechnicianDashboardResponse;
import com.example.becommerce.dto.response.technician.CompletedProjectResponse;
import com.example.becommerce.dto.response.technician.TechnicianDetailResponse;
import com.example.becommerce.dto.response.technician.TechnicianListItemResponse;
import com.example.becommerce.dto.response.technician.TechnicianProfileUpdateResponse;
import com.example.becommerce.dto.response.technician.TechnicianReviewListResponse;
import com.example.becommerce.dto.response.technician.TechnicianScheduleResponse;

import java.time.LocalDate;

import java.util.List;

public interface TechnicianService {

    PagedResponse<TechnicianListItemResponse> listTechnicians(
            String service, String district, Boolean isAvailable, Double minRating,
            String keyword, int page, int limit);

    TechnicianDetailResponse getTechnician(String code);

    TechnicianProfileUpdateResponse updateProfile(String code, UpdateTechnicianProfileRequest request);

    AvailabilityResponse updateAvailability(String code, UpdateAvailabilityRequest request);

    TechnicianReviewListResponse listReviews(String code, int page, int limit);

    /** Aggregated overview/dashboard data for a technician (self or admin). */
    TechnicianDashboardResponse getDashboard(String code);

    /**
     * Returns the list of completed orders (projects) for the technician identified
     * by {@code code}. Only orders with status COMPLETED are included.
     */
    List<CompletedProjectResponse> listCompletedProjects(String code);
    TechnicianScheduleResponse getTechnicianSchedule(String code, LocalDate from, LocalDate to);
}
