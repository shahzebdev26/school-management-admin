'use client'

import {
  CircleAlert,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  MapPin,
  Smartphone,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { describedBy } from './field-shell'

export type TextFieldVariant = 'standard' | 'stacked'

export interface TextFieldProps<TValues extends FieldValues> extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'name' | 'defaultValue' | 'id' | 'aria-invalid'
> {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: string
  description?: string
  icon?: LucideIcon
  variant?: TextFieldVariant
}

const ICON_MAP: Record<string, LucideIcon> = {
  email: Mail,
  password: Lock,
  tel: Smartphone,
  phone: Smartphone,
  contactperson: User,
  name: User,
  address: MapPin,
  slug: Globe,
}

function resolveIcon(name: string, type?: string, icon?: LucideIcon): LucideIcon | null {
  if (icon) return icon
  if (type !== undefined && ICON_MAP[type] !== undefined) {
    return ICON_MAP[type]
  }
  const key = name.toLowerCase()
  return ICON_MAP[key] ?? null
}

function usePasswordType(type?: string) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const actualType = isPassword && show ? 'text' : (type ?? 'text')

  return {
    isPassword,
    show,
    actualType,
    toggle: () => {
      setShow((prev) => !prev)
    },
  }
}

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="cursor-pointer p-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus:outline-none focus-visible:outline-none"
    >
      {show ? (
        <EyeOff className="size-4.5" aria-hidden="true" />
      ) : (
        <Eye className="size-4.5" aria-hidden="true" />
      )}
    </button>
  )
}

function StackedControl({
  id,
  label,
  required,
  hasError,
  IconComponent,
  children,
  passwordToggle,
}: {
  id: string
  label: string
  required?: boolean | undefined
  hasError: boolean
  IconComponent: LucideIcon | null
  children: ReactNode
  passwordToggle?: ReactNode
}) {
  return (
    <div
      className={cn(
        'group relative flex items-center gap-3.5 rounded-2xl border-[1.5px] p-2.5 pl-3 transition-all outline-none focus:outline-none focus-within:outline-none',
        hasError
          ? 'border-destructive bg-destructive-bg/60'
          : 'border-input bg-card hover:border-primary/60 focus-within:border-primary',
      )}
    >
      {IconComponent ? (
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors',
            hasError
              ? 'bg-destructive-bg text-destructive-text'
              : 'bg-accent text-accent-foreground',
          )}
        >
          <IconComponent className="size-5" aria-hidden="true" />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <label
          htmlFor={id}
          className="block cursor-pointer font-bold text-[11px] text-muted-foreground uppercase tracking-wide"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive-text" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {children}
      </div>

      {passwordToggle}
    </div>
  )
}

function StandardControl({
  id,
  label,
  required,
  hasError,
  IconComponent,
  children,
  passwordToggle,
}: {
  id: string
  label: string
  required?: boolean | undefined
  hasError: boolean
  IconComponent: LucideIcon | null
  children: ReactNode
  passwordToggle?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="block cursor-pointer font-bold text-foreground text-sm">
        {label}
        {required ? (
          <span className="ml-1 text-destructive-text" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <div
        className={cn(
          'group relative flex h-12 items-center gap-2.5 rounded-xl border-[1.5px] px-3 bg-card transition-all outline-none focus:outline-none focus-within:outline-none',
          hasError
            ? 'border-destructive bg-destructive-bg/60'
            : 'border-input hover:border-primary/60 focus-within:border-primary',
        )}
      >
        {IconComponent ? (
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              hasError
                ? 'bg-destructive-bg text-destructive-text'
                : 'bg-accent text-accent-foreground',
            )}
          >
            <IconComponent className="size-4" aria-hidden="true" />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center">{children}</div>

        {passwordToggle}
      </div>
    </div>
  )
}

function TextFieldFeedback({
  id,
  description,
  error,
}: {
  id: string
  description?: string | undefined
  error?: string | undefined
}) {
  if (error !== undefined) {
    return (
      <p
        id={`${id}-error`}
        className="flex items-center gap-1.5 px-1 font-semibold text-destructive-text text-xs"
      >
        <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
        {error}
      </p>
    )
  }

  if (description !== undefined) {
    return (
      <p id={`${id}-description`} className="px-1 text-xs text-muted-foreground">
        {description}
      </p>
    )
  }

  return null
}

const INPUT_CLASS: Record<TextFieldVariant, string> = {
  stacked:
    'w-full border-0 bg-transparent p-0 font-bold text-[15px] text-foreground placeholder:font-normal placeholder:text-muted-foreground outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0',
  standard:
    'w-full border-0 bg-transparent p-0 font-semibold text-sm text-foreground placeholder:font-normal placeholder:text-muted-foreground outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0',
}

export function TextField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  icon,
  required,
  className,
  type = 'text',
  variant = 'standard',
  ...inputProps
}: TextFieldProps<TValues>) {
  const id = useId()
  const { isPassword, show, actualType, toggle } = usePasswordType(type)
  const IconComponent = resolveIcon(name, type, icon)
  const ControlComponent = variant === 'stacked' ? StackedControl : StandardControl

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = fieldState.error !== undefined

        return (
          <div className={cn('flex min-w-0 flex-col gap-1', className)}>
            <ControlComponent
              id={id}
              label={label}
              required={required}
              hasError={hasError}
              IconComponent={IconComponent}
              passwordToggle={isPassword ? <PasswordToggle show={show} onToggle={toggle} /> : null}
            >
              <input
                {...inputProps}
                id={id}
                type={actualType}
                name={field.name}
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                aria-invalid={hasError}
                aria-describedby={describedBy(id, description !== undefined, hasError)}
                className={INPUT_CLASS[variant]}
              />
            </ControlComponent>
            <TextFieldFeedback
              id={id}
              description={description}
              error={fieldState.error?.message}
            />
          </div>
        )
      }}
    />
  )
}
