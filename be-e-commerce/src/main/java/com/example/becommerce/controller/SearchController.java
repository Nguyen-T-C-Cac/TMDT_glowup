package com.example.becommerce.controller;

import com.example.becommerce.dto.response.ApiResponse;
import com.example.becommerce.dto.response.PagedResponse;
import com.example.becommerce.dto.response.SearchResponse;
import com.example.becommerce.dto.response.category.CategoryResponse;
import com.example.becommerce.dto.response.technician.TechnicianListItemResponse;
import com.example.becommerce.service.CategoryService;
import com.example.becommerce.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final CategoryService categoryService;
    private final TechnicianService technicianService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResponse>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        List<CategoryResponse> categories = categoryService.searchCategories(keyword);
        PagedResponse<TechnicianListItemResponse> technicians =
                technicianService.listTechnicians(null, null, null, null, keyword, null, page, limit);
        return ResponseEntity.ok(ApiResponse.success(
                SearchResponse.builder()
                        .categories(categories)
                        .technicians(technicians)
                        .build()));
    }
}
