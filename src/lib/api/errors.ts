export interface ApiErrorBody {
  code: string
  message: string
  requestId?: string
  fieldErrors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly fieldErrors?: Record<string, string[]>

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.code = body.code
    this.status = status

    if (body.fieldErrors !== undefined) {
      this.fieldErrors = body.fieldErrors
    }
  }
}
