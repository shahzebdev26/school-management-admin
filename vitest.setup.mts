import '@testing-library/jest-dom/vitest'

/*
 * jsdom has no ResizeObserver, and Radix measures its own controls with one —
 * rendering a Checkbox or a Select in a test throws without this.
 */
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe(): void {
      // no layout in jsdom, so nothing to measure
    }

    unobserve(): void {
      // no-op
    }

    disconnect(): void {
      // no-op
    }
  }
}
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach } from 'vitest'
import { server } from './src/mocks/server'

server.listen({ onUnhandledRequest: 'error' })

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
