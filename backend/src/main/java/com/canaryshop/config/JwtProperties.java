package com.canaryshop.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Binds the app.jwt.* section of application.yml. */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, long expiryMinutes) {
}
