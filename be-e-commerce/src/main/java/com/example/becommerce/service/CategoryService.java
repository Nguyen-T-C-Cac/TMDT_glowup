package com.example.becommerce.service;

import com.example.becommerce.dto.request.category.CategoryStatusRequest;
import com.example.becommerce.dto.request.category.CategoryUpsertRequest;
import com.example.becommerce.dto.response.category.CategoryDeleteResponse;
import com.example.becommerce.dto.response.category.CategoryListResponse;
import com.example.becommerce.dto.response.category.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryListResponse getCategories(String status);

    List<CategoryResponse> searchCategories(String keyword);

    CategoryResponse createCategory(CategoryUpsertRequest request);

    CategoryResponse updateCategory(String id, CategoryUpsertRequest request);

    CategoryDeleteResponse deleteCategory(String id);

    CategoryResponse updateStatus(String id, CategoryStatusRequest request);
}
