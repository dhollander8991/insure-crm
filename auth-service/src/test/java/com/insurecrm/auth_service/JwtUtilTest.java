package com.insurecrm.auth_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "insurecrm-test-secret-key-must-be-long-enough-for-hmac";
    private static final long EXPIRATION = 86400000L;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", EXPIRATION);
    }

    @Test
    void generateToken_validInputs_returnsNonBlankToken() {
        String token = jwtUtil.generateToken("agent@test.com", "AGENT");
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateToken_differentUsers_produceDifferentTokens() {
        String t1 = jwtUtil.generateToken("user1@test.com", "AGENT");
        String t2 = jwtUtil.generateToken("user2@test.com", "MANAGER");
        assertThat(t1).isNotEqualTo(t2);
    }

    @Test
    void extractEmail_validToken_returnsCorrectEmail() {
        String token = jwtUtil.generateToken("agent@test.com", "AGENT");
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("agent@test.com");
    }

    @Test
    void extractRole_validToken_returnsCorrectRole() {
        String token = jwtUtil.generateToken("manager@test.com", "MANAGER");
        assertThat(jwtUtil.extractRole(token)).isEqualTo("MANAGER");
    }

    @Test
    void isTokenValid_validToken_returnsTrue() {
        String token = jwtUtil.generateToken("agent@test.com", "AGENT");
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_malformedToken_returnsFalse() {
        assertThat(jwtUtil.isTokenValid("not.a.valid.jwt")).isFalse();
    }

    @Test
    void isTokenValid_expiredToken_returnsFalse() {
        ReflectionTestUtils.setField(jwtUtil, "expiration", -86400000L);
        String expired = jwtUtil.generateToken("agent@test.com", "AGENT");
        assertThat(jwtUtil.isTokenValid(expired)).isFalse();
    }

    @Test
    void isTokenValid_nullToken_returnsFalse() {
        assertThat(jwtUtil.isTokenValid(null)).isFalse();
    }
}
