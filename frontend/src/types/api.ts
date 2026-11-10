export type Role = 'USER' | 'ADMIN'
export type Cohort = 'CANARY' | 'CONTROL'
export type OrderStatus = 'CART' | 'PLACED' | 'CANCELLED'

export interface UserResponse {
  id: string
  name: string
  email: string
  role: Role
  cohort: Cohort
  featureEnabled: boolean
}
export interface AuthResponse {
  token: string
  tokenType: 'Bearer'
  expiresInSeconds: number
  user: UserResponse
}
export interface RegisterRequest { name: string; email: string; password: string }
export interface LoginRequest { email: string; password: string }
export interface ProductResponse {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stockQuantity: number
  category: string | null
  active: boolean
  available: boolean
}
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
export interface AddCartItemRequest { productId: string; quantity: number }
export interface UpdateCartItemRequest { quantity: number }
export interface OrderItemResponse {
  itemId: string
  productId: string
  productName: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}
export interface CartResponse {
  cartId: string | null
  items: OrderItemResponse[]
  totalQuantity: number
  totalAmount: number
}
export interface OrderResponse {
  id: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: OrderItemResponse[]
}
export interface OrderSummaryResponse {
  id: string
  status: OrderStatus
  totalAmount: number
  updatedAt: string
}
export interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: Record<string, string>
}
export interface ApiErrorShape {
  status: number
  message: string
  fieldErrors?: Record<string, string>
}
export interface Session {
  token: string
  user: UserResponse
  expiresAt: number
}
