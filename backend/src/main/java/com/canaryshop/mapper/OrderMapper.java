package com.canaryshop.mapper;

import com.canaryshop.dto.CartResponse;
import com.canaryshop.dto.OrderItemResponse;
import com.canaryshop.dto.OrderResponse;
import com.canaryshop.dto.OrderSummaryResponse;
import com.canaryshop.entity.Order;
import com.canaryshop.entity.OrderItem;
import com.canaryshop.entity.Product;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Component
public class OrderMapper {

    public OrderItemResponse toItemResponse(OrderItem item) {
        Product p = item.getProduct();
        return new OrderItemResponse(item.getId(), p.getId(), p.getName(), p.getImageUrl(),
                item.getQuantity(), item.getUnitPrice(), item.getSubtotal());
    }

    /**
     * A null cart means the user has not added anything yet, so we return an empty
     * cart.
     */
    public CartResponse toCartResponse(Order cart) {
        if (cart == null) {
            return new CartResponse(null, List.of(), 0, BigDecimal.ZERO);
        }
        int totalQuantity = cart.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
        return new CartResponse(cart.getId(), sortedItems(cart), totalQuantity, cart.getTotalAmount());
    }

    public OrderResponse toOrderResponse(Order order) {
        return new OrderResponse(order.getId(), order.getStatus(), order.getTotalAmount(),
                order.getCreatedAt(), order.getUpdatedAt(), sortedItems(order));
    }

    public OrderSummaryResponse toSummary(Order order) {
        return new OrderSummaryResponse(order.getId(), order.getStatus(),
                order.getTotalAmount(), order.getUpdatedAt());
    }

    /** Stable display order, so lines don't jump around between responses. */
    private List<OrderItemResponse> sortedItems(Order order) {
        return order.getItems().stream()
                .map(this::toItemResponse)
                .sorted(Comparator.comparing(OrderItemResponse::productName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}
