package com.insurecrm.ai_service;

import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Component
public class InsuranceCrmTools {

    private final WebClient customerClient;
    private final WebClient policyClient;

    public InsuranceCrmTools(
            @Value("${customer.service.url}") String customerServiceUrl,
            @Value("${policy.service.url}") String policyServiceUrl) {
        this.customerClient = WebClient.builder()
                .baseUrl(customerServiceUrl)
                .build();
        this.policyClient = WebClient.builder()
                .baseUrl(policyServiceUrl)
                .build();
    }

    @Tool("Get all customers for a specific agent by their email address")
    public String getCustomersByAgent(String agentEmail) {
        try {
            return customerClient.get()
                    .uri(b -> b.path("/v1/customers/agent/{email}").build(agentEmail))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            return "Error fetching customers: " + e.getMessage();
        }
    }

    @Tool("Get all policies for a specific customer by their customer ID")
    public String getPoliciesByCustomer(Long customerId) {
        try {
            return policyClient.get()
                    .uri(b -> b.path("/v1/policies/customer/{id}").build(customerId))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            return "Error fetching policies: " + e.getMessage();
        }
    }

    @Tool("Get all policies filtered by status. Valid statuses are: ACTIVE, EXPIRED, CANCELLED, PENDING")
    public String getPoliciesByStatus(String status) {
        try {
            return policyClient.get()
                    .uri(b -> b.path("/v1/policies/status/{status}").build(status))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            return "Error fetching policies by status: " + e.getMessage();
        }
    }

    @Tool("Get a specific customer by their ID")
    public String getCustomerById(Long customerId) {
        try {
            return customerClient.get()
                    .uri(b -> b.path("/v1/customers/{id}").build(customerId))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            return "Error fetching customer: " + e.getMessage();
        }
    }

    @Tool("Get all policies for a specific agent by their email address")
    public String getPoliciesByAgent(String agentEmail) {
        try {
            return policyClient.get()
                    .uri(b -> b.path("/v1/policies/agent/{email}").build(agentEmail))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            return "Error fetching policies: " + e.getMessage();
        }
    }

    @Tool("Get all customers in the system")
    public String getAllCustomers() {
        try {
            return customerClient.get()
                    .uri("/v1/customers")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            return "Error fetching all customers: " + e.getMessage();
        }
    }

    @Tool("Get all policies in the system")
    public String getAllPolicies() {
        try {
            return policyClient.get()
                    .uri("/v1/policies")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            return "Error fetching all policies: " + e.getMessage();
        }
    }
}
