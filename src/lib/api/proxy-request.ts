import http from 'node:http'
import https from 'node:https'
import type { NextRequest } from 'next/server'
import { getEnv } from '@/lib/env'

const STRIPPED_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length'])

function buildUpstreamPath(request: NextRequest): string {
  const incomingUrl = new URL(request.url)
  return incomingUrl.pathname.replace(/^\/api/, '') + incomingUrl.search
}

function buildUpstreamHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}

  request.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers[key] = value
    }
  })

  const originalHost = request.headers.get('host')

  if (originalHost !== null) {
    headers.host = originalHost
  }

  return headers
}

function toResponseHeaders(upstreamHeaders: http.IncomingHttpHeaders): Headers {
  const headers = new Headers()

  for (const [key, value] of Object.entries(upstreamHeaders)) {
    if (value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        headers.append(key, entry)
      }
    } else {
      headers.set(key, value)
    }
  }

  return headers
}

async function readBody(request: NextRequest): Promise<Buffer | undefined> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined
  }

  return Buffer.from(await request.arrayBuffer())
}

export async function proxyToApi(request: NextRequest): Promise<Response> {
  const target = new URL(getEnv().API_ORIGIN)
  const transport = target.protocol === 'https:' ? https : http
  const body = await readBody(request)

  return new Promise<Response>((resolve, reject) => {
    const upstreamRequest = transport.request(
      {
        hostname: target.hostname,
        port: target.port === '' ? undefined : target.port,
        path: buildUpstreamPath(request),
        method: request.method,
        headers: buildUpstreamHeaders(request),
      },
      (upstreamResponse) => {
        const chunks: Buffer[] = []
        upstreamResponse.on('data', (chunk: Buffer) => chunks.push(chunk))
        upstreamResponse.on('end', () => {
          try {
            const status = upstreamResponse.statusCode ?? 502
            const isNullBody = status === 204 || status === 304

            resolve(
              new Response(isNullBody ? null : Buffer.concat(chunks), {
                status,
                headers: toResponseHeaders(upstreamResponse.headers),
              }),
            )
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)))
          }
        })
      },
    )

    upstreamRequest.on('error', reject)

    if (body) {
      upstreamRequest.write(body)
    }

    upstreamRequest.end()
  })
}
