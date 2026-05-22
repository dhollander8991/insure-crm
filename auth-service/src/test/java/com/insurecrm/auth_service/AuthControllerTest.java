package com.insurecrm.auth_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private AuthService authService;

    @Test
    void register_validRequest_returns201WithToken() throws Exception {
        when(authService.register(eq("agent@test.com"), eq("password123"), eq(User.Role.AGENT)))
                .thenReturn("jwt-token");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@test.com\",\"password\":\"password123\",\"role\":\"AGENT\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("agent@test.com"))
                .andExpect(jsonPath("$.role").value("AGENT"));
    }

    @Test
    void register_invalidEmailFormat_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"notanemail\",\"password\":\"password123\",\"role\":\"AGENT\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void register_blankEmail_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\",\"password\":\"password123\",\"role\":\"AGENT\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_passwordTooShort_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@test.com\",\"password\":\"abc\",\"role\":\"AGENT\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void register_blankPassword_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@test.com\",\"password\":\"\",\"role\":\"AGENT\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void register_duplicateEmail_returns400() throws Exception {
        when(authService.register(any(), any(), any()))
                .thenThrow(new RuntimeException("Email already registered"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@test.com\",\"password\":\"password123\",\"role\":\"AGENT\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already registered"));
    }

    @Test
    void login_validCredentials_returns200WithAuthResponse() throws Exception {
        when(authService.login("agent@test.com", "password123"))
                .thenReturn(new AuthResponse("jwt-token", "agent@test.com", "AGENT"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@test.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("agent@test.com"))
                .andExpect(jsonPath("$.role").value("AGENT"));
    }

    @Test
    void login_invalidCredentials_returns400() throws Exception {
        when(authService.login(any(), any()))
                .thenThrow(new RuntimeException("Invalid credentials"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@test.com\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void login_invalidEmailFormat_returns400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"notanemail\",\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_blankPassword_returns400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@test.com\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }
}
