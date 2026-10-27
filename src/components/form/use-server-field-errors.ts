'use client'

import { useCallback } from 'react'
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

export interface ApiFieldErrors {
  fieldErrors?: Record<string, string[]>
}

const FORM_LEVEL_KEY = '_form'

export function useServerFieldErrors<TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  knownFields: readonly FieldPath<TValues>[],
) {
  return useCallback(
    (response: ApiFieldErrors): string[] => {
      const fieldErrors = response.fieldErrors

      if (!fieldErrors) {
        return []
      }

      const formLevel: string[] = []

      for (const [field, messages] of Object.entries(fieldErrors)) {
        const message = messages[0]

        if (message === undefined) {
          continue
        }

        if (field === FORM_LEVEL_KEY) {
          formLevel.push(...messages)
          continue
        }

        const known = knownFields.find((candidate) => candidate === field)

        if (known === undefined) {
          formLevel.push(message)
          continue
        }

        setError(known, { type: 'server', message })
      }

      return formLevel
    },
    [setError, knownFields],
  )
}
