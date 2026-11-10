package com.canaryshop.service;

import com.canaryshop.dto.OrderResponse;
import com.canaryshop.dto.OrderSummaryResponse;
import com.canaryshop.dto.PageResponse;
import com.canaryshop.enums.OrderStatus;
import com.canaryshop.exception.InvalidRequestException;
import com.canaryshop.exception.ResourceNotFoundException;
import com.canaryshop.mapper.OrderMapper;
import com.canaryshop.repository.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private static final int MAX_PAGE_SIZE = 50;

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public OrderService(OrderRepository orderRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }

    /** Order history: everything except the cart, newest first. */
    public PageResponse<OrderSummaryResponse> list(UUID userId, int page, int size) {
        if (page < 0) {
            throw new InvalidRequestException("page must be 0 or greater");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new InvalidRequestException("size must be between 1 and " + MAX_PAGE_SIZE);
        }
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by(Sort.Direction.ASC, "id"));
        return PageResponse.from(
                orderRepository.findByUserIdAndStatusNot(userId, OrderStatus.CART, PageRequest.of(page, size, sort))
                        .map(orderMapper::toSummary));
    }

    /** Someone else's order, or a cart, looks exactly like a missing order. */
    public OrderResponse get(UUID userId, UUID orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .filter(o -> o.getStatus() != OrderStatus.CART)
                .map(orderMapper::toOrderResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
}
