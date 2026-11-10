import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Platform Pertanian Padi Desa Cirebon Girang',
  description:
    'Sistem Informasi Pertanian & Manajemen Budidaya Padi Desa Cirebon Girang untuk Admin, Perangkat Desa, dan Petani.',
  keywords: [
    'Pertanian Padi',
    'Desa Cirebon Girang',
    'Kelompok Tani',
    'Budidaya Padi',
    'Manajemen Lahan Pertanian',
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#14593b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
