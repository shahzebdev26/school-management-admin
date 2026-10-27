'use client'

import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { TextField } from './text-field'

interface PhoneFieldProps<TValues extends FieldValues> {
  control: Control<TValues>
  name: FieldPath<TValues>
  label?: string
  description?: string
  required?: boolean
}

export function PhoneField<TValues extends FieldValues>({
  control,
  name,
  label = 'Phone number',
  description = 'For example 03001234567',
  required,
}: PhoneFieldProps<TValues>) {
  return (
    <TextField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="03001234567"
    />
  )
}
