'use client'

import { useId, type ComponentPropsWithoutRef } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { describedBy, FieldShell } from './field-shell'

interface TextareaFieldProps<TValues extends FieldValues> extends Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'name' | 'defaultValue' | 'id' | 'aria-invalid'
> {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: string
  description?: string
}

export function TextareaField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...textareaProps
}: TextareaFieldProps<TValues>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          label={label}
          htmlFor={id}
          error={fieldState.error?.message}
          description={description}
          required={required}
          className={className}
        >
          <Textarea
            {...textareaProps}
            id={id}
            name={field.name}
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            aria-invalid={fieldState.error !== undefined}
            aria-describedby={describedBy(
              id,
              description !== undefined,
              fieldState.error !== undefined,
            )}
          />
        </FieldShell>
      )}
    />
  )
}
