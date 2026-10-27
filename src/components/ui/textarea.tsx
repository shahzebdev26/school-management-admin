import * as React from 'react'
import { cn } from 'cn'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[104px] w-full rounded-lg border-[1.5px] border-input bg-background px-3.5 py-3.5 text-base font-medium text-foreground transition-[border-color,box-shadow,background-color] duration-150 placeholder:font-medium placeholder:text-muted-foreground focus-visible:bg-card focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
