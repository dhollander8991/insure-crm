package com.insurecrm.ai_service;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ChatRequest(
        @NotBlank(message = "Message is required")
        String message,

        String agentEmail,

        List<HistoryMessage> history
) {
    public record HistoryMessage(String role, String content) {}
}
