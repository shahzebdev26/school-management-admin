import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { AdminDirectory } from '../admin-directory'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/admins',
}))

function admin(overrides: Record<string, unknown> = {}) {
  return {
    id: 'admin-1',
    name: 'Ayesha Khan',
    email: 'ayesha@example.com',
    status: 'active',
    createdAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  }
}

function mockSession(id: string) {
  server.use(
    http.get('http://localhost:3000/api/v1/auth/me', () =>
      HttpResponse.json({ data: { id, name: 'Me', email: 'me@example.com' } }),
    ),
  )
}

function mockAdmins(rows: Record<string, unknown>[]) {
  server.use(
    http.get('http://localhost:3000/api/v1/platform-admins', () =>
      HttpResponse.json({ data: rows, meta: { page: 1, limit: 25, total: rows.length } }),
    ),
  )
}

function renderDirectory() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<AdminDirectory />, { wrapper: Wrapper })
}

describe('AdminDirectory', () => {
  it('lists each platform admin', async () => {
    mockSession('me-1')
    mockAdmins([admin(), admin({ id: 'admin-2', name: 'Bilal Ahmed' })])
    renderDirectory()

    expect(await screen.findByText('Ayesha Khan')).toBeVisible()
    expect(screen.getByText('Bilal Ahmed')).toBeVisible()
  })

  it('offers deactivation for another active admin', async () => {
    mockSession('me-1')
    mockAdmins([admin()])
    renderDirectory()

    expect(await screen.findByRole('button', { name: 'Deactivate' })).toBeVisible()
  })

  /*
   * The guard that matters: an admin cannot lock themselves out, which would
   * leave the platform with one fewer way in and no way to undo it.
   */
  it('never offers to deactivate the signed-in admin', async () => {
    mockSession('admin-1')
    mockAdmins([admin({ id: 'admin-1' })])
    renderDirectory()

    expect(await screen.findByText('Ayesha Khan')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument()
  })

  it('offers activation, not deactivation, for an inactive admin', async () => {
    mockSession('me-1')
    mockAdmins([admin({ status: 'inactive' })])
    renderDirectory()

    expect(await screen.findByText('Ayesha Khan')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Activate' })).toBeVisible()
  })

  it('activates only after the confirmation is accepted', async () => {
    let activated: string | null = null
    mockSession('me-1')
    mockAdmins([admin({ status: 'inactive' })])
    server.use(
      http.post('http://localhost:3000/api/v1/platform-admins/admin-1/activate', () => {
        activated = 'admin-1'
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderDirectory()

    await user.click(await screen.findByRole('button', { name: 'Activate' }))
    expect(activated).toBeNull()

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Activate' }))

    await vi.waitFor(() => {
      expect(activated).toBe('admin-1')
    })
  })

  it('warns that the admin loses sign-in before deactivating', async () => {
    mockSession('me-1')
    mockAdmins([admin()])
    const user = userEvent.setup()
    renderDirectory()

    await user.click(await screen.findByRole('button', { name: 'Deactivate' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/no longer be able to sign in/)).toBeVisible()
  })

  it('deactivates only after the confirmation is accepted', async () => {
    let deactivated: string | null = null
    mockSession('me-1')
    mockAdmins([admin()])
    server.use(
      http.post('http://localhost:3000/api/v1/platform-admins/admin-1/deactivate', () => {
        deactivated = 'admin-1'
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderDirectory()

    await user.click(await screen.findByRole('button', { name: 'Deactivate' }))
    expect(deactivated).toBeNull()

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }))

    await vi.waitFor(() => {
      expect(deactivated).toBe('admin-1')
    })
  })

  it('tells the platform owner when no admins are listed', async () => {
    mockSession('me-1')
    mockAdmins([])
    renderDirectory()

    expect(await screen.findByText(/No/i)).toBeVisible()
  })
})
