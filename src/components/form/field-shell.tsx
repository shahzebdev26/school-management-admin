import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  label: string
  htmlFor: string
  error?: string | undefined
  description?: string | undefined
  required?: boolean | undefined
  className?: string | undefined
  children: ReactNode
}

export function FieldShell({
  label,
  htmlFor,
  error,
  description,
  required,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="text-destructive-text" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {description ? (
        <p id={`${htmlFor}-description`} className="text-[13px] text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="flex gap-1.5 text-[13px] font-semibold text-destructive-text"
        >
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function describedBy(
  id: string,
  hasDescription: boolean,
  hasError: boolean,
): string | undefined {
  const ids = [hasDescription ? `${id}-description` : null, hasError ? `${id}-error` : null].filter(
    (value): value is string => value !== null,
  )

  return ids.length > 0 ? ids.join(' ') : undefined
}
