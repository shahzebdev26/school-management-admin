const E164_PATTERN = /^\+[1-9]\d{7,14}$/
const DEFAULT_COUNTRY_CODE = '92'

function toInternationalForm(stripped: string): string {
  if (stripped.startsWith('+')) {
    return stripped
  }

  if (stripped.startsWith('00')) {
    return `+${stripped.slice(2)}`
  }

  if (stripped.startsWith('0')) {
    return `+${DEFAULT_COUNTRY_CODE}${stripped.slice(1)}`
  }

  return stripped.startsWith(DEFAULT_COUNTRY_CODE) ? `+${stripped}` : stripped
}

export function normalisePhone(raw: string): string | null {
  const stripped = raw.replace(/[\s\-().]/g, '')
  const candidate = toInternationalForm(stripped)

  return E164_PATTERN.test(candidate) ? candidate : null
}
