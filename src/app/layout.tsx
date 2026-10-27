import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/shared/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { jakarta } from '@/lib/fonts'
import { QueryProvider } from '@/lib/providers/query-provider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'TechSparks Admin',
  description: 'Platform administration dashboard for TechSparks',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: ReactNode
}

type CSSWithCustomProps = React.CSSProperties & Record<`--${string}`, string>

const brandTokens: CSSWithCustomProps = { '--brand-h': '200', '--brand-c': '0.16' }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={jakarta.variable} style={brandTokens}>
      <body>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
