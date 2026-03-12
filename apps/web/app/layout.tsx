import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClawCart - Voice-First Shopping',
  description: 'Build, optimize, and share shopping carts across 200+ retailers with natural language',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
