package com.insurecrm.policy_service;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PolicyResponse(
        Long id,
        String policyNumber,
        Long customerId,
        String customerName,
        String type,
        String status,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal premium,
        String agentEmail
) {}