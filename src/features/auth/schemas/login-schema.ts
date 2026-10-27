import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.input<typeof loginSchema>
export type LoginInput = z.output<typeof loginSchema>
