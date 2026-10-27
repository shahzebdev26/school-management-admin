import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Slot } from 'radix-ui'

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border-[1.5px] border-transparent font-extrabold whitespace-nowrap select-none transition-[filter,background-color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default:
          'bg-linear-to-b from-primary to-primary-strong text-primary-foreground shadow-glow hover:brightness-110',
        secondary: 'bg-accent text-accent-foreground hover:brightness-95',
        outline: 'border-input bg-transparent text-foreground hover:bg-accent',
        ghost: 'text-primary hover:bg-accent',
        destructive: 'bg-destructive text-destructive-foreground hover:brightness-110',
        link: 'text-primary underline underline-offset-4 hover:brightness-90',
      },
      size: {
        default: 'h-12 px-[22px] text-[15px]',
        xs: "h-7 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 rounded-md px-3.5 text-[13px] [&_svg:not([class*='size-'])]:size-4",
        lg: 'h-14 px-7 text-base',
        icon: 'size-12',
        'icon-xs': "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm': "size-9 rounded-md [&_svg:not([class*='size-'])]:size-4",
        'icon-lg': 'size-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
