package com.canaryshop.repository;

import com.canaryshop.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    Optional<OrderItem> findByOrderIdAndProductId(UUID orderId, UUID productId);

    Optional<OrderItem> findByIdAndOrderId(UUID id, UUID orderId);
}
