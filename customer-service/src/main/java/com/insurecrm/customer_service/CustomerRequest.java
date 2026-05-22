package com.insurecrm.customer_service;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CustomerRequest(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        String email,

        @Pattern(regexp = "^05\\d{8}$", message = "Invalid Israeli phone number")
        String phone,

        @Pattern(regexp = "^\\d{9}$", message = "Israeli ID must be 9 digits")
        String israeliId,

        LocalDate dateOfBirth,

        @NotBlank(message = "Agent email is required")
        String agentEmail,

        Customer.CustomerStatus status
) {}