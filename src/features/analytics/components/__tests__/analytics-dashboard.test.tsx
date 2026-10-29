import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { AnalyticsDashboard } from '../analytics-dashboard'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard',
}))

function mockAnalytics(overrides: Record<string, unknown> = {}) {
  server.use(
    http.get('http://localhost:3000/api/v1/analytics', () =>
      HttpResponse.json({
        data: {
          schoolsByStatus: { trial: 3, active: 12, suspended: 1 },
          schoolsByType: { school: 10, coaching: 4, tuition: 2 },
          totalAdmins: 5,
          enrolmentTrend: [
            { month: '2026-05', count: 2 },
            { month: '2026-06', count: 4 },
          ],
          attendanceOverview: [
            { status: 'present', count: 18 },
            { status: 'late', count: 2 },
            { status: 'absent', count: 1 },
            { status: 'leave', count: 0 },
          ],
          ...overrides,
        },
      }),
    ),
  )
}

function renderDashboard() {
  const Wrapper = withQueryClient(createTestQueryClient())
  return render(<AnalyticsDashboard />, { wrapper: Wrapper })
}

describe('AnalyticsDashboard', () => {
  it('shows school counts by status', async () => {
    mockAnalytics()
    renderDashboard()

    expect(await screen.findByText('3')).toBeVisible()
    expect(screen.getByText('12')).toBeVisible()
    expect(screen.getByText('1')).toBeVisible()
  })

  it('shows the platform admin count', async () => {
    mockAnalytics()
    renderDashboard()

    expect(await screen.findByText('5')).toBeVisible()
  })

  it('renders zeroes on a fresh platform rather than blanks', async () => {
    mockAnalytics({
      schoolsByStatus: { trial: 0, active: 0, suspended: 0 },
      schoolsByType: { school: 0, coaching: 0, tuition: 0 },
      totalAdmins: 0,
      enrolmentTrend: [],
      attendanceOverview: [],
    })
    renderDashboard()

    const zeroes = await screen.findAllByText('0')
    expect(zeroes.length).toBeGreaterThan(0)
    expect(await screen.findByText(/no admissions/i)).toBeVisible()
    expect(await screen.findByText(/no attendance has been marked/i)).toBeVisible()
  })

  it('shows the enrolment and attendance charts with real data', async () => {
    mockAnalytics()
    renderDashboard()

    expect(await screen.findByText('Enrolment trend')).toBeVisible()
    expect(screen.getByText('Attendance overview')).toBeVisible()
    expect(screen.getByTitle('Present: 18')).toBeVisible()
  })

  it('offers a retry when analytics fail to load', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/analytics', () =>
        HttpResponse.json({ error: { code: 'SERVER_ERROR', message: 'boom' } }, { status: 500 }),
      ),
    )
    renderDashboard()

    expect(await screen.findByRole('button', { name: /try again/i })).toBeVisible()
  })
})
