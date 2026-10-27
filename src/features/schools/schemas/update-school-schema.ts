import { z } from 'zod'
import { normalisePhone } from '@/lib/phone'

export const updateSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(100),
  contactPerson: z.string().min(1, 'Contact person is required').max(100),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .transform((raw, context) => {
      const phone = normalisePhone(raw)
      if (phone === null) {
        context.addIssue({
          code: 'custom',
          message: 'Enter a valid phone number, e.g. 03001234567',
        })
        return z.NEVER
      }
      return phone
    }),
  address: z.string().min(1, 'Address is required').max(300),
})

export type UpdateSchoolFormValues = z.input<typeof updateSchoolSchema>
export type UpdateSchoolInput = z.output<typeof updateSchoolSchema>
