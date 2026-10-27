import http from 'node:http'
import https from 'node:https'
import { getEnv } from '@/lib/env'

export interface ServerSideResponse {
  status: number
  body: unknown
}

export function getFromApi(path: string, host: string): Promise<ServerSideResponse> {
  const target = new URL(getEnv().API_ORIGIN)
  const transport = target.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    const request = transport.request(
      {
        hostname: target.hostname,
        port: target.port === '' ? undefined : target.port,
        path,
        method: 'GET',
        headers: { host },
      },
      (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => chunks.push(chunk))
        response.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8')
          resolve({
            status: response.statusCode ?? 502,
            body: raw.length > 0 ? JSON.parse(raw) : undefined,
          })
        })
      },
    )

    request.on('error', reject)
    request.end()
  })
}
