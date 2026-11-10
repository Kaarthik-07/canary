package com.canaryshop.exception;

import org.springframework.http.HttpStatus;

/** Base class for all errors we raise on purpose. Carries the HTTP status to return. */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
