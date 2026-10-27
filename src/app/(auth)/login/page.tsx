import { LoginForm } from '@/features/auth/components/login-form'
import { LoginHeader } from '@/features/auth/components/login-header'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-md sm:p-8">
        <LoginHeader />
        <LoginForm />
      </div>
    </main>
  )
}
