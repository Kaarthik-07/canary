package com.canaryshop.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** cartId is null when the user has no cart yet. */
public record CartResponse(UUID cartId, List<OrderItemResponse> items, int totalQuantity, BigDecimal totalAmount) {
}
