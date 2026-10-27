'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Tabs as TabsPrimitive } from 'radix-ui'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-3 data-horizontal:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva('group/tabs-list inline-flex w-fit items-center', {
  variants: {
    variant: {
      underline: 'w-full gap-1 border-b border-border',
      pill: 'rounded-lg bg-muted p-1',
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
})

function TabsList({
  className,
  variant = 'underline',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-bold whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-55 data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'group-data-[variant=underline]/tabs-list:-mb-px group-data-[variant=underline]/tabs-list:h-12 group-data-[variant=underline]/tabs-list:border-b-[3px] group-data-[variant=underline]/tabs-list:border-transparent group-data-[variant=underline]/tabs-list:px-[18px] group-data-[variant=underline]/tabs-list:data-active:border-brand-500',
        'group-data-[variant=pill]/tabs-list:h-10 group-data-[variant=pill]/tabs-list:flex-1 group-data-[variant=pill]/tabs-list:rounded-md group-data-[variant=pill]/tabs-list:px-4 group-data-[variant=pill]/tabs-list:text-sm group-data-[variant=pill]/tabs-list:data-active:bg-card group-data-[variant=pill]/tabs-list:data-active:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
