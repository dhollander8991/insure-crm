package com.insurecrm.policy_service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PolicyRepositoryTest {

    @PersistenceContext private EntityManager entityManager;
    @Autowired private PolicyRepository policyRepository;

    private Policy persist(String policyNumber, Long customerId, String agentEmail,
                           Policy.PolicyType type, Policy.PolicyStatus status) {
        Policy p = new Policy();
        p.setPolicyNumber(policyNumber);
        p.setCustomerId(customerId);
        p.setCustomerName("John Doe");
        p.setType(type);
        p.setStatus(status);
        p.setStartDate(LocalDate.now());
        p.setEndDate(LocalDate.now().plusYears(1));
        p.setPremium(new BigDecimal("1200.00"));
        p.setAgentEmail(agentEmail);
        entityManager.persist(p);
        entityManager.flush();
        return p;
    }

    @Test
    void findByPolicyNumber_found_returnsPolicy() {
        persist("POL-AAAAA", 1L, "agent@test.com", Policy.PolicyType.CAR, Policy.PolicyStatus.ACTIVE);

        var result = policyRepository.findByPolicyNumber("POL-AAAAA");

        assertThat(result).isPresent();
        assertThat(result.get().getPolicyNumber()).isEqualTo("POL-AAAAA");
    }

    @Test
    void findByPolicyNumber_notFound_returnsEmpty() {
        assertThat(policyRepository.findByPolicyNumber("POL-XXXXX")).isEmpty();
    }

    @Test
    void findByCustomerId_returnsAllPoliciesForCustomer() {
        persist("POL-CUS01", 1L, "agent@test.com", Policy.PolicyType.CAR, Policy.PolicyStatus.ACTIVE);
        persist("POL-CUS02", 1L, "agent@test.com", Policy.PolicyType.LIFE, Policy.PolicyStatus.PENDING);
        persist("POL-CUS03", 2L, "agent@test.com", Policy.PolicyType.HEALTH, Policy.PolicyStatus.ACTIVE);

        List<Policy> result = policyRepository.findByCustomerId(1L);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(p -> p.getCustomerId().equals(1L));
    }

    @Test
    void findByCustomerId_noMatches_returnsEmpty() {
        assertThat(policyRepository.findByCustomerId(99L)).isEmpty();
    }

    @Test
    void findByAgentEmail_returnsAllPoliciesForAgent() {
        persist("POL-AGT01", 1L, "agent@test.com", Policy.PolicyType.CAR, Policy.PolicyStatus.ACTIVE);
        persist("POL-AGT02", 2L, "agent@test.com", Policy.PolicyType.HEALTH, Policy.PolicyStatus.ACTIVE);
        persist("POL-OTH01", 3L, "other@test.com", Policy.PolicyType.LIFE, Policy.PolicyStatus.ACTIVE);

        List<Policy> result = policyRepository.findByAgentEmail("agent@test.com");

        assertThat(result).hasSize(2);
    }

    @Test
    void findByStatus_active_returnsOnlyActivePolicies() {
        persist("POL-ACT01", 1L, "agent@test.com", Policy.PolicyType.CAR, Policy.PolicyStatus.ACTIVE);
        persist("POL-EXP01", 2L, "agent@test.com", Policy.PolicyType.CAR, Policy.PolicyStatus.EXPIRED);
        persist("POL-CAN01", 3L, "agent@test.com", Policy.PolicyType.CAR, Policy.PolicyStatus.CANCELLED);

        List<Policy> result = policyRepository.findByStatus(Policy.PolicyStatus.ACTIVE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(Policy.PolicyStatus.ACTIVE);
    }

    @Test
    void findByType_car_returnsOnlyCarPolicies() {
        persist("POL-CAR01", 1L, "agent@test.com", Policy.PolicyType.CAR, Policy.PolicyStatus.ACTIVE);
        persist("POL-LIF01", 2L, "agent@test.com", Policy.PolicyType.LIFE, Policy.PolicyStatus.ACTIVE);
        persist("POL-HLT01", 3L, "agent@test.com", Policy.PolicyType.HEALTH, Policy.PolicyStatus.ACTIVE);

        List<Policy> result = policyRepository.findByType(Policy.PolicyType.CAR);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(Policy.PolicyType.CAR);
    }
}
