import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { LoginForm } from '../login-form'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => '/login',
}))

function renderForm() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<LoginForm />, { wrapper: Wrapper })
}

describe('platform admin login', () => {
  it('refuses an empty form', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: /Sign in/ }))

    expect(await screen.findByText(/required/i)).toBeVisible()
  })

  it('sends the admin to the dashboard on success', async () => {
    push.mockClear()
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', () =>
        HttpResponse.json({ data: { name: 'Admin User' } }),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/Email/), 'admin@example.com')
    await user.type(screen.getByLabelText(/Password/), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: /Sign in/ }))

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows a rejection without navigating', async () => {
    push.mockClear()
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', () =>
        HttpResponse.json(
          { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
          { status: 401 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/Email/), 'admin@example.com')
    await user.type(screen.getByLabelText(/Password/), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /Sign in/ }))

    expect(await screen.findByText(/Invalid credentials/)).toBeVisible()
    expect(push).not.toHaveBeenCalled()
  })

  it('disables submit while signing in', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10_000))
        return HttpResponse.json({ data: {} })
      }),
    )
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/Email/), 'admin@example.com')
    await user.type(screen.getByLabelText(/Password/), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: /Sign in/ }))

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: /Signing in/ })).toBeDisabled()
    })
  })
})
