import type { ApiErrorShape, ErrorResponse } from '../types/api'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '')

export class ApiError extends Error implements ApiErrorShape {
  status: number
  fieldErrors?: Record<string, string>
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown; token?: string | null; authRequest?: boolean }

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, authRequest = false, headers, ...init } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'SOMETHING WENT WRONG')
  }

  if (!response.ok) {
    if (response.status === 401 && token && !authRequest) {
      window.dispatchEvent(new CustomEvent('canary:session-expired', { detail: { message: 'SESSION EXPIRED' } }))
    }
    let payload: Partial<ErrorResponse> = {}
    try { payload = await response.json() as ErrorResponse } catch { /* non-JSON proxy response */ }
    const message = response.status >= 500 || response.status === 0
      ? 'SOMETHING WENT WRONG'
      : payload.message || `Request failed (${response.status})`
    throw new ApiError(response.status, message, payload.fieldErrors)
  }

  if (response.status === 204) return undefined as T
  try {
    return await response.json() as T
  } catch {
    throw new ApiError(response.status, 'The server returned an invalid response')
  }
}

export function queryString(values: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}
