import { z } from 'zod'

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_SCHOOL_WEB_PROTOCOL: z.enum(['http', 'https']).default('https'),
  NEXT_PUBLIC_SCHOOL_WEB_PORT: z.string().default(''),
})

// Safe to import from a client component: every field here is NEXT_PUBLIC_*,
// so it is inlined at build time. getEnv() in env.ts also validates
// API_ORIGIN, which has no browser value and throws if evaluated client-side.
const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
  NEXT_PUBLIC_SCHOOL_WEB_PROTOCOL: process.env.NEXT_PUBLIC_SCHOOL_WEB_PROTOCOL,
  NEXT_PUBLIC_SCHOOL_WEB_PORT: process.env.NEXT_PUBLIC_SCHOOL_WEB_PORT,
})

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  throw new Error(`Invalid environment configuration:\n${details}`)
}

export const publicEnv = Object.freeze(parsed.data)

// school-management-web runs on its own port in dev (NEXT_PUBLIC_SCHOOL_WEB_PORT),
// while production reaches every subdomain over the standard port, so the var
// is left unset there.
export function schoolWebOrigin(slug: string): string {
  const host = `${slug}.${publicEnv.NEXT_PUBLIC_APP_DOMAIN}`
  const port = publicEnv.NEXT_PUBLIC_SCHOOL_WEB_PORT

  return `${publicEnv.NEXT_PUBLIC_SCHOOL_WEB_PROTOCOL}://${host}${port ? `:${port}` : ''}`
}
