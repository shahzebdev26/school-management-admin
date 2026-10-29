import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { SchoolDirectory } from '../school-directory'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => '/dashboard/schools',
}))

interface School {
  id: string
  name: string
  slug: string
  type: string
  status: string
  contactPerson: string
  createdAt: string
}

function school(overrides: Partial<School> = {}): School {
  return {
    id: 'sch-1',
    name: 'Greenwood Academy',
    slug: 'greenwood-academy',
    type: 'school',
    status: 'active',
    contactPerson: 'Asha Rahman',
    createdAt: '2026-01-10T00:00:00.000Z',
    ...overrides,
  }
}

/** Collects every request so the filters can be asserted on the wire. */
function mockSchools(rows: School[], total = rows.length) {
  const seen: URL[] = []

  server.use(
    http.get('http://localhost:3000/api/v1/schools', ({ request }) => {
      seen.push(new URL(request.url))
      return HttpResponse.json({ data: rows, meta: { page: 1, limit: 20, total } })
    }),
  )

  return seen
}

function renderDirectory() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<SchoolDirectory />, { wrapper: Wrapper })
}

describe('SchoolDirectory', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('lists schools with their subdomain and status', async () => {
    mockSchools([school({ status: 'suspended' })])
    renderDirectory()

    expect(await screen.findByText('Greenwood Academy')).toBeVisible()
    expect(screen.getByText('greenwood-academy')).toBeVisible()
    expect(screen.getByText('suspended')).toBeVisible()
  })

  it('opens a school when its row is used', async () => {
    mockSchools([school({ id: 'sch-77' })])
    const user = userEvent.setup()
    renderDirectory()

    await user.click(await screen.findByText('Greenwood Academy'))

    expect(push).toHaveBeenCalledWith('/dashboard/schools/sch-77')
  })

  it('sends the search term to the API', async () => {
    const seen = mockSchools([school()])
    const user = userEvent.setup()
    renderDirectory()

    await screen.findByText('Greenwood Academy')
    await user.type(screen.getByRole('searchbox'), 'green')

    await waitFor(() => {
      expect(seen.some((url) => url.searchParams.get('search') === 'green')).toBe(true)
    })
  })

  it('clears the search term with the clear control', async () => {
    const seen = mockSchools([school()])
    const user = userEvent.setup()
    renderDirectory()

    await screen.findByText('Greenwood Academy')
    await user.type(screen.getByRole('searchbox'), 'green')
    await waitFor(() => {
      expect(seen.some((url) => url.searchParams.get('search') === 'green')).toBe(true)
    })

    await user.click(screen.getByRole('button', { name: /clear search/i }))

    await waitFor(() => {
      expect(seen.at(-1)?.searchParams.has('search')).toBe(false)
    })
  })

  it('does not filter by status or type until one is chosen', async () => {
    const seen = mockSchools([school()])
    renderDirectory()

    await screen.findByText('Greenwood Academy')
    expect(seen[0]?.searchParams.has('status')).toBe(false)
    expect(seen[0]?.searchParams.has('type')).toBe(false)
  })

  it('asks for the next page when Next is used', async () => {
    const seen = mockSchools([school()], 60)
    const user = userEvent.setup()
    renderDirectory()

    await screen.findByText('Greenwood Academy')
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(seen.some((url) => url.searchParams.get('page') === '2')).toBe(true)
    })
  })

  it('stops paging at the last page', async () => {
    mockSchools([school()], 20)
    renderDirectory()

    await screen.findByText('Greenwood Academy')
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('offers a way to add the first school when none exist', async () => {
    mockSchools([], 0)
    renderDirectory()

    expect(await screen.findByText(/no schools found/i)).toBeVisible()
    const links = screen.getAllByRole('link', { name: /add school/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('offers a retry when the directory cannot be loaded', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/schools', () =>
        HttpResponse.json({ error: { code: 'SERVER_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    )
    renderDirectory()

    expect(await screen.findByRole('button', { name: /try again/i })).toBeVisible()
  })
})
