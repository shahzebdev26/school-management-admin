import { z } from 'zod'

const envSchema = z.object({
  API_ORIGIN: z.url(),
  NEXT_PUBLIC_APP_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_BUILD_ID: z.string().min(1).optional(),
})

type Env = z.infer<typeof envSchema>

let cached: Env | null = null

export function getEnv(): Env {
  if (cached) return cached

  const parsed = envSchema.safeParse({
    API_ORIGIN: process.env.API_ORIGIN,
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
    NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID,
  })

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    throw new Error(`Invalid environment configuration:\n${details}`)
  }

  cached = Object.freeze(parsed.data)
  return cached
}

export const isDevelopment = process.env.NODE_ENV !== 'production'
