import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MusicApp - Your Music Library',
  description: 'Upload, stream, and organize your music',
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
