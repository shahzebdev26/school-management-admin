'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TableActionGroupProps {
  children: React.ReactNode
  className?: string
}

/**
 * Standard container for table row action buttons.
 * Automatically stops event propagation so row clicks are not accidentally triggered.
 */
export function TableActionGroup({ children, className }: TableActionGroupProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-1.5', className)}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}

export interface TableActionButtonProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean
}

/**
 * Standard table action button (Edit, View, Manage, etc.).
 * Inherits compact size and ensures stopPropagation on click.
 */
export function TableActionButton({
  className,
  variant = 'outline',
  size = 'xs',
  onClick,
  ...props
}: TableActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('cursor-pointer font-bold text-xs', className)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      {...props}
    />
  )
}
