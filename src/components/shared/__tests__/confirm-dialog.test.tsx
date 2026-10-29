import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '../confirm-dialog'

function renderDialog(onConfirm: () => void, isPending = false) {
  return render(
    <ConfirmDialog
      trigger={<Button>Suspend</Button>}
      title="Suspend this school?"
      description="Staff and students lose access until it is reactivated."
      confirmLabel="Suspend school"
      onConfirm={onConfirm}
      isPending={isPending}
    />,
  )
}

describe('ConfirmDialog', () => {
  it('does nothing until the dialog is opened', () => {
    const onConfirm = vi.fn()
    renderDialog(onConfirm)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('states what will happen before confirming', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderDialog(onConfirm)

    await user.click(screen.getByRole('button', { name: 'Suspend' }))

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText(/lose access/i)).toBeVisible()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('acts only once the confirm control is used', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderDialog(onConfirm)

    await user.click(screen.getByRole('button', { name: 'Suspend' }))
    await user.click(await screen.findByRole('button', { name: 'Suspend school' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancelling leaves the action untaken', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderDialog(onConfirm)

    await user.click(screen.getByRole('button', { name: 'Suspend' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('cannot be confirmed twice while the first attempt is in flight', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderDialog(onConfirm, true)

    await user.click(screen.getByRole('button', { name: 'Suspend' }))
    const confirm = await screen.findByRole('button', { name: /working/i })

    expect(confirm).toBeDisabled()
  })
})
