'use client'

import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Toaster as SonnerToaster } from 'sonner'

interface ToastStyle extends CSSProperties {
  '--normal-bg': string
  '--normal-text': string
  '--normal-border': string
  '--border-radius': string
}

const TOAST_STYLE: ToastStyle = {
  '--normal-bg': 'var(--foreground)',
  '--normal-text': 'var(--background)',
  '--normal-border': 'transparent',
  '--border-radius': 'var(--radius-xl)',
}

export function Toaster() {
  return (
    <SonnerToaster
      className="toaster group"
      position="top-center"
      style={TOAST_STYLE}
      toastOptions={{
        classNames: {
          toast: '!shadow-overlay !font-bold !text-sm',
          icon: '!text-current',
        },
      }}
      icons={{
        success: <CircleCheck className="size-[18px]" />,
        info: <Info className="size-[18px]" />,
        warning: <TriangleAlert className="size-[18px]" />,
        error: <OctagonX className="size-[18px]" />,
        loading: <Loader2 className="size-[18px] animate-spin" />,
      }}
    />
  )
}
