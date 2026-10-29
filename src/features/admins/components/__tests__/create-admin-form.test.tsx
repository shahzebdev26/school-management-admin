import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { CreateAdminForm } from '../create-admin-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/admins/create',
}))

interface Captured {
  body: unknown
  sent: boolean
}

function mockCreate(): Captured {
  const captured: Captured = { body: null, sent: false }

  server.use(
    http.post('http://localhost:3000/api/v1/platform-admins', async ({ request }) => {
      captured.body = await request.json()
      captured.sent = true
      return HttpResponse.json(
        { data: { id: 'adm-new', name: 'Nadia Khan', email: 'nadia@platform.test' } },
        { status: 201 },
      )
    }),
  )

  return captured
}

function renderForm() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<CreateAdminForm />, { wrapper: Wrapper })
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
  await user.type(screen.getByLabelText(/^Full name/), overrides.name ?? 'Nadia Khan')
  await user.type(screen.getByLabelText(/^Email/), overrides.email ?? 'nadia@platform.test')
  await user.type(screen.getByLabelText(/^Password/), overrides.password ?? 'correct-horse-9')
}

function submit(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: /create admin/i }))
}

describe('CreateAdminForm', () => {
  it('refuses an empty form', async () => {
    const captured = mockCreate()
    const user = userEvent.setup()
    renderForm()

    await submit(user)

    expect(await screen.findByText(/name is required/i)).toBeVisible()
    expect(captured.sent).toBe(false)
  })

  it('refuses a password shorter than the platform minimum', async () => {
    const captured = mockCreate()
    const user = userEvent.setup()
    renderForm()

    await fillForm(user, { password: 'short' })
    await submit(user)

    expect(await screen.findByText(/at least 10 characters/i)).toBeVisible()
    expect(captured.sent).toBe(false)
  })

  /*
   * jsdom will not let userEvent.type put a malformed address into an
   * <input type="email">, so the email rule is exercised through the empty
   * form instead: the same resolver, the same message, and the only path a
   * test can reach it by. A real browser does accept the keystrokes and shows
   * the identical error.
   */
  it('requires a valid email address', async () => {
    const captured = mockCreate()
    const user = userEvent.setup()
    renderForm()

    await submit(user)

    expect(await screen.findByText(/valid email/i)).toBeVisible()
    expect(captured.sent).toBe(false)
  })

  it('sends the admin details', async () => {
    const captured = mockCreate()
    const user = userEvent.setup()
    renderForm()

    await fillForm(user)
    await submit(user)

    await waitFor(() => {
      expect(captured.body).toEqual({
        name: 'Nadia Khan',
        email: 'nadia@platform.test',
        password: 'correct-horse-9',
      })
    })
  })

  it('shows the password once and warns it will not be shown again', async () => {
    mockCreate()
    const user = userEvent.setup()
    renderForm()

    await fillForm(user)
    await submit(user)

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText(/will not be shown again/i)).toBeVisible()
    expect(screen.getByText('correct-horse-9')).toBeVisible()
  })

  it('copies the credentials to the clipboard', async () => {
    mockCreate()
    const user = userEvent.setup()
    renderForm()

    await fillForm(user)
    await submit(user)
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: /copy/i }))

    await waitFor(async () => {
      expect(await navigator.clipboard.readText()).toContain('correct-horse-9')
    })
  })

  it('clears the form once the admin exists, so a second is not created by accident', async () => {
    mockCreate()
    const user = userEvent.setup()
    renderForm()

    await fillForm(user)
    await submit(user)
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: /done/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(screen.getByLabelText(/^Full name/)).toHaveValue('')
    expect(screen.getByLabelText(/^Password/)).toHaveValue('')
  })

  it('reports a duplicate email on the email field', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/platform-admins', () =>
        HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input',
              fieldErrors: { email: ['That email is already an admin'] },
            },
          },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await fillForm(user)
    await submit(user)

    expect(await screen.findByText(/already an admin/i)).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not claim success when the request fails', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/platform-admins', () => HttpResponse.error()),
    )
    const user = userEvent.setup()
    renderForm()

    await fillForm(user)
    await submit(user)

    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
