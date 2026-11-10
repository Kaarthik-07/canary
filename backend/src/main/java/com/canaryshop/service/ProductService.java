package com.canaryshop.service;

import com.canaryshop.dto.PageResponse;
import com.canaryshop.dto.ProductRequest;
import com.canaryshop.dto.ProductResponse;
import com.canaryshop.entity.Product;
import com.canaryshop.exception.InvalidRequestException;
import com.canaryshop.exception.ResourceNotFoundException;
import com.canaryshop.mapper.ProductMapper;
import com.canaryshop.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private static final int MAX_PAGE_SIZE = 50;
    /**
     * Only these fields may be used for sorting, so clients cannot sort by
     * arbitrary columns.
     */
    private static final Set<String> SORTABLE_FIELDS = Set.of("name", "price", "createdAt");

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    /**
     * Public listing: active products only (out-of-stock ones are included and
     * flagged available=false).
     */
    public PageResponse<ProductResponse> list(int page, int size, String sort, String category, String q) {
        Pageable pageable = buildPageable(page, size, sort);
        boolean hasCategory = category != null && !category.isBlank();
        boolean hasQuery = q != null && !q.isBlank();

        Page<Product> result;
        if (hasCategory && hasQuery) {
            result = productRepository.findByActiveTrueAndCategoryIgnoreCaseAndNameContainingIgnoreCase(
                    category.trim(), q.trim(), pageable);
        } else if (hasCategory) {
            result = productRepository.findByActiveTrueAndCategoryIgnoreCase(category.trim(), pageable);
        } else if (hasQuery) {
            result = productRepository.findByActiveTrueAndNameContainingIgnoreCase(q.trim(), pageable);
        } else {
            result = productRepository.findByActiveTrue(pageable);
        }
        return PageResponse.from(result.map(productMapper::toResponse));
    }

    /** Public detail: inactive products look like they do not exist. */
    public ProductResponse get(UUID id) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product saved = productRepository.save(productMapper.toEntity(request));
        return productMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = findAny(id);
        productMapper.updateEntity(product, request);
        return productMapper.toResponse(product); // dirty checking saves it at commit
    }

    @Transactional
    public ProductResponse setStatus(UUID id, boolean active) {
        Product product = findAny(id);
        product.setActive(active);
        return productMapper.toResponse(product);
    }

    /** Soft delete: the row stays so old orders keep a valid product reference. */
    @Transactional
    public void delete(UUID id) {
        findAny(id).setActive(false);
    }

    private Product findAny(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private Pageable buildPageable(int page, int size, String sort) {
        if (page < 0) {
            throw new InvalidRequestException("page must be 0 or greater");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new InvalidRequestException("size must be between 1 and " + MAX_PAGE_SIZE);
        }
        Sort order = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String field = parts[0].trim();
            if (!SORTABLE_FIELDS.contains(field)) {
                throw new InvalidRequestException("Cannot sort by '" + field + "'. Allowed: name, price, createdAt");
            }
            Sort.Direction direction = Sort.Direction.ASC;
            if (parts.length > 1) {
                try {
                    direction = Sort.Direction.fromString(parts[1].trim());
                } catch (IllegalArgumentException e) {
                    throw new InvalidRequestException("Sort direction must be asc or desc");
                }
            }
            order = Sort.by(direction, field);
        }
        // id as a tie-breaker keeps page boundaries stable when many rows share the
        // same value
        return PageRequest.of(page, size, order.and(Sort.by(Sort.Direction.ASC, "id")));
    }
}
