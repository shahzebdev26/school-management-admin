'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { TextField } from '@/components/form/text-field'
import { useServerFieldErrors } from '@/components/form/use-server-field-errors'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/errors'
import { useLoginMutation } from '../api/use-login-mutation'
import { loginSchema, type LoginFormValues } from '../schemas/login-schema'

const KNOWN_FIELDS = ['email', 'password'] as const

export function LoginForm() {
  const router = useRouter()
  const mutation = useLoginMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mapServerFieldErrors = useServerFieldErrors(form.setError, KNOWN_FIELDS)

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)

    mutation.mutate(values, {
      onSuccess: () => {
        router.push('/dashboard')
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          const formLevelMessages = mapServerFieldErrors(error)
          setFormError(formLevelMessages[0] ?? error.message)
          return
        }

        setFormError('Something went wrong. Please try again.')
      },
    })
  })

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event)
      }}
      className="flex flex-col gap-5"
    >
      {formError ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {formError}
        </p>
      ) : null}
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        control={form.control}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
