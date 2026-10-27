import { cn } from 'cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative overflow-hidden rounded-md bg-brand-100 after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-card/60 after:to-transparent',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
