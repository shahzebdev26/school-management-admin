'use client'

import { CircleAlert } from 'lucide-react'
import { useId } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CheckboxFieldProps<TValues extends FieldValues> {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: string
  description?: string
  disabled?: boolean
}

export function CheckboxField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: CheckboxFieldProps<TValues>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex min-h-11 items-start gap-3">
            <Checkbox
              id={id}
              checked={field.value === true}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              aria-invalid={fieldState.error !== undefined}
              aria-describedby={description === undefined ? undefined : `${id}-description`}
              className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={id}>{label}</Label>
              {description ? (
                <p id={`${id}-description`} className="text-[13px] text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {fieldState.error?.message ? (
            <p className="flex gap-1.5 text-[13px] font-semibold text-destructive-text">
              <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {fieldState.error.message}
            </p>
          ) : null}
        </div>
      )}
    />
  )
}
