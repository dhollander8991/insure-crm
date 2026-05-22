package com.insurecrm.auth_service;

public record AuthResponse(String token, String email, String role) {}