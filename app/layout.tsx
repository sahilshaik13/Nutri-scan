import type { Metadata, Viewport } from 'next'
import { Manrope, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
  display: 'swap',
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NutriScan - AI Food Nutrition Analyzer',
  description: 'Scan your food and get instant nutritional insights powered by AI',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
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
    { media: '(prefers-color-scheme: light)', color: '#f6f8f6' },
    { media: '(prefers-color-scheme: dark)', color: '#102216' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for Supabase and analytics */}
        <link rel="dns-prefetch" href="https://xyzsupabaseproject.supabase.co" />
        <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" as="image" href="/icon.svg" />
        
        {/* Prefetch important pages */}
        <link rel="prefetch" href="/dashboard" as="document" />
        <link rel="prefetch" href="/scan" as="document" />
        
        {/* Performance optimizations */}
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body className={`${manrope.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <BottomNavigation />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
