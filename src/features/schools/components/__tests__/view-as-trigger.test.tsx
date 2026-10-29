import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { ViewAsTrigger } from '../view-as-trigger'

/*
 * The handoff navigates the browser. Only `href` is redefined — replacing the
 * whole location object breaks the API client, which reads
 * window.location.origin at module load to build its base URL.
 */
function captureNavigation(): { get: () => string } {
  const assigned = { value: '' }
  const { origin, pathname, search, hash, host, hostname, protocol } = window.location

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      origin,
      pathname,
      search,
      hash,
      host,
      hostname,
      protocol,
      get href() {
        return assigned.value
      },
      set href(next: string) {
        assigned.value = next
      },
    },
  })

  return { get: () => assigned.value }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderTrigger() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<ViewAsTrigger schoolId="school-1" />, { wrapper: Wrapper })
}

describe('ViewAsTrigger', () => {
  it('hands off to the school subdomain with the issued ticket', async () => {
    const navigation = captureNavigation()
    server.use(
      http.post('http://localhost:3000/api/v1/view-as-tickets', () =>
        HttpResponse.json({ data: { ticket: 'tkt-abc123', schoolSlug: 'greenwood-academy' } }),
      ),
    )
    const user = userEvent.setup()
    renderTrigger()

    await user.click(screen.getByRole('button', { name: /View as this school/ }))

    await vi.waitFor(() => {
      expect(navigation.get()).toBe(
        'https://greenwood-academy.techsparks.co/view-as?ticket=tkt-abc123',
      )
    })
  })

  it('sends the school id the ticket is for', async () => {
    captureNavigation()
    const bodies: unknown[] = []
    server.use(
      http.post('http://localhost:3000/api/v1/view-as-tickets', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json({ data: { ticket: 't', schoolSlug: 's' } })
      }),
    )
    const user = userEvent.setup()
    renderTrigger()

    await user.click(screen.getByRole('button', { name: /View as this school/ }))

    await vi.waitFor(() => {
      expect(bodies).toEqual([{ schoolId: 'school-1' }])
    })
  })

  it('shows progress while the ticket is being issued', async () => {
    captureNavigation()
    server.use(
      http.post('http://localhost:3000/api/v1/view-as-tickets', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10_000))
        return HttpResponse.json({ data: { ticket: 't', schoolSlug: 's' } })
      }),
    )
    const user = userEvent.setup()
    renderTrigger()

    await user.click(screen.getByRole('button', { name: /View as this school/ }))

    expect(await screen.findByRole('button', { name: /Preparing/ })).toBeDisabled()
  })

  it('does not navigate when the ticket is refused', async () => {
    const navigation = captureNavigation()
    server.use(
      http.post('http://localhost:3000/api/v1/view-as-tickets', () =>
        HttpResponse.json(
          { error: { code: 'NOT_PLATFORM_ADMIN', message: 'Not permitted' } },
          { status: 403 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderTrigger()

    await user.click(screen.getByRole('button', { name: /View as this school/ }))

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: /View as this school/ })).toBeEnabled()
    })
    expect(navigation.get()).toBe('')
  })
})
