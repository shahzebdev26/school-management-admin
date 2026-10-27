import createClient from 'openapi-fetch'
import type { paths } from './generated/schema'
import { ApiError, type ApiErrorBody } from './errors'

const API_BASE_URL = typeof window === 'undefined' ? '/api' : `${window.location.origin}/api`

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
})

const SESSION_EXEMPT_PATHS = ['/v1/auth/login', '/v1/auth/refresh', '/v1/auth/logout']
const UNAUTHORIZED_STATUS = 401

let onSessionExpired: (() => void) | undefined

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

apiClient.use({
  onResponse({ request, response }) {
    const isExempt = SESSION_EXEMPT_PATHS.some((path) => request.url.includes(path))

    if (response.status === UNAUTHORIZED_STATUS && !isExempt) {
      onSessionExpired?.()
    }

    return response
  },
})

type ApiResult<TData> =
  | { data: TData; error?: never; response: Response }
  | { data?: never; error: { error: ApiErrorBody }; response: Response }

export async function unwrap<TData>(promise: Promise<ApiResult<TData>>): Promise<TData> {
  const result = await promise

  if (result.error !== undefined) {
    throw new ApiError(result.response.status, result.error.error)
  }

  return result.data
}
