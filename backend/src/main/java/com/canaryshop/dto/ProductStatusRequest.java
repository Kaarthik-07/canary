package com.canaryshop.dto;

import jakarta.validation.constraints.NotNull;

public record ProductStatusRequest(@NotNull(message = "active is required") Boolean active) {
}
