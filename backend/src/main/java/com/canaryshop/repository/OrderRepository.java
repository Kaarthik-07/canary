package com.canaryshop.repository;

import com.canaryshop.entity.Order;
import com.canaryshop.enums.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    /** Plain read of the user's cart (no lock). */
    Optional<Order> findByUserIdAndStatus(UUID userId, OrderStatus status);

    /**
     * Reads the cart with SELECT ... FOR UPDATE. Anything that changes the cart or
     * checks it out
     * goes through this, so those operations run one at a time per user.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.user.id = :userId and o.status = :status")
    Optional<Order> findByUserIdAndStatusForUpdate(@Param("userId") UUID userId,
            @Param("status") OrderStatus status);

    Page<Order> findByUserIdAndStatusNot(UUID userId, OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
}
