package com.insurecrm.policy_service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.netty.channel.ChannelOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Slf4j
@Component
public class CustomerServiceClient {

    private final WebClient webClient;

    public CustomerServiceClient(@Value("${customer.service.url}") String customerServiceUrl) {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(5))
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000);
        this.webClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(customerServiceUrl)
                .build();
    }

    @CircuitBreaker(name = "customerService", fallbackMethod = "customerExistsFallback")
    public boolean customerExists(Long customerId) {
        return webClient.get()
                .uri("/v1/customers/" + customerId)
                .exchangeToMono(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(Void.class).thenReturn(true);
                    } else if (response.statusCode().value() == 404) {
                        return response.bodyToMono(Void.class).thenReturn(false);
                    } else {
                        return response.createError().cast(Boolean.class);
                    }
                })
                .block();
    }

    public boolean customerExistsFallback(Long customerId, Throwable throwable) {
        log.warn("Customer service unavailable for customerId={}, falling back", customerId, throwable);
        return false;
    }
}