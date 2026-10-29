import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { SchoolDetail } from '../school-detail'

function school(overrides: Record<string, unknown> = {}) {
  return {
    id: 'school-1',
    name: 'Greenwood Academy',
    slug: 'greenwood-academy',
    type: 'school',
    status: 'active',
    contactPerson: 'Ayesha Khan',
    phone: '+923001234567',
    address: '12 Model Town, Lahore',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  }
}

function mockSchool(overrides: Record<string, unknown> = {}) {
  server.use(
    http.get('/api/v1/schools/school-1', () => HttpResponse.json({ data: school(overrides) })),
  )
}

function renderDetail() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<SchoolDetail id="school-1" />, { wrapper: Wrapper })
}

describe('SchoolDetail', () => {
  it('shows the school and its status', async () => {
    mockSchool()
    renderDetail()

    // The name appears as both the screen heading and a detail row.
    expect(await screen.findByRole('heading', { name: 'Greenwood Academy' })).toBeVisible()
    expect(screen.getByText('greenwood-academy')).toBeVisible()
    expect(screen.getByText('+923001234567')).toBeVisible()
    expect(screen.getByText('active')).toBeVisible()
  })

  it('offers a retry when the school fails to load', async () => {
    server.use(
      http.get('/api/v1/schools/school-1', () =>
        HttpResponse.json({ error: { code: 'SERVER_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    )
    renderDetail()

    expect(await screen.findByRole('button', { name: /try again/i })).toBeVisible()
  })
})

describe('suspending a school', () => {
  it('warns that the school loses access before suspending', async () => {
    mockSchool()
    const user = userEvent.setup()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Suspend' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Suspend Greenwood Academy\?/)).toBeVisible()
    expect(within(dialog).getByText(/lose access to the platform/)).toBeVisible()
  })

  it('suspends only after the confirmation is accepted', async () => {
    let called = false
    mockSchool()
    server.use(
      http.post('/api/v1/schools/school-1/suspend', () => {
        called = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Suspend' }))
    expect(called).toBe(false)

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Suspend' }))

    await vi.waitFor(() => {
      expect(called).toBe(true)
    })
  })

  it('offers activation instead when a school is already suspended', async () => {
    mockSchool({ status: 'suspended' })
    renderDetail()

    expect(await screen.findByRole('button', { name: 'Activate' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Suspend' })).not.toBeInTheDocument()
  })

  it('offers suspension for a trial school, which still has access', async () => {
    mockSchool({ status: 'trial' })
    renderDetail()

    expect(await screen.findByRole('button', { name: 'Suspend' })).toBeVisible()
  })

  it('reactivates only after the confirmation is accepted', async () => {
    let called = false
    mockSchool({ status: 'suspended' })
    server.use(
      http.post('/api/v1/schools/school-1/activate', () => {
        called = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Activate' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Activate' }))

    await vi.waitFor(() => {
      expect(called).toBe(true)
    })
  })
})
