import { z } from 'zod'

export const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.email({ message: 'Enter a valid email address' }),
  password: z.string().min(10, 'Password must be at least 10 characters'),
})

export type CreateAdminFormValues = z.input<typeof createAdminSchema>
export type CreateAdminInput = z.output<typeof createAdminSchema>
