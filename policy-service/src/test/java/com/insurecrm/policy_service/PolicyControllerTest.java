package com.insurecrm.policy_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PolicyController.class)
@Import(SecurityConfig.class)
class PolicyControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private PolicyService policyService;

    private static final String VALID_BODY = """
            {
                "customerId":1,"customerName":"John Doe","type":"CAR",
                "startDate":"2024-01-01","endDate":"2025-01-01",
                "premium":1200.00,"agentEmail":"agent@test.com","status":"ACTIVE"
            }""";

    private PolicyResponse response() {
        return new PolicyResponse(1L, "POL-ABCDE", 1L, "John Doe",
                "CAR", "ACTIVE", LocalDate.of(2024, 1, 1),
                LocalDate.of(2025, 1, 1), new BigDecimal("1200.00"), "agent@test.com");
    }

    @Test
    void create_validRequest_returns201() throws Exception {
        when(policyService.create(any())).thenReturn(response());

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.policyNumber").value("POL-ABCDE"))
                .andExpect(jsonPath("$.type").value("CAR"));
    }

    @Test
    void create_missingCustomerId_returns400() throws Exception {
        String body = """
                {"customerName":"John","type":"CAR","startDate":"2024-01-01",
                 "endDate":"2025-01-01","premium":1200.00,"agentEmail":"a@t.com"}""";

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.customerId").exists());
    }

    @Test
    void create_missingCustomerName_returns400() throws Exception {
        String body = """
                {"customerId":1,"type":"CAR","startDate":"2024-01-01",
                 "endDate":"2025-01-01","premium":1200.00,"agentEmail":"a@t.com"}""";

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.customerName").exists());
    }

    @Test
    void create_zeroPremium_returns400() throws Exception {
        String body = """
                {"customerId":1,"customerName":"John","type":"CAR",
                 "startDate":"2024-01-01","endDate":"2025-01-01",
                 "premium":0.00,"agentEmail":"a@t.com"}""";

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.premium").exists());
    }

    @Test
    void create_customerNotFound_returns400() throws Exception {
        when(policyService.create(any()))
                .thenThrow(new RuntimeException("Customer not found in customer-service"));

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Customer not found in customer-service"));
    }

    @Test
    void getAll_returns200WithList() throws Exception {
        when(policyService.getAll()).thenReturn(List.of(response()));

        mockMvc.perform(get("/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getAll_empty_returns200WithEmptyList() throws Exception {
        when(policyService.getAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getById_found_returns200() throws Exception {
        when(policyService.getById(1L)).thenReturn(response());

        mockMvc.perform(get("/policies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.policyNumber").value("POL-ABCDE"));
    }

    @Test
    void getById_notFound_returns400() throws Exception {
        when(policyService.getById(99L)).thenThrow(new RuntimeException("Policy not found"));

        mockMvc.perform(get("/policies/99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Policy not found"));
    }

    @Test
    void update_validRequest_returns200() throws Exception {
        when(policyService.update(eq(1L), any())).thenReturn(response());

        mockMvc.perform(put("/policies/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void delete_existingId_returns204() throws Exception {
        doNothing().when(policyService).delete(1L);

        mockMvc.perform(delete("/policies/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound_returns400() throws Exception {
        doThrow(new RuntimeException("Policy not found")).when(policyService).delete(99L);

        mockMvc.perform(delete("/policies/99"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getByCustomer_returns200WithList() throws Exception {
        when(policyService.getByCustomer(1L)).thenReturn(List.of(response()));

        mockMvc.perform(get("/policies/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getByAgent_returns200WithList() throws Exception {
        when(policyService.getByAgent("agent@test.com")).thenReturn(List.of(response()));

        mockMvc.perform(get("/policies/agent/agent@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getByStatus_active_returns200WithList() throws Exception {
        when(policyService.getByStatus(Policy.PolicyStatus.ACTIVE)).thenReturn(List.of(response()));

        mockMvc.perform(get("/policies/status/ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
