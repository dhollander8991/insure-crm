package com.insurecrm.policy_service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    private final PolicyRepository policyRepository;

    public DataSeeder(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    @Override
    public void run(String... args) {
        if (policyRepository.count() > 0) return;

        List<Policy> policies = List.of(
                policy("POL-A1B2C", 1L, "Moshe Cohen", Policy.PolicyType.CAR,
                        Policy.PolicyStatus.ACTIVE, LocalDate.of(2024, 1, 1),
                        LocalDate.of(2025, 1, 1), new BigDecimal("450.00"), "agent@insure.com"),
                policy("POL-D3E4F", 1L, "Moshe Cohen", Policy.PolicyType.APARTMENT,
                        Policy.PolicyStatus.ACTIVE, LocalDate.of(2024, 3, 1),
                        LocalDate.of(2025, 3, 1), new BigDecimal("320.00"), "agent@insure.com"),
                policy("POL-G5H6I", 2L, "Yael Levi", Policy.PolicyType.HEALTH,
                        Policy.PolicyStatus.ACTIVE, LocalDate.of(2024, 2, 15),
                        LocalDate.of(2025, 2, 15), new BigDecimal("280.00"), "agent@insure.com"),
                policy("POL-J7K8L", 2L, "Yael Levi", Policy.PolicyType.LIFE,
                        Policy.PolicyStatus.PENDING, LocalDate.of(2024, 6, 1),
                        LocalDate.of(2034, 6, 1), new BigDecimal("550.00"), "agent@insure.com"),
                policy("POL-M9N0O", 3L, "David Mizrahi", Policy.PolicyType.CAR,
                        Policy.PolicyStatus.EXPIRED, LocalDate.of(2023, 1, 1),
                        LocalDate.of(2024, 1, 1), new BigDecimal("400.00"), "agent@insure.com"),
                policy("POL-P1Q2R", 3L, "David Mizrahi", Policy.PolicyType.APARTMENT,
                        Policy.PolicyStatus.ACTIVE, LocalDate.of(2024, 4, 1),
                        LocalDate.of(2025, 4, 1), new BigDecimal("290.00"), "agent@insure.com"),
                policy("POL-S3T4U", 4L, "Tamar Shapiro", Policy.PolicyType.HEALTH,
                        Policy.PolicyStatus.CANCELLED, LocalDate.of(2023, 6, 1),
                        LocalDate.of(2024, 6, 1), new BigDecimal("310.00"), "agent@insure.com"),
                policy("POL-V5W6X", 4L, "Tamar Shapiro", Policy.PolicyType.LIFE,
                        Policy.PolicyStatus.ACTIVE, LocalDate.of(2024, 1, 15),
                        LocalDate.of(2034, 1, 15), new BigDecimal("600.00"), "agent@insure.com"),
                policy("POL-Y7Z8A", 5L, "Avi Peretz", Policy.PolicyType.CAR,
                        Policy.PolicyStatus.ACTIVE, LocalDate.of(2024, 5, 1),
                        LocalDate.of(2025, 5, 1), new BigDecimal("380.00"), "agent@insure.com"),
                policy("POL-B9C0D", 5L, "Avi Peretz", Policy.PolicyType.HEALTH,
                        Policy.PolicyStatus.ACTIVE, LocalDate.of(2024, 3, 15),
                        LocalDate.of(2025, 3, 15), new BigDecimal("260.00"), "agent@insure.com")
        );

        policyRepository.saveAll(policies);
        log.info("Seeded {} policies", policies.size());
    }

    private Policy policy(String policyNumber, Long customerId, String customerName,
                          Policy.PolicyType type, Policy.PolicyStatus status,
                          LocalDate startDate, LocalDate endDate,
                          BigDecimal premium, String agentEmail) {
        Policy p = new Policy();
        p.setPolicyNumber(policyNumber);
        p.setCustomerId(customerId);
        p.setCustomerName(customerName);
        p.setType(type);
        p.setStatus(status);
        p.setStartDate(startDate);
        p.setEndDate(endDate);
        p.setPremium(premium);
        p.setAgentEmail(agentEmail);
        return p;
    }
}
