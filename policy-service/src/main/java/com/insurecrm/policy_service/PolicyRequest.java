package com.insurecrm.policy_service;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PolicyRequest(
    @NotNull(message = "Customer ID is required")
    Long customerId,

    @NotBlank(message = "Customer name is required")
    String customerName,

    @NotNull(message = "Policy type is required")
    Policy.PolicyType type,

    @NotNull(message = "Start date is required")
    LocalDate startDate,

    @NotNull(message = "End date is required")
    LocalDate endDate,

    @NotNull(message = "Premium is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Premium must be greater than 0")
    BigDecimal premium,

    @NotBlank(message = "Agent email is required")
    String agentEmail,

    Policy.PolicyStatus status
) {}