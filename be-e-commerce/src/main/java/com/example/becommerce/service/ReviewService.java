package com.example.becommerce.service;

import com.example.becommerce.dto.request.review.CreateReviewRequest;
import com.example.becommerce.dto.response.review.ReviewResponse;

public interface ReviewService {

    ReviewResponse createReview(String orderCode, CreateReviewRequest request);

    ReviewResponse updateReview(String orderCode, CreateReviewRequest request);

    ReviewResponse getMyReview(String orderCode);
}
