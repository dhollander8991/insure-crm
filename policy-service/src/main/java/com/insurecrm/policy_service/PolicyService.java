package com.insurecrm.policy_service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final CustomerServiceClient customerServiceClient;

    public PolicyService(PolicyRepository policyRepository,
                         CustomerServiceClient customerServiceClient) {
        this.policyRepository = policyRepository;
        this.customerServiceClient = customerServiceClient;
    }

    @Transactional
    public PolicyResponse create(PolicyRequest request) {
        // Validate against customer-service BEFORE opening a transaction so
        // no DB connection is held during the outbound HTTP call.
        if (!customerServiceClient.customerExists(request.customerId())) {
            throw new RuntimeException("Customer not found in customer-service");
        }

        Policy policy = new Policy();
        policy.setPolicyNumber(generatePolicyNumber());
        policy.setCustomerId(request.customerId());
        policy.setCustomerName(request.customerName());
        policy.setType(request.type());
        policy.setStatus(request.status() != null ? request.status() : Policy.PolicyStatus.PENDING);
        policy.setStartDate(request.startDate());
        policy.setEndDate(request.endDate());
        policy.setPremium(request.premium());
        policy.setAgentEmail(request.agentEmail());

        return toResponse(policyRepository.save(policy));
    }

    @Transactional(readOnly = true)
    public Page<PolicyResponse> getAll(Pageable pageable) {
        return policyRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PolicyResponse getById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        return toResponse(policy);
    }

    @Transactional
    public PolicyResponse update(Long id, PolicyRequest request) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        policy.setType(request.type());
        policy.setStatus(request.status());
        policy.setStartDate(request.startDate());
        policy.setEndDate(request.endDate());
        policy.setPremium(request.premium());
        policy.setAgentEmail(request.agentEmail());

        return toResponse(policyRepository.save(policy));
    }

    @Transactional
    public void delete(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        policyRepository.delete(policy);
    }

    @Transactional(readOnly = true)
    public List<PolicyResponse> getByCustomer(Long customerId) {
        return policyRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PolicyResponse> getByAgent(String agentEmail) {
        return policyRepository.findByAgentEmail(agentEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PolicyResponse> getByStatus(Policy.PolicyStatus status) {
        return policyRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String generatePolicyNumber() {
        String number;
        do {
            number = "POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (policyRepository.findByPolicyNumber(number).isPresent());
        return number;
    }

    private PolicyResponse toResponse(Policy policy) {
        return new PolicyResponse(
                policy.getId(),
                policy.getPolicyNumber(),
                policy.getCustomerId(),
                policy.getCustomerName(),
                policy.getType().name(),
                policy.getStatus().name(),
                policy.getStartDate(),
                policy.getEndDate(),
                policy.getPremium(),
                policy.getAgentEmail()
        );
    }
}
