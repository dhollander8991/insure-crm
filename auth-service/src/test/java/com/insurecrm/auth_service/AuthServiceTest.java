package com.insurecrm.auth_service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @InjectMocks private AuthService authService;

    @Test
    void register_newEmail_returnsToken() {
        when(userRepository.findByEmail("agent@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(jwtUtil.generateToken("agent@test.com", "AGENT")).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        String token = authService.register("agent@test.com", "password123", User.Role.AGENT);

        assertThat(token).isEqualTo("jwt-token");
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void register_duplicateEmail_throwsException() {
        User existing = new User();
        existing.setEmail("agent@test.com");
        when(userRepository.findByEmail("agent@test.com")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> authService.register("agent@test.com", "password123", User.Role.AGENT))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_validCredentials_returnsAuthResponse() {
        User user = new User();
        user.setEmail("agent@test.com");
        user.setPassword("hashed");
        user.setRole(User.Role.AGENT);

        when(userRepository.findByEmail("agent@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("agent@test.com", "AGENT")).thenReturn("jwt-token");

        AuthResponse response = authService.login("agent@test.com", "password123");

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("agent@test.com");
        assertThat(response.role()).isEqualTo("AGENT");
    }

    @Test
    void login_userNotFound_throwsException() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("unknown@test.com", "password123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_wrongPassword_throwsException() {
        User user = new User();
        user.setEmail("agent@test.com");
        user.setPassword("hashed");
        user.setRole(User.Role.AGENT);

        when(userRepository.findByEmail("agent@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("agent@test.com", "wrong"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");
    }
}
