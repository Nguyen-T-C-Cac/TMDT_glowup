package com.example.becommerce.dto.mapper;

import com.example.becommerce.dto.response.chat.EmbeddedBooking;
import com.example.becommerce.dto.response.chat.MessageResponse;
import com.example.becommerce.entity.Conversation;
import com.example.becommerce.entity.Message;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.enums.MessageType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class MessageMapper {

    private final QuotationMapper quotationMapper;
    private final ObjectMapper objectMapper;

    public MessageMapper(QuotationMapper quotationMapper, ObjectMapper objectMapper) {
        this.quotationMapper = quotationMapper;
        this.objectMapper = objectMapper;
    }

    public MessageResponse toResponse(Message m, User viewer, LocalDateTime watermark) {
        if (m == null) return null;

        Conversation conv = m.getConversation();
        boolean isRead;
        if (viewer != null && m.getSender() != null && m.getSender().getId().equals(viewer.getId())) {
            isRead = true;
        } else {
            isRead = watermark != null && m.getSentAt() != null && !m.getSentAt().isAfter(watermark);
        }

        String senderRole = m.getSender() == null ? null : m.getSender().getRole().name();

        EmbeddedBooking embeddedBooking = null;
        if (m.getType() == MessageType.BOOKING && m.getContent() != null) {
            embeddedBooking = parseBookingContent(m.getContent());
        }

        return MessageResponse.builder()
                .id(m.getCode())
                .conversationId(conv == null ? null : conv.getCode())
                .senderId(m.getSender() == null ? null : m.getSender().getCode())
                .senderRole(senderRole)
                .type(m.getType() == null ? null : m.getType().apiValue())
                .content(m.getContent())
                .title(m.getTitle())
                .quotation(quotationMapper.toEmbedded(m.getQuotation()))
                .booking(embeddedBooking)
                .sentAt(m.getSentAt())
                .isRead(isRead)
                .build();
    }

    @SuppressWarnings("unchecked")
    private EmbeddedBooking parseBookingContent(String json) {
        try {
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            List<String> imageUrls = Collections.emptyList();
            if (map.get("imageUrls") instanceof List) {
                imageUrls = (List<String>) map.get("imageUrls");
            }

            LocalDate scheduledDate = null;
            if (map.get("scheduledDate") instanceof String s && !s.isBlank()) {
                try {
                    scheduledDate = LocalDate.parse(s);
                } catch (Exception ignored) {}
            }

            return EmbeddedBooking.builder()
                    .id(asStr(map.get("id")))
                    .code(asStr(map.get("code")))
                    .categoryName(asStr(map.get("categoryName")))
                    .deviceTypeName(asStr(map.get("deviceTypeName")))
                    .brandName(asStr(map.get("brandName")))
                    .customerName(asStr(map.get("customerName")))
                    .technicianName(asStr(map.get("technicianName")))
                    .description(asStr(map.get("description")))
                    .urgency(asStr(map.get("urgency")))
                    .scheduledDate(scheduledDate)
                    .preferredTime(asStr(map.get("preferredTime")))
                    .address(asStr(map.get("address")))
                    .phone(asStr(map.get("phone")))
                    .status(asStr(map.get("status")))
                    .imageUrls(imageUrls)
                    .build();
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse booking content JSON: {}", json, e);
            return null;
        }
    }

    private String asStr(Object value) {
        return value == null ? null : value.toString();
    }
}
