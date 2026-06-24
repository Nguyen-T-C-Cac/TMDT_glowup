package com.example.becommerce.dto.request.chat;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    /** Partner technician's user code, e.g. TECH-001. Used by customers starting a chat. */
    private String technicianId;

    /** Partner customer's user code, e.g. CUS-001. Used by admin starting a chat with a customer. */
    private String customerId;

    /** Optional — link the chat to an existing order. */
    private String orderId;
}
