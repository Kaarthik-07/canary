package com.canaryshop.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Body for creating and for fully updating a product. */
public record ProductRequest(
        @NotBlank(message = "name is required") @Size(max = 200, message = "name must be at most 200 characters") String name,

        @Size(max = 5000, message = "description must be at most 5000 characters") String description,

        @NotNull(message = "price is required") @DecimalMin(value = "0.00", message = "price cannot be negative") @Digits(integer = 10, fraction = 2, message = "price allows up to 10 digits and 2 decimals") BigDecimal price,

        @Size(max = 500, message = "imageUrl must be at most 500 characters") String imageUrl,

        @NotNull(message = "stockQuantity is required") @Min(value = 0, message = "stockQuantity cannot be negative") Integer stockQuantity,

        @Size(max = 100, message = "category must be at most 100 characters") String category) {
}
