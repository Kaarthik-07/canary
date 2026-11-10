package com.canaryshop.service;

import com.canaryshop.dto.AddCartItemRequest;
import com.canaryshop.dto.CartResponse;
import com.canaryshop.dto.UpdateCartItemRequest;
import com.canaryshop.entity.Order;
import com.canaryshop.entity.OrderItem;
import com.canaryshop.entity.Product;
import com.canaryshop.enums.OrderStatus;
import com.canaryshop.exception.InsufficientStockException;
import com.canaryshop.exception.ResourceNotFoundException;
import com.canaryshop.mapper.OrderMapper;
import com.canaryshop.repository.OrderRepository;
import com.canaryshop.repository.ProductRepository;
import com.canaryshop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CartService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public CartService(OrderRepository orderRepository, ProductRepository productRepository,
            UserRepository userRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        Order cart = orderRepository.findByUserIdAndStatus(userId, OrderStatus.CART).orElse(null);
        return orderMapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse addItem(UUID userId, AddCartItemRequest request) {
        Product product = productRepository.findByIdAndActiveTrue(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found or no longer available"));

        Order cart = lockOrCreateCart(userId);
        OrderItem existing = findItemByProduct(cart, product.getId());
        int newQuantity = (existing == null ? 0 : existing.getQuantity()) + request.quantity();
        ensureStock(product, newQuantity);

        if (existing == null) {
            cart.addItem(new OrderItem(product, newQuantity, product.getPrice()));
        } else {
            existing.setQuantity(newQuantity);
            existing.setUnitPrice(product.getPrice());
            existing.recalculateSubtotal();
        }
        cart.recalculateTotal();
        // flush so new items get their ids before we build the response
        return orderMapper.toCartResponse(orderRepository.saveAndFlush(cart));
    }

    @Transactional
    public CartResponse updateItem(UUID userId, UUID itemId, UpdateCartItemRequest request) {
        Order cart = lockExistingCart(userId);
        OrderItem item = findItemById(cart, itemId);
        Product product = item.getProduct();

        ensureStock(product, request.quantity());
        item.setQuantity(request.quantity());
        item.setUnitPrice(product.getPrice());
        item.recalculateSubtotal();
        cart.recalculateTotal();
        return orderMapper.toCartResponse(orderRepository.saveAndFlush(cart));
    }

    @Transactional
    public CartResponse removeItem(UUID userId, UUID itemId) {
        Order cart = lockExistingCart(userId);
        OrderItem item = findItemById(cart, itemId);

        cart.removeItem(item); // orphanRemoval deletes the row
        cart.recalculateTotal();
        return orderMapper.toCartResponse(orderRepository.saveAndFlush(cart));
    }

    /** Locks the user's cart row, or creates the cart if there is none yet. */
    private Order lockOrCreateCart(UUID userId) {
        return orderRepository.findByUserIdAndStatusForUpdate(userId, OrderStatus.CART)
                .orElseGet(() -> orderRepository.save(new Order(userRepository.getReferenceById(userId))));
    }

    private Order lockExistingCart(UUID userId) {
        return orderRepository.findByUserIdAndStatusForUpdate(userId, OrderStatus.CART)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
    }

    private OrderItem findItemByProduct(Order cart, UUID productId) {
        return cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Only searches this user's cart, so other users' items are simply "not found".
     */
    private OrderItem findItemById(Order cart, UUID itemId) {
        return cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
    }

    /**
     * Early, friendly check. The real enforcement is the atomic update at checkout.
     */
    private void ensureStock(Product product, int requested) {
        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product is no longer available. Remove it from your cart");
        }
        if (requested > product.getStockQuantity()) {
            throw new InsufficientStockException("Insufficient product stock: only "
                    + product.getStockQuantity() + " available for '" + product.getName() + "'");
        }
    }
}
