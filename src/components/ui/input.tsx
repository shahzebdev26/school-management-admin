import * as React from 'react'
import { cn } from 'cn'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-[52px] w-full min-w-0 rounded-lg border-[1.5px] border-input bg-background px-3.5 text-base font-medium text-foreground transition-[border-color,box-shadow,background-color] duration-150 placeholder:font-medium placeholder:text-muted-foreground focus-visible:bg-card focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-destructive file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
