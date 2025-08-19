import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'QR Generator Web',
    template: '%s | QR Generator Web'
  },
  description: 'Generate beautiful QR codes with custom colors, formats, and download options. Modern web application built with Next.js and TypeScript.',
  keywords: ['QR code', 'generator', 'custom', 'download', 'PNG', 'SVG', 'web app'],
  authors: [{ name: 'QR Generator Team' }],
  creator: 'QR Generator Web',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://qr-generator-web.vercel.app',
    title: 'QR Generator Web',
    description: 'Generate beautiful QR codes with custom colors and formats',
    siteName: 'QR Generator Web',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'QR Generator Web'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Generator Web',
    description: 'Generate beautiful QR codes with custom colors and formats',
    images: ['/og-image.jpg']
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen`}>
        <div id="root">
          {children}
        </div>
        {/* Toast Container - akan digunakan nanti untuk notifications */}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
      </body>
    </html>
  )
}