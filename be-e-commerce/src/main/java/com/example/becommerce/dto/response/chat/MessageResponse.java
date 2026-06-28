package com.example.becommerce.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessageResponse {

    private String id;
    private String conversationId;
    private String senderId;

    /** Sender's role: "ADMIN", "CUSTOMER", "TECHNICIAN". */
    private String senderRole;

    private String type;
    private String content;

    /** Optional title for admin / system messages. */
    private String title;

    /** Set only when {@code type == "quotation"}. */
    private EmbeddedQuotation quotation;

    /** Set only when {@code type == "booking"}. */
    private EmbeddedBooking booking;

    private LocalDateTime sentAt;
    private Boolean isRead;
}
