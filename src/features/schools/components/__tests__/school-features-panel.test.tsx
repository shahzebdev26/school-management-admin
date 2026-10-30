import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createTestQueryClient, withQueryClient } from '@/mocks/render-with-query-client'
import { server } from '@/mocks/server'
import { SchoolFeaturesPanel } from '../school-features-panel'

const ALL_ON = {
  payroll: true,
  timetable: true,
  exams: true,
  certificates: true,
  staffAttendance: true,
  leave: true,
  homework: true,
}

const patchSchema = z.object({ features: z.record(z.string(), z.boolean()).optional() })

type Patch = z.infer<typeof patchSchema>

function mockPatch(status = 200): Patch[] {
  const sent: Patch[] = []

  server.use(
    http.patch('/api/v1/schools/school-1', async ({ request }) => {
      const body: unknown = await request.json()
      sent.push(patchSchema.parse(body))
      return status === 200
        ? HttpResponse.json({ data: {} })
        : HttpResponse.json({ error: { message: 'Nope' } }, { status })
    }),
  )

  return sent
}

function renderPanel(features: Record<string, boolean> = ALL_ON) {
  return render(<SchoolFeaturesPanel id="school-1" features={features} />, {
    wrapper: withQueryClient(createTestQueryClient()),
  })
}

describe('SchoolFeaturesPanel', () => {
  it('shows a switch for every optional module', () => {
    renderPanel()

    expect(screen.getByRole('switch', { name: 'Payroll and payslips' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Certificates' })).toBeInTheDocument()
    expect(screen.getAllByRole('switch')).toHaveLength(7)
  })

  it('reflects which modules are already off', () => {
    renderPanel({ ...ALL_ON, payroll: false })

    expect(screen.getByRole('switch', { name: 'Payroll and payslips' })).not.toBeChecked()
    expect(screen.getByRole('switch', { name: 'Certificates' })).toBeChecked()
  })

  /*
   * One field per request. Sending the whole set would mean a stale copy of
   * the other six overwriting a change made somewhere else in between.
   */
  it('sends only the module that was switched', async () => {
    const sent = mockPatch()
    renderPanel()

    await userEvent.click(screen.getByRole('switch', { name: 'Payroll and payslips' }))

    await waitFor(() => {
      expect(sent).toEqual([{ features: { payroll: false } }])
    })
  })

  it('sends true when a module is switched back on', async () => {
    const sent = mockPatch()
    renderPanel({ ...ALL_ON, exams: false })

    await userEvent.click(screen.getByRole('switch', { name: 'Exams, grading and report cards' }))

    await waitFor(() => {
      expect(sent).toEqual([{ features: { exams: true } }])
    })
  })

  it('does not leave the switch showing a change the API refused', async () => {
    const sent = mockPatch(500)
    renderPanel()

    const toggle = screen.getByRole('switch', { name: 'Certificates' })
    await userEvent.click(toggle)

    await waitFor(() => {
      expect(sent).toHaveLength(1)
    })

    /*
     * The switch reads from the server copy, so a refused change must leave it
     * where it was. Asserting on the toast instead would need sonner's Toaster
     * mounted, which this app puts in the root layout rather than the test
     * wrapper.
     */
    expect(toggle).toBeChecked()
  })

  /*
   * The core modules are deliberately absent: a school without students,
   * attendance or fees is not a smaller product, it is a broken one.
   */
  it('offers no switch for a core module', () => {
    renderPanel()

    expect(screen.queryByRole('switch', { name: /students/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: /fees/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: /^attendance/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: /notices/i })).not.toBeInTheDocument()
  })
})
