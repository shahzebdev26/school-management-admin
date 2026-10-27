export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-pulse rounded-xl bg-card p-6 shadow-md sm:p-8">
        <div className="mx-auto mb-6 h-6 w-2/3 rounded-md bg-muted" />
        <div className="flex flex-col gap-5">
          <div className="h-12 rounded-md bg-muted" />
          <div className="h-12 rounded-md bg-muted" />
          <div className="h-12 rounded-md bg-muted" />
        </div>
      </div>
    </main>
  )
}
