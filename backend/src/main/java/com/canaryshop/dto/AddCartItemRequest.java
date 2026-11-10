package com.canaryshop.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** Only ids and quantities come from the client. Prices are never accepted. */
public record AddCartItemRequest(
        @NotNull(message = "productId is required") UUID productId,
        @NotNull(message = "quantity is required") @Min(value = 1, message = "quantity must be at least 1") @Max(value = 100, message = "quantity must be at most 100") Integer quantity) {
}
