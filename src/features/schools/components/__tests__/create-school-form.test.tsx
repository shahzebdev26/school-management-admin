import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { CreateSchoolForm } from '../create-school-form'

function renderForm() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<CreateSchoolForm />, { wrapper: Wrapper })
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/School name/), 'Greenwood Academy')
  await user.type(screen.getByLabelText(/Slug/), 'greenwood-academy')
  await user.type(screen.getByLabelText(/Contact person/), 'Ayesha Khan')
  await user.type(screen.getByLabelText(/Phone/), '03001234567')
  await user.type(screen.getByLabelText(/Address/), '12 Model Town, Lahore')
}

function mockCreated(overrides: Record<string, unknown> = {}) {
  server.use(
    http.post('/api/v1/schools', () =>
      HttpResponse.json(
        {
          data: {
            id: 'school-1',
            adminCredentials: {
              phone: '+923001234567',
              temporaryPassword: 'temp-pass-abc123',
            },
            ...overrides,
          },
        },
        { status: 201 },
      ),
    ),
  )
}

describe('CreateSchoolForm validation', () => {
  it('refuses an empty form, naming each missing field', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Create school' }))

    expect(await screen.findByText('School name is required')).toBeVisible()
    expect(screen.getByText('Slug is required')).toBeVisible()
    expect(screen.getByText('Contact person is required')).toBeVisible()
    expect(screen.getByText('Phone number is required')).toBeVisible()
    expect(screen.getByText('Address is required')).toBeVisible()
  })

  it('refuses a slug with characters that would break a subdomain', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/Slug/), 'My School!')
    await user.click(screen.getByRole('button', { name: 'Create school' }))

    expect(await screen.findByText('Only lowercase letters, numbers and hyphens')).toBeVisible()
  })

  it('refuses a phone number it cannot normalise', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/Phone/), '12345')
    await user.click(screen.getByRole('button', { name: 'Create school' }))

    expect(await screen.findByText(/Enter a valid phone number/)).toBeVisible()
  })

  it('sends nothing while the form is invalid', async () => {
    let called = false
    server.use(
      http.post('/api/v1/schools', () => {
        called = true
        return HttpResponse.json({ data: {} }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Create school' }))
    await screen.findByText('School name is required')

    expect(called).toBe(false)
  })
})

describe('CreateSchoolForm submission', () => {
  it('normalises the phone number before sending it', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post('/api/v1/schools', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(
          {
            data: {
              id: 'school-1',
              adminCredentials: { phone: '+923001234567', temporaryPassword: 'x' },
            },
          },
          { status: 201 },
        )
      }),
    )
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create school' }))

    await vi.waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toMatchObject({
      name: 'Greenwood Academy',
      slug: 'greenwood-academy',
      type: 'school',
      phone: '+923001234567',
    })
  })

  it('shows the handover credentials once, warning they will not reappear', async () => {
    mockCreated()
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create school' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('School Created')).toBeVisible()
    expect(within(dialog).getByText(/will not be shown again/)).toBeVisible()
    expect(within(dialog).getByText('+923001234567')).toBeVisible()
    expect(within(dialog).getByText('temp-pass-abc123')).toBeVisible()
  })

  /*
   * userEvent installs its own clipboard stub, so the assertion reads what
   * landed there rather than replacing navigator.clipboard — which jsdom
   * defines as read-only anyway.
   */
  it('copies both credentials together, so neither is lost', async () => {
    mockCreated()
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create school' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /Copy/ }))

    await vi.waitFor(async () => {
      expect(await navigator.clipboard.readText()).toBe(
        'Phone: +923001234567\nPassword: temp-pass-abc123',
      )
    })
  })

  it('clears the form after a successful create, so the next school starts blank', async () => {
    mockCreated()
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create school' }))
    await screen.findByRole('dialog')

    expect(screen.getByLabelText(/School name/)).toHaveValue('')
    expect(screen.getByLabelText(/Slug/)).toHaveValue('')
  })

  it('shows a taken slug against the form rather than losing it', async () => {
    server.use(
      http.post('/api/v1/schools', () =>
        HttpResponse.json(
          {
            error: {
              code: 'SLUG_TAKEN',
              message: 'That slug is already in use',
              fieldErrors: { slug: ['That slug is already in use'] },
            },
          },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create school' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That slug is already in use')
  })

  it('reports an unexpected failure without claiming the school was created', async () => {
    server.use(http.post('/api/v1/schools', () => HttpResponse.error()))
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create school' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Something went wrong/)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('disables submit while the request is in flight', async () => {
    server.use(
      http.post('/api/v1/schools', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10_000))
        return HttpResponse.json({ data: {} }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create school' }))

    expect(await screen.findByRole('button', { name: 'Creating…' })).toBeDisabled()
  })
})
