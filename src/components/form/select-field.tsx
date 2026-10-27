'use client'

import { useId } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { describedBy, FieldShell } from './field-shell'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps<TValues extends FieldValues> {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: string
  options: SelectOption[]
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
}

export function SelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = 'Select an option',
  description,
  required,
  disabled,
}: SelectFieldProps<TValues>) {
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
        >
          <Select
            value={typeof field.value === 'string' ? field.value : ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              aria-invalid={fieldState.error !== undefined}
              aria-describedby={describedBy(
                id,
                description !== undefined,
                fieldState.error !== undefined,
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
      )}
    />
  )
}
