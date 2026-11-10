import { request, queryString } from './client'
import type {
  AuthResponse, CartResponse, LoginRequest, RegisterRequest, UserResponse,
  ProductResponse, PageResponse, OrderResponse, OrderSummaryResponse,
  AddCartItemRequest, UpdateCartItemRequest,
} from '../types/api'

export const authApi = {
  register: (body: RegisterRequest) => request<UserResponse>('/api/auth/register', { method: 'POST', body, authRequest: true }),
  login: (body: LoginRequest) => request<AuthResponse>('/api/auth/login', { method: 'POST', body, authRequest: true }),
  me: (token: string) => request<UserResponse>('/api/auth/me', { token }),
}
export const productsApi = {
  list: (params: { page?: number; size?: number; sort?: string; category?: string; q?: string }) =>
    request<PageResponse<ProductResponse>>(`/api/products${queryString(params)}`),
  get: (id: string) => request<ProductResponse>(`/api/products/${encodeURIComponent(id)}`),
}
export const cartApi = {
  get: (token: string) => request<CartResponse>('/api/cart', { token }),
  add: (token: string, body: AddCartItemRequest) => request<CartResponse>('/api/cart/items', { method: 'POST', token, body }),
  update: (token: string, itemId: string, body: UpdateCartItemRequest) =>
    request<CartResponse>(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', token, body }),
  remove: (token: string, itemId: string) =>
    request<CartResponse>(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE', token }),
}
export const checkoutApi = {
  place: (token: string) => request<OrderResponse>('/api/checkout', { method: 'POST', token }),
}
export const ordersApi = {
  list: (token: string, page = 0, size = 10) =>
    request<PageResponse<OrderSummaryResponse>>(`/api/orders${queryString({ page, size })}`, { token }),
  get: (token: string, id: string) => request<OrderResponse>(`/api/orders/${encodeURIComponent(id)}`, { token }),
}
export const healthApi = {
  check: () => request<{ status: string }>('/actuator/health'),
}
