package com.sanjay.studentmanagement.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * A consistent shape for every error the API returns.
 * "errors" is only filled in for field-level validation failures.
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String message,
        Map<String, String> errors) {

    public ErrorResponse(int status, String message) {
        this(LocalDateTime.now(), status, message, null);
    }

    public ErrorResponse(int status, String message, Map<String, String> errors) {
        this(LocalDateTime.now(), status, message, errors);
    }
}
