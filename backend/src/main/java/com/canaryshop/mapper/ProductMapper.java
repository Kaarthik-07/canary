package com.canaryshop.mapper;

import com.canaryshop.dto.ProductRequest;
import com.canaryshop.dto.ProductResponse;
import com.canaryshop.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product p) {
        boolean available = p.isActive() && p.getStockQuantity() > 0;
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(),
                p.getImageUrl(), p.getStockQuantity(), p.getCategory(), p.isActive(), available);
    }

    public Product toEntity(ProductRequest r) {
        return new Product(r.name().trim(), r.description(), r.price(),
                r.imageUrl(), r.stockQuantity(), r.category());
    }

    public void updateEntity(Product p, ProductRequest r) {
        p.setName(r.name().trim());
        p.setDescription(r.description());
        p.setPrice(r.price());
        p.setImageUrl(r.imageUrl());
        p.setStockQuantity(r.stockQuantity());
        p.setCategory(r.category());
    }
}
