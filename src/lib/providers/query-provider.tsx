'use client'

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { setSessionExpiredHandler } from '@/lib/api/client'

const STALE_TIME_MS = 30_000

interface QueryProviderProps {
  children: ReactNode
}

function SessionExpiredHandler() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear()
      router.push('/login')
    })
  }, [queryClient, router])

  return null
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionExpiredHandler />
      {children}
    </QueryClientProvider>
  )
}
