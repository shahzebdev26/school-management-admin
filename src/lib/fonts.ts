import localFont from 'next/font/local'

export const jakarta = localFont({
  src: '../assets/fonts/PlusJakartaSansVariable.woff2',
  variable: '--font-jakarta',
  display: 'swap',
  weight: '200 800',
  style: 'normal',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})
