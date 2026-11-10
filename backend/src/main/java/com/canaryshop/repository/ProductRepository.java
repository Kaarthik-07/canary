package com.canaryshop.repository;

import com.canaryshop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByActiveTrueAndCategoryIgnoreCase(String category, Pageable pageable);

    Page<Product> findByActiveTrueAndNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Product> findByActiveTrueAndCategoryIgnoreCaseAndNameContainingIgnoreCase(
            String category, String name, Pageable pageable);

    Optional<Product> findByIdAndActiveTrue(UUID id);

    /**
     * Atomically takes stock. The check and the decrement happen in one statement
     * under a row lock,
     * so concurrent buyers cannot oversell. Returns 1 on success, 0 if inactive or
     * not enough stock.
     */
    @Modifying(flushAutomatically = true)
    @Query("update Product p set p.stockQuantity = p.stockQuantity - :qty, p.updatedAt = :now "
            + "where p.id = :id and p.active = true and p.stockQuantity >= :qty")
    int decrementStock(@Param("id") UUID id, @Param("qty") int qty, @Param("now") Instant now);
}
