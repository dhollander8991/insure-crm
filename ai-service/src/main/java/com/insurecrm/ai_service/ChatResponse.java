package com.insurecrm.ai_service;

public record ChatResponse(
        String message,
        String agentEmail
) {}