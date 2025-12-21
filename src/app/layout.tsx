import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'QR Generator',
    template: '%s | QR Generator'
  },
  description: 'Generate high-quality QR codes instantly. Support for URLs, text, emails, and more with custom colors and multiple export formats. Fast, reliable, and free QR code generator.',
  keywords: [
    'QR code generator',
    'custom QR codes',
    'QR maker',
    'generate QR',
    'QR code download',
    'free QR generator',
    'professional QR codes',
    'QR code creator',
    'custom QR colors',
    'QR code PNG SVG'
  ],
  authors: [{ name: 'QR Generator Team' }],
  creator: 'QR Generator',
  publisher: 'QR Generator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'QR Generator',
    description: 'Generate high-quality QR codes instantly. Support for URLs, text, emails, and more with custom colors and multiple export formats.',
    siteName: 'QR Generator',
    // Remove problematic image reference
    // images: [
    //   {
    //     url: '/images/og-image.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'QR Generator - Professional QR Code Creation Tool',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Generator',
    description: 'Generate high-quality QR codes instantly. Support for URLs, text, emails, and more with custom colors and multiple export formats.',
    // Remove problematic image reference
    // images: ['/images/twitter-image.png'],
    creator: '@qrgenerator',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
  category: 'technology',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' },
  ],
  colorScheme: 'light',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Remove problematic preload that's causing 404 */}
        {/* <link
          rel="preload"
          href="/images/hero-bg.webp"
          as="image"
          type="image/webp"
        /> */}
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Favicon and app icons matching your manifest */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        
        {/* Performance optimizations */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'QR Generator',
              description: 'Professional QR code generation service',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              // Remove problematic logo reference
              // logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/images/logo.png`,
              sameAs: [
                'https://github.com/Ikrar06/qr-generator-web',
              ],
            }),
          }}
        />
        
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'QR Generator',
              description: 'Generate high-quality QR codes for URLs, text, emails, and more',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Any',
              permissions: 'No special permissions required',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Multiple QR code formats (PNG, SVG, JPG, WEBP)',
                'Custom colors and styling',
                'High-quality output',
                'Multiple data types support',
                'Instant download',
                'No registration required'
              ],
            }),
          }}
        />
      </head>
      <body className={`font-sans antialiased min-h-screen bg-gray-50 ${inter.className}`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 
                     bg-blue-600 text-white px-4 py-2 rounded-md z-50 
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>

        {/* Progress bar for page transitions */}
        <div id="progress-bar" className="fixed top-0 left-0 w-full h-1 z-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: '0%' }}
          />
        </div>

        {/* Main application content wrapped with Error Boundary */}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>

        {/* Toast notification container */}
        <div
          id="toast-container"
          className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
          aria-live="polite"
          aria-label="Notifications"
        />

        {/* Loading overlay for global loading states */}
        <div
          id="global-loading"
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 
                     hidden items-center justify-center transition-all duration-300"
          aria-hidden="true"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Processing...</p>
          </div>
        </div>

        {/* Vercel Analytics - Only loads in production */}
        <Analytics />

        {/* Simplified QRApp utilities script - remove problematic service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // QRApp utilities for development
              window.QRApp = {
                showLoading: function(message = 'Processing...') {
                  const loading = document.getElementById('global-loading');
                  if (loading) {
                    const text = loading.querySelector('p');
                    if (text) text.textContent = message;
                    loading.classList.remove('hidden');
                    loading.classList.add('flex');
                    loading.setAttribute('aria-hidden', 'false');
                  }
                },
                
                hideLoading: function() {
                  const loading = document.getElementById('global-loading');
                  if (loading) {
                    loading.classList.add('hidden');
                    loading.classList.remove('flex');
                    loading.setAttribute('aria-hidden', 'true');
                  }
                },
                
                setProgress: function(percent) {
                  const bar = document.querySelector('#progress-bar div');
                  if (bar) bar.style.width = Math.min(100, Math.max(0, percent)) + '%';
                },
                
                showToast: function(message, type = 'info') {
                  try {
                    const container = document.getElementById('toast-container');
                    if (!container) return;
                    
                    const toast = document.createElement('div');
                    const typeClasses = {
                      info: 'bg-blue-50 text-blue-800 border-blue-200',
                      success: 'bg-green-50 text-green-800 border-green-200', 
                      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                      error: 'bg-red-50 text-red-800 border-red-200'
                    };
                    
                    toast.className = 'pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-sm font-medium max-w-sm transform transition-all duration-300 ease-out translate-x-full opacity-0 ' + (typeClasses[type] || typeClasses.info);
                    
                    const messageEl = document.createElement('p');
                    messageEl.textContent = message;
                    toast.appendChild(messageEl);
                    
                    container.appendChild(toast);
                    
                    requestAnimationFrame(() => {
                      toast.style.transform = 'translateX(0)';
                      toast.style.opacity = '1';
                    });
                    
                    setTimeout(() => {
                      toast.style.transform = 'translateX(100%)';
                      toast.style.opacity = '0';
                      setTimeout(() => {
                        if (container.contains(toast)) {
                          container.removeChild(toast);
                        }
                      }, 300);
                    }, 5000);
                  } catch (error) {
                    console.error('Toast notification error:', error);
                  }
                },
                
                markStart: function(name) {
                  if (window.performance?.mark) {
                    try {
                      performance.mark(name + '-start');
                    } catch (e) {
                      console.warn('Performance mark failed:', e);
                    }
                  }
                },
                
                markEnd: function(name) {
                  if (window.performance?.mark && performance.measure) {
                    try {
                      performance.mark(name + '-end');
                      performance.measure(name, name + '-start', name + '-end');
                    } catch (e) {
                      console.warn('Performance measure failed:', e);
                    }
                  }
                },
                
                analytics: {
                  track: function(event, properties) {
                    try {
                      if (typeof window !== 'undefined' && window.va) {
                        window.va('track', event, properties);
                      }
                      console.log('Analytics Event:', event, properties);
                    } catch (error) {
                      console.error('Analytics tracking error:', error);
                    }
                  }
                },

                reportError: function(error, context = {}) {
                  try {
                    const errorData = {
                      message: error.message || String(error),
                      stack: error.stack,
                      timestamp: new Date().toISOString(),
                      url: window.location.href,
                      userAgent: navigator.userAgent,
                      context
                    };
                    
                    this.analytics.track('error_occurred', errorData);
                    console.error('QRApp Error:', errorData);
                  } catch (reportingError) {
                    console.error('Error reporting failed:', reportingError);
                  }
                }
              };
            `,
          }}
        />
      </body>
    </html>
  );
}