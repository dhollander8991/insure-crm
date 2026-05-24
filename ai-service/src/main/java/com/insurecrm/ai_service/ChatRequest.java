package com.insurecrm.ai_service;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank(message = "Message is required")
        String message,

        String agentEmail
) {}