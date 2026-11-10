package com.canaryshop.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Our own stable page format, instead of serialising Spring's Page object
 * directly.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
