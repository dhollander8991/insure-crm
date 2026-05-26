package com.insurecrm.customer_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.springframework.security.test.context.support.WithMockUser;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerController.class)
@Import(SecurityConfig.class)
@WithMockUser
class CustomerControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private CustomerService customerService;

    private static final String VALID_BODY = """
            {
                "firstName":"John","lastName":"Doe",
                "email":"john@test.com","phone":"0501234567",
                "israeliId":"123456789","dateOfBirth":"1990-01-01",
                "agentEmail":"agent@test.com","status":"ACTIVE"
            }""";

    private CustomerResponse response() {
        return new CustomerResponse(1L, "John", "Doe", "john@test.com",
                "0501234567", "123456789", LocalDate.of(1990, 1, 1),
                "agent@test.com", "ACTIVE");
    }

    @Test
    void create_validRequest_returns201() throws Exception {
        when(customerService.create(any())).thenReturn(response());

        mockMvc.perform(post("/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("john@test.com"));
    }

    @Test
    void create_missingFirstName_returns400WithFieldError() throws Exception {
        mockMvc.perform(post("/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lastName\":\"Doe\",\"email\":\"j@t.com\",\"agentEmail\":\"a@t.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.firstName").exists());
    }

    @Test
    void create_invalidEmailFormat_returns400() throws Exception {
        String body = """
                {"firstName":"John","lastName":"Doe","email":"notanemail","agentEmail":"a@t.com"}""";

        mockMvc.perform(post("/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void create_invalidPhonePattern_returns400() throws Exception {
        String body = """
                {"firstName":"J","lastName":"D","email":"j@t.com",
                 "phone":"12345","agentEmail":"a@t.com"}""";

        mockMvc.perform(post("/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.phone").exists());
    }

    @Test
    void create_invalidIsraeliId_returns400() throws Exception {
        String body = """
                {"firstName":"J","lastName":"D","email":"j@t.com",
                 "israeliId":"12345","agentEmail":"a@t.com"}""";

        mockMvc.perform(post("/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.israeliId").exists());
    }

    @Test
    void create_duplicateEmail_returns400WithErrorMessage() throws Exception {
        when(customerService.create(any())).thenThrow(new RuntimeException("Email already exists"));

        mockMvc.perform(post("/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already exists"));
    }

    @Test
    void getAll_returns200WithList() throws Exception {
        when(customerService.getAll(any())).thenReturn(new PageImpl<>(List.of(response())));

        mockMvc.perform(get("/v1/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void getAll_empty_returns200WithEmptyList() throws Exception {
        when(customerService.getAll(any())).thenReturn(Page.empty());

        mockMvc.perform(get("/v1/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    void getById_found_returns200() throws Exception {
        when(customerService.getById(1L)).thenReturn(response());

        mockMvc.perform(get("/v1/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("john@test.com"));
    }

    @Test
    void getById_notFound_returns400() throws Exception {
        when(customerService.getById(99L)).thenThrow(new RuntimeException("Customer not found"));

        mockMvc.perform(get("/v1/customers/99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Customer not found"));
    }

    @Test
    void update_validRequest_returns200() throws Exception {
        when(customerService.update(eq(1L), any())).thenReturn(response());

        mockMvc.perform(put("/v1/customers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void delete_existingId_returns204() throws Exception {
        doNothing().when(customerService).delete(1L);

        mockMvc.perform(delete("/v1/customers/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound_returns400() throws Exception {
        doThrow(new RuntimeException("Customer not found")).when(customerService).delete(99L);

        mockMvc.perform(delete("/v1/customers/99"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getByAgent_returns200WithList() throws Exception {
        when(customerService.getByAgent("agent@test.com")).thenReturn(List.of(response()));

        mockMvc.perform(get("/v1/customers/agent/agent@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
