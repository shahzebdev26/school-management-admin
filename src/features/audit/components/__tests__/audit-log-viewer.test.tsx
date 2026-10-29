import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { AuditLogViewer } from '../audit-log-viewer'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/audit',
}))

interface Entry {
  id: string
  action: string
  entityType: string
  entityId: string | null
  actorUserId: string | null
  actingAsUserId: string | null
  schoolId: string | null
  createdAt: string
}

function entry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'log-1',
    action: 'create',
    entityType: 'school',
    entityId: 'sch-1',
    actorUserId: 'adm-1',
    actingAsUserId: null,
    schoolId: 'sch-1',
    createdAt: '2026-03-04T09:15:00.000Z',
    ...overrides,
  }
}

/** Every request the viewer makes, so filters can be asserted on the wire. */
function mockLogs(rows: Entry[], total = rows.length) {
  const seen: URL[] = []

  server.use(
    http.get('http://localhost:3000/api/v1/audit-logs', ({ request }) => {
      seen.push(new URL(request.url))
      return HttpResponse.json({ data: rows, meta: { page: 1, limit: 30, total } })
    }),
  )

  return seen
}

function renderViewer() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<AuditLogViewer />, { wrapper: Wrapper })
}

describe('AuditLogViewer', () => {
  it('lists log entries', async () => {
    mockLogs([entry({ action: 'delete', entityType: 'admin' })])
    renderViewer()

    expect(await screen.findByText('delete')).toBeVisible()
    expect(screen.getByText('admin')).toBeVisible()
  })

  it('shows who an action was taken on behalf of, so view-as is traceable', async () => {
    mockLogs([entry({ actorUserId: 'adm-9', actingAsUserId: 'user-42' })])
    renderViewer()

    expect(await screen.findByText('adm-9')).toBeVisible()
    expect(screen.getByText('user-42')).toBeVisible()
  })

  it('sends the search term to the API', async () => {
    const seen = mockLogs([entry()])
    const user = userEvent.setup()
    renderViewer()

    await screen.findByText('create')
    await user.type(screen.getByRole('searchbox'), 'suspend')

    await waitFor(() => {
      expect(seen.some((url) => url.searchParams.get('search') === 'suspend')).toBe(true)
    })
  })

  it('does not filter by action or entity until one is chosen', async () => {
    const seen = mockLogs([entry()])
    renderViewer()

    await screen.findByText('create')
    expect(seen[0]?.searchParams.has('action')).toBe(false)
    expect(seen[0]?.searchParams.has('entityType')).toBe(false)
  })

  it('asks for the next page when Next is used', async () => {
    const seen = mockLogs([entry()], 90)
    const user = userEvent.setup()
    renderViewer()

    await screen.findByText('create')
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(seen.some((url) => url.searchParams.get('page') === '2')).toBe(true)
    })
  })

  it('cannot page back from the first page', async () => {
    mockLogs([entry()], 90)
    renderViewer()

    await screen.findByText('create')
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('says so when nothing has been logged yet', async () => {
    mockLogs([], 0)
    renderViewer()

    expect(await screen.findByText(/no audit logs found/i)).toBeVisible()
  })

  it('offers a retry when the log cannot be read', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/audit-logs', () =>
        HttpResponse.json({ error: { code: 'SERVER_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    )
    renderViewer()

    expect(await screen.findByRole('button', { name: /try again/i })).toBeVisible()
  })
})
