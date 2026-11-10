package com.canaryshop.service;

import com.canaryshop.dto.OrderResponse;
import com.canaryshop.entity.Order;
import com.canaryshop.entity.OrderItem;
import com.canaryshop.entity.Product;
import com.canaryshop.enums.OrderStatus;
import com.canaryshop.exception.ConflictException;
import com.canaryshop.exception.InsufficientStockException;
import com.canaryshop.exception.InvalidRequestException;
import com.canaryshop.mapper.OrderMapper;
import com.canaryshop.repository.OrderRepository;
import com.canaryshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class CheckoutService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    public CheckoutService(OrderRepository orderRepository, ProductRepository productRepository,
            OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.orderMapper = orderMapper;
    }

    /**
     * One transaction: lock the cart, re-price every line, take stock atomically,
     * mark PLACED.
     * Any failure rolls everything back, so no stock is lost and the cart stays
     * untouched.
     */
    @Transactional
    public OrderResponse checkout(UUID userId) {
        // A duplicate or concurrent submit waits on this lock, then finds no CART left.
        Order cart = orderRepository.findByUserIdAndStatusForUpdate(userId, OrderStatus.CART)
                .orElseThrow(() -> new ConflictException(
                        "No active cart to check out. It may already have been submitted"));

        if (cart.getItems().isEmpty()) {
            throw new InvalidRequestException("Your cart is empty");
        }

        // Always touch products in the same order so concurrent checkouts cannot
        // deadlock.
        List<OrderItem> items = new ArrayList<>(cart.getItems());
        items.sort(Comparator.comparing((OrderItem i) -> i.getProduct().getId()));

        Instant now = Instant.now();
        for (OrderItem item : items) {
            Product product = item.getProduct();

            // Authoritative price at purchase time, frozen into the order from here on.
            item.setUnitPrice(product.getPrice());
            item.recalculateSubtotal();

            int updated = productRepository.decrementStock(product.getId(), item.getQuantity(), now);
            if (updated == 0) {
                throw new InsufficientStockException(
                        "Insufficient product stock for '" + product.getName() + "'");
            }
        }

        cart.recalculateTotal();
        cart.setStatus(OrderStatus.PLACED);
        return orderMapper.toOrderResponse(orderRepository.saveAndFlush(cart));
    }
}
