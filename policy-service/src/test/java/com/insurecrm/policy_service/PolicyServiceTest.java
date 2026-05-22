package com.insurecrm.policy_service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock private PolicyRepository policyRepository;
    @Mock private CustomerServiceClient customerServiceClient;
    @InjectMocks private PolicyService policyService;

    private PolicyRequest buildRequest(Long customerId, Policy.PolicyStatus status) {
        return new PolicyRequest(customerId, "John Doe", Policy.PolicyType.CAR,
                LocalDate.now(), LocalDate.now().plusYears(1),
                new BigDecimal("1200.00"), "agent@test.com", status);
    }

    private Policy buildPolicy(Long id, Long customerId) {
        Policy p = new Policy();
        p.setId(id);
        p.setPolicyNumber("POL-ABCDE");
        p.setCustomerId(customerId);
        p.setCustomerName("John Doe");
        p.setType(Policy.PolicyType.CAR);
        p.setStatus(Policy.PolicyStatus.ACTIVE);
        p.setStartDate(LocalDate.now());
        p.setEndDate(LocalDate.now().plusYears(1));
        p.setPremium(new BigDecimal("1200.00"));
        p.setAgentEmail("agent@test.com");
        return p;
    }

    @Test
    void create_customerExists_returnsPolicyResponse() {
        when(customerServiceClient.customerExists(1L)).thenReturn(true);
        when(policyRepository.findByPolicyNumber(any())).thenReturn(Optional.empty());
        when(policyRepository.save(any())).thenReturn(buildPolicy(1L, 1L));

        PolicyResponse response = policyService.create(buildRequest(1L, Policy.PolicyStatus.ACTIVE));

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.type()).isEqualTo("CAR");
        assertThat(response.customerId()).isEqualTo(1L);
        verify(policyRepository).save(any());
    }

    @Test
    void create_nullStatus_defaultsToPending() {
        Policy saved = buildPolicy(1L, 1L);
        saved.setStatus(Policy.PolicyStatus.PENDING);
        when(customerServiceClient.customerExists(1L)).thenReturn(true);
        when(policyRepository.findByPolicyNumber(any())).thenReturn(Optional.empty());
        when(policyRepository.save(any())).thenReturn(saved);

        PolicyResponse response = policyService.create(buildRequest(1L, null));

        assertThat(response.status()).isEqualTo("PENDING");
    }

    @Test
    void create_customerNotFound_throwsException() {
        when(customerServiceClient.customerExists(99L)).thenReturn(false);

        assertThatThrownBy(() -> policyService.create(buildRequest(99L, null)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Customer not found in customer-service");

        verify(policyRepository, never()).save(any());
    }

    @Test
    void getAll_multiplePolicies_returnsList() {
        when(policyRepository.findAll()).thenReturn(List.of(buildPolicy(1L, 1L), buildPolicy(2L, 2L)));

        List<PolicyResponse> result = policyService.getAll();

        assertThat(result).hasSize(2);
    }

    @Test
    void getAll_noPolicies_returnsEmptyList() {
        when(policyRepository.findAll()).thenReturn(Collections.emptyList());

        assertThat(policyService.getAll()).isEmpty();
    }

    @Test
    void getById_found_returnsPolicyResponse() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(buildPolicy(1L, 1L)));

        PolicyResponse response = policyService.getById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.policyNumber()).isEqualTo("POL-ABCDE");
    }

    @Test
    void getById_notFound_throwsException() {
        when(policyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> policyService.getById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Policy not found");
    }

    @Test
    void update_existingPolicy_returnsUpdatedResponse() {
        Policy existing = buildPolicy(1L, 1L);
        PolicyRequest request = new PolicyRequest(1L, "John Doe", Policy.PolicyType.LIFE,
                LocalDate.now(), LocalDate.now().plusYears(2),
                new BigDecimal("2000.00"), "agent2@test.com", Policy.PolicyStatus.ACTIVE);

        when(policyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(policyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PolicyResponse response = policyService.update(1L, request);

        assertThat(response.type()).isEqualTo("LIFE");
        assertThat(response.premium()).isEqualByComparingTo(new BigDecimal("2000.00"));
        assertThat(response.agentEmail()).isEqualTo("agent2@test.com");
    }

    @Test
    void update_notFound_throwsException() {
        when(policyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> policyService.update(99L, buildRequest(1L, Policy.PolicyStatus.ACTIVE)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Policy not found");
    }

    @Test
    void delete_existingPolicy_callsDeleteById() {
        when(policyRepository.existsById(1L)).thenReturn(true);

        policyService.delete(1L);

        verify(policyRepository).deleteById(1L);
    }

    @Test
    void delete_notFound_throwsException() {
        when(policyRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> policyService.delete(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Policy not found");

        verify(policyRepository, never()).deleteById(any());
    }

    @Test
    void getByCustomer_returnsPoliciesForCustomer() {
        when(policyRepository.findByCustomerId(1L))
                .thenReturn(List.of(buildPolicy(1L, 1L), buildPolicy(2L, 1L)));

        List<PolicyResponse> result = policyService.getByCustomer(1L);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(r -> r.customerId().equals(1L));
    }

    @Test
    void getByCustomer_noMatches_returnsEmptyList() {
        when(policyRepository.findByCustomerId(99L)).thenReturn(Collections.emptyList());

        assertThat(policyService.getByCustomer(99L)).isEmpty();
    }

    @Test
    void getByAgent_returnsPoliciesForAgent() {
        when(policyRepository.findByAgentEmail("agent@test.com"))
                .thenReturn(List.of(buildPolicy(1L, 1L)));

        List<PolicyResponse> result = policyService.getByAgent("agent@test.com");

        assertThat(result).hasSize(1);
    }

    @Test
    void getByStatus_active_returnsActivePolicies() {
        Policy active = buildPolicy(1L, 1L);
        when(policyRepository.findByStatus(Policy.PolicyStatus.ACTIVE)).thenReturn(List.of(active));

        List<PolicyResponse> result = policyService.getByStatus(Policy.PolicyStatus.ACTIVE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo("ACTIVE");
    }
}
