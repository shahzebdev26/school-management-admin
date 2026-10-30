'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { useUpdateSchoolMutation } from '../api/use-update-school-mutation'

// Labels for the optional modules a school can be given or denied. The core —
// students, guardians, staff, attendance, fees, notices, calendar — is not
// here: a school without those is not a smaller product, it is a broken one.
const FEATURE_LABELS: Record<string, string> = {
  payroll: 'Payroll and payslips',
  timetable: 'Timetable and period schedule',
  exams: 'Exams, grading and report cards',
  certificates: 'Certificates',
  staffAttendance: 'Staff attendance',
  leave: 'Leave requests and policy',
  homework: 'Homework and assignments',
}

function label(key: string): string {
  return FEATURE_LABELS[key] ?? key
}

interface FeatureRowProps {
  name: string
  enabled: boolean
  disabled: boolean
  onChange: (enabled: boolean) => void
}

function FeatureRow({ name, enabled, disabled, onChange }: FeatureRowProps) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-border p-3.5">
      <span className="text-sm font-bold text-foreground">{label(name)}</span>
      <Switch
        checked={enabled}
        disabled={disabled}
        aria-label={label(name)}
        onCheckedChange={onChange}
      />
    </li>
  )
}

interface SchoolFeaturesPanelProps {
  id: string
  features: Record<string, boolean>
}

// Each switch saves on its own rather than through a Save button. There is one
// field per request and no draft worth losing, and an admin who flips three
// switches and navigates away should not find that none of them took.
export function SchoolFeaturesPanel({ id, features }: SchoolFeaturesPanelProps) {
  const update = useUpdateSchoolMutation(id)
  const [pending, setPending] = useState<string | null>(null)

  const toggle = (name: string, enabled: boolean) => {
    setPending(name)
    update.mutate(
      { features: { [name]: enabled } },
      {
        onSuccess: () => {
          toast.success(`${label(name)} ${enabled ? 'enabled' : 'disabled'}`)
        },
        onError: () => {
          toast.error(`Could not change ${label(name)}`)
        },
        onSettled: () => {
          setPending(null)
        },
      },
    )
  }

  return (
    <section className="flex max-w-lg flex-col gap-3">
      <div>
        <h2 className="text-base font-extrabold text-foreground">Modules</h2>
        <p className="text-sm text-muted-foreground">
          Switching a module off hides it from this school and refuses its API routes. Core features
          — students, staff, attendance, fees and notices — are always on.
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {Object.entries(features).map(([name, enabled]) => (
          <FeatureRow
            key={name}
            name={name}
            enabled={enabled}
            disabled={pending !== null}
            onChange={(next) => {
              toggle(name, next)
            }}
          />
        ))}
      </ul>
    </section>
  )
}
