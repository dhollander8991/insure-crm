package com.insurecrm.policy_service;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByCustomerId(Long customerId);
    List<Policy> findByAgentEmail(String agentEmail);
    List<Policy> findByStatus(Policy.PolicyStatus status);
    List<Policy> findByType(Policy.PolicyType type);
    Optional<Policy> findByPolicyNumber(String policyNumber);
}