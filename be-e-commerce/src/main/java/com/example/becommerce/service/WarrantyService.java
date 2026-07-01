package com.example.becommerce.service;

import com.example.becommerce.dto.request.warranty.CreateWarrantyRequest;
import com.example.becommerce.dto.response.warranty.WarrantyResponse;

public interface WarrantyService {

    WarrantyResponse createWarranty(String orderCode, CreateWarrantyRequest request);

    WarrantyResponse getWarrantyByOrder(String orderCode);

    WarrantyResponse acceptWarranty(String warrantyCode);

    WarrantyResponse rejectWarranty(String warrantyCode, String reason);
}
