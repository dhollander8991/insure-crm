package com.insurecrm.customer_service;

import java.time.LocalDate;

public record CustomerResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String israeliId,
        LocalDate dateOfBirth,
        String agentEmail,
        String status
) {}