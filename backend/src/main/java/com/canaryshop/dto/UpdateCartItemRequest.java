package com.canaryshop.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateCartItemRequest(
        @NotNull(message = "quantity is required") @Min(value = 1, message = "quantity must be at least 1 (use DELETE to remove an item)") @Max(value = 100, message = "quantity must be at most 100") Integer quantity) {
}
