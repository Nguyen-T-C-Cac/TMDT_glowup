package com.example.becommerce.dto.response.booking;

import com.example.becommerce.dto.response.chat.ChatPartnerSummary;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingSubmitResponse {

    private BookingResponse booking;
    private String conversationId;
    private String orderId;
    private ChatPartnerSummary partner;
}
