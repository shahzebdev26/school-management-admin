import createClient from 'openapi-fetch'
import type { paths } from './generated/schema'
import { ApiError, type ApiErrorBody } from './errors'

const API_BASE_URL = typeof window === 'undefined' ? '/api' : `${window.location.origin}/api`

// no-store: a browser-cached 304 on a retried request is what crashed the
// proxy (TypeError: Response constructor: Invalid response status code 304).
// Freshness is TanStack Query's job, not the browser HTTP cache's.
export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  cache: 'no-store',
})

const SESSION_EXEMPT_PATHS = ['/v1/auth/login', '/v1/auth/refresh', '/v1/auth/logout']
const UNAUTHORIZED_STATUS = 401

let onSessionExpired: (() => void) | undefined

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

const retryableRequests = new Map<string, Request>()
let refreshing: Promise<boolean> | null = null

// The refresh token rotates on every use (docs/security.md) — presenting it
// twice at once revokes the whole chain. Concurrent 401s must share one
// in-flight refresh, never fire one each.
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })

  return refreshing
}

async function retryAfterRefresh(retryRequest: Request): Promise<Response | undefined> {
  if (!(await refreshSession())) {
    return undefined
  }

  return fetch(retryRequest, { cache: 'no-store' })
}

apiClient.use({
  onRequest({ request, id }) {
    retryableRequests.set(id, request.clone())
  },
  onError({ id }) {
    retryableRequests.delete(id)
  },
  async onResponse({ request, response, id }) {
    const retryRequest = retryableRequests.get(id)
    retryableRequests.delete(id)

    const isExempt = SESSION_EXEMPT_PATHS.some((path) => request.url.includes(path))

    if (response.status !== UNAUTHORIZED_STATUS || isExempt) {
      return response
    }

    const retried = retryRequest ? await retryAfterRefresh(retryRequest) : undefined

    if (!retried) {
      onSessionExpired?.()
      return response
    }

    // The original response is being replaced, not returned — an unread body
    // holds its connection open instead of releasing it back to the pool.
    await response.body?.cancel()

    if (retried.status === UNAUTHORIZED_STATUS) {
      onSessionExpired?.()
    }

    return retried
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
