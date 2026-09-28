import type { Metadata } from 'next'
import MusicToggle from '@/components/MusicToggle'
import SplashScreen from '@/components/SplashScreen'
import './globals.css'

export const metadata: Metadata = {
  title: 'Physics PlayLab — เรียนฟิสิกส์แบบสนุก',
  description: 'แพลตฟอร์มเรียนฟิสิกส์แบบ Interactive ผ่านการทดลองจำลองและเกาะแห่งการเรียนรู้',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body><SplashScreen />{children}<MusicToggle /></body>
    </html>
  )
}
