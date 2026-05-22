package com.insurecrm.customer_service;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByAgentEmail(String agentEmail);
    List<Customer> findByStatus(Customer.CustomerStatus status);
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByIsraeliId(String israeliId);
}