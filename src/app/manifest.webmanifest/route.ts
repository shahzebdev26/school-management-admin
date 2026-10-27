export function GET(): Response {
  const manifest = {
    name: 'TechSparks Admin',
    short_name: 'Admin',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [],
  }

  return new Response(JSON.stringify(manifest), {
    headers: { 'content-type': 'application/manifest+json' },
  })
}
