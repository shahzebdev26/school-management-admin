import { Skeleton } from '@/components/ui/skeleton'

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex flex-col gap-6 px-4 py-5">
          <div className="flex items-center gap-2.5 px-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex h-10 items-center gap-3 px-3">
                <Skeleton className="size-[18px] rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </header>

        <main className="flex-1 p-6">
          <Skeleton className="h-8 w-48" />
        </main>
      </div>
    </div>
  )
}
