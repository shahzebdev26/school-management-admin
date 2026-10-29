import { Info } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/login-form'
import { LoginHeader } from '@/features/auth/components/login-header'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background sm:p-6 lg:p-10">
      <div className="flex min-h-screen w-full max-w-[440px] flex-col overflow-hidden bg-background sm:min-h-0 sm:rounded-xl sm:border sm:border-primary/15 sm:shadow-overlay">
        {/* Top Hero Section */}
        <LoginHeader />

        {/* Floating Card & Footer Section */}
        <div className="relative -mt-7 z-10 flex flex-1 flex-col px-4 pb-8 sm:px-6">
          <LoginForm />

          {/* Bottom Info Banner */}
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-primary/20 bg-accent/80 px-4 py-3.5 text-accent-foreground shadow-xs">
            <Info className="size-5 shrink-0 text-primary-strong" aria-hidden="true" />
            <p className="font-medium text-xs leading-relaxed sm:text-sm">
              No account yet? Platform admin accounts are provisioned by system administrators.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
