import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from '../app-shell'
import type { Session } from '@/features/auth/api/use-session-query'

const pathname = { current: '/dashboard' }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => pathname.current,
}))

const SESSION: Session = {
  id: 'adm-1',
  name: 'Nadia Khan',
  portal: 'platform_admin',
  schoolId: null,
  permissions: [],
  features: {},
  impersonation: null,
}

function renderShell(at = '/dashboard') {
  pathname.current = at
  return render(
    <AppShell session={SESSION}>
      <p>Page body</p>
    </AppShell>,
  )
}

describe('AppShell', () => {
  it('offers every platform section', () => {
    renderShell()

    for (const label of ['Dashboard', 'Schools', 'Admins', 'Audit Log']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
    }
  })

  it('shows who is signed in', () => {
    renderShell()

    expect(screen.getByText('Nadia Khan')).toBeVisible()
  })

  it('renders the page it wraps', () => {
    renderShell()

    expect(screen.getByText('Page body')).toBeVisible()
  })

  it('marks the current section, including on a nested route', () => {
    renderShell('/dashboard/schools/sch-1')

    expect(screen.getByRole('link', { name: 'Schools' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  /*
   * Every section sits under /dashboard, so a prefix test alone would mark
   * Dashboard everywhere. Exactly one item is current on any route.
   */
  it('marks exactly one section as current', () => {
    renderShell('/dashboard/audit')

    const marked = ['Dashboard', 'Schools', 'Admins', 'Audit Log'].filter(
      (label) => screen.getByRole('link', { name: label }).getAttribute('aria-current') === 'page',
    )

    expect(marked).toEqual(['Audit Log'])
  })

  it('marks Dashboard on the dashboard itself', () => {
    renderShell('/dashboard')

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })

  /*
   * Sign-out posts to the route handler rather than calling the API from the
   * browser, so the session cookie is cleared server-side. A GET would let a
   * stray link or a prefetch sign the admin out.
   */
  it('signs out by posting to the logout route', () => {
    renderShell()

    const button = screen.getByRole('button', { name: /sign out/i })
    const form = button.closest('form')

    expect(form).not.toBeNull()
    expect(form?.getAttribute('method')?.toLowerCase()).toBe('post')
    expect(form?.getAttribute('action')).toBe('/api/auth/logout')
  })
})
