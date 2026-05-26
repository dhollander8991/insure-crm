package com.insurecrm.policy_service;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CustomerServiceClientTest {

    private MockWebServer mockWebServer;
    private CustomerServiceClient customerServiceClient;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        String baseUrl = mockWebServer.url("/").toString();
        customerServiceClient = new CustomerServiceClient(baseUrl.replaceAll("/$", ""));
    }

    @AfterEach
    void tearDown() {
        try {
            mockWebServer.shutdown();
        } catch (Exception ignored) {
        }
    }

    @Test
    void customerExists_200Response_returnsTrue() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"id\":1,\"firstName\":\"John\"}")
                .addHeader("Content-Type", "application/json"));

        assertThat(customerServiceClient.customerExists(1L)).isTrue();
    }

    @Test
    void customerExists_404Response_returnsFalse() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(404));

        assertThat(customerServiceClient.customerExists(999L)).isFalse();
    }

    @Test
    void customerExists_serviceDown_throwsException() throws IOException {
        mockWebServer.shutdown();

        assertThatThrownBy(() -> customerServiceClient.customerExists(1L))
                .isInstanceOf(Exception.class);
    }
}
