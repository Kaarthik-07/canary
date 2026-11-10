package com.canaryshop.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * available = active AND in stock. The frontend uses it to show ADD TO CART or
 * OUT OF STOCK.
 */
public record ProductResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        int stockQuantity,
        String category,
        boolean active,
        boolean available) {
}
