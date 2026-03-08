import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Nunito, Playfair_Display, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NutriScan - AI Food Nutrition Analyzer',
  description: 'Scan your food and get instant nutritional insights powered by AI',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  metadataBase: new URL('https://nutri-scan.vercel.app'),
  openGraph: {
    title: 'NutriScan - AI Food Nutrition Analyzer',
    description: 'Scan your food and get instant nutritional insights powered by AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriScan - AI Food Nutrition Analyzer',
    description: 'Scan your food and get instant nutritional insights powered by AI',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eaf0eb' },
    { media: '(prefers-color-scheme: dark)',  color: '#1a1f1b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />
        <link rel="preload" as="image" href="/icon.svg" />
        <link rel="prefetch" href="/dashboard" as="document" />
        <link rel="prefetch" href="/scan" as="document" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${nunito.variable} ${playfairDisplay.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
          <BottomNavigation />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
