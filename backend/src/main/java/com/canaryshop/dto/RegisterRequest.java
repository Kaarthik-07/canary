package com.canaryshop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "name is required") @Size(max = 100, message = "name must be at most 100 characters") String name,

        @NotBlank(message = "email is required") @Email(message = "email must be a valid address") @Size(max = 255, message = "email must be at most 255 characters") String email,

        // BCrypt only uses the first 72 bytes, so we cap the length
        @NotBlank(message = "password is required") @Size(min = 8, max = 72, message = "password must be 8 to 72 characters") String password) {
}
