import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Generate beautiful QR codes with custom colors and formats'
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">QR</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                QR Generator Web
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-500">v1.0.0</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Generate Beautiful
              <span className="text-gradient block mt-2">QR Codes</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Create custom QR codes with colors, formats, and download options. 
              Perfect for marketing, events, and personal use.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                '🎨 Custom Colors',
                '📱 Multiple Formats',
                '⚡ Instant Download',
                '🔧 High Quality',
                '📊 SVG Support'
              ].map((feature, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Status Card */}
          <div className="max-w-2xl mx-auto">
            <div className="card border border-gray-200 bg-white/70 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Batch 0 Setup Complete! 🎉
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Project foundation berhasil dibuat dengan Next.js 15, TypeScript, dan Tailwind CSS. 
                  Siap untuk development batch selanjutnya.
                </p>
                
                {/* Tech Stack Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {[
                    'Next.js 15',
                    'TypeScript',
                    'Tailwind CSS',
                    'QRCode.js',
                    'Canvas API'
                  ].map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Status Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-semibold text-gray-900">Server Status</div>
                    <div className="text-green-600 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Running
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-semibold text-gray-900">Build Status</div>
                    <div className="text-green-600 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Ready
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-semibold text-gray-900">Dependencies</div>
                    <div className="text-green-600 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Installed
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🚀 Next Steps</h4>
                  <p className="text-blue-700 text-sm">
                    Ready untuk Batch 1: Project Setup & Core Foundation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-12 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fitur yang Akan Datang
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🎨',
                title: 'Custom Colors',
                description: 'Pilih warna foreground dan background sesuai brand'
              },
              {
                icon: '📊',
                title: 'Multiple Formats',
                description: 'Export ke PNG, SVG, JPG dengan kualitas tinggi'
              },
              {
                icon: '⚡',
                title: 'Real-time Preview',
                description: 'Lihat hasil QR code secara langsung saat editing'
              },
              {
                icon: '🔧',
                title: 'Advanced Options',
                description: 'Error correction, size options, dan mode generation'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/60 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
            </p>
            <p className="text-sm">
              QR Generator Web v1.0.0 - Batch 0 Complete
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}