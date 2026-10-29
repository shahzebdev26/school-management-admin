'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/form/text-field'
import { useServerFieldErrors } from '@/components/form/use-server-field-errors'
import { ApiError } from '@/lib/api/errors'
import { useLoginMutation } from '../api/use-login-mutation'
import { loginSchema, type LoginFormValues } from '../schemas/login-schema'

const KNOWN_FIELDS = ['email', 'password'] as const

function LoginErrorBanner({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertDescription className="text-destructive-text">{message}</AlertDescription>
    </Alert>
  )
}

function SubmitButton({ isPending, hasError }: { isPending: boolean; hasError: boolean }) {
  if (isPending) {
    return (
      <Button type="submit" size="lg" disabled className="mt-2 w-full">
        Signing in...
      </Button>
    )
  }

  if (hasError) {
    return (
      <Button type="submit" size="lg" className="mt-2 w-full active:scale-[0.99]">
        Try again
      </Button>
    )
  }

  return (
    <Button type="submit" size="lg" className="mt-2 w-full active:scale-[0.99]">
      <span>Sign in</span>
      <ArrowRight aria-hidden="true" />
    </Button>
  )
}

function useLoginSubmit(opts: {
  setFormError: (msg: string | null) => void
  setError: ReturnType<typeof useForm<LoginFormValues>>['setError']
}) {
  const router = useRouter()
  const mutation = useLoginMutation()
  const mapServerFieldErrors = useServerFieldErrors(opts.setError, KNOWN_FIELDS)

  const handleSubmit = (values: LoginFormValues) => {
    opts.setFormError(null)

    mutation.mutate(values, {
      onSuccess: () => {
        router.push('/dashboard')
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          const formLevelMessages = mapServerFieldErrors(error)
          opts.setFormError(formLevelMessages[0] ?? error.message)
          return
        }

        opts.setFormError('That email or password isn’t right. Check both and try again.')
      },
    })
  }

  return { onSubmit: handleSubmit, isPending: mutation.isPending }
}

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { onSubmit, isPending } = useLoginSubmit({
    setFormError,
    setError: form.setError,
  })

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-md sm:p-7">
      <div className="mb-5">
        <h2 className="font-black text-2xl tracking-tight text-foreground">Sign in</h2>
        <p className="mt-1 font-medium text-muted-foreground text-xs sm:text-sm">
          Use your registered platform email.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event)
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        {formError ? <LoginErrorBanner message={formError} /> : null}

        <TextField
          control={form.control}
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="admin@techsparks.co"
          icon={Mail}
          variant="stacked"
          required
        />

        <TextField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          icon={Lock}
          variant="stacked"
          required
        />

        <SubmitButton isPending={isPending} hasError={formError !== null} />
      </form>
    </div>
  )
}
