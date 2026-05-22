package com.insurecrm.policy_service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class CustomerServiceClient {

    private final WebClient webClient;

    public CustomerServiceClient(@Value("${customer.service.url}") String customerServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(customerServiceUrl)
                .build();
    }

    public boolean customerExists(Long customerId) {
        try {
            webClient.get()
                    .uri("/customers/" + customerId)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}