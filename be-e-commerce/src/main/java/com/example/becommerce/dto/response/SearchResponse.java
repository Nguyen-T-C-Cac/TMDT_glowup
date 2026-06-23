package com.example.becommerce.dto.response;

import com.example.becommerce.dto.response.category.CategoryResponse;
import com.example.becommerce.dto.response.technician.TechnicianListItemResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SearchResponse {
    private final List<CategoryResponse> categories;
    private final PagedResponse<TechnicianListItemResponse> technicians;
}
