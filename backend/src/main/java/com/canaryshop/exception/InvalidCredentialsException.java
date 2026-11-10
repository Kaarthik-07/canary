package com.canaryshop.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends ApiException {
    public InvalidCredentialsException() {
        // Same message for "no such user" and "wrong password" so attackers can't probe
        // emails.
        super(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
}
