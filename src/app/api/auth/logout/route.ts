import { NextResponse, type NextRequest } from 'next/server'
import { requestUpstream } from '@/lib/api/proxy-request'

export async function POST(request: NextRequest): Promise<Response> {
  const upstream = await requestUpstream(request, '/v1/auth/logout')
  const redirect = NextResponse.redirect(new URL('/login', request.url), 303)

  const setCookie = upstream.headers['set-cookie']
  if (setCookie) {
    for (const cookie of setCookie) {
      redirect.headers.append('set-cookie', cookie)
    }
  }

  return redirect
}
