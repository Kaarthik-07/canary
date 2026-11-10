package com.canaryshop.dto;

import java.math.BigDecimal;
import java.util.UUID;

/** One line in a cart or an order. */
public record OrderItemResponse(
        UUID itemId,
        UUID productId,
        String productName,
        String imageUrl,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal) {
}
