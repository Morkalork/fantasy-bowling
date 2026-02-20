import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bowling Team Scraper',
  description: 'Scraper for Swedish bowling team data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
