package com.canaryshop.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Reads the user id from the verified token. The client can never choose whose
 * cart it touches.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static UUID id(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
