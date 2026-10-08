package com.sanjay.studentmanagement.dto;

import jakarta.validation.constraints.NotBlank;

// A Java record: a short way to write a class that only carries data
public record LoginRequest(
        @NotBlank(message = "Username is required") String username,
        @NotBlank(message = "Password is required") String password) {
}
