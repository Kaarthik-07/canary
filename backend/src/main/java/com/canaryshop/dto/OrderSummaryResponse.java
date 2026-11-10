package com.canaryshop.dto;

import com.canaryshop.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderSummaryResponse(UUID id, OrderStatus status, BigDecimal totalAmount, Instant updatedAt) {
}
