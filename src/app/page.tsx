import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Generate beautiful QR codes with custom colors and formats'
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">QR</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">QR Generator Web</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-medium">v1.0.0</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Generate Beautiful
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              QR Codes
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create custom QR codes with colors, formats, and download options. 
            Perfect for marketing, events, and personal use.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
              🎨 Custom Colors
            </span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
              📱 Multiple Formats
            </span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
              ⚡ Instant Download
            </span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
              🔧 High Quality
            </span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
              📊 SVG Support
            </span>
          </div>
        </div>

        {/* Status Card */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl">✓</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Batch 0 Setup Complete! 🎉
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Project foundation berhasil dibuat dengan Next.js 15, TypeScript, dan Tailwind CSS. 
                Siap untuk development batch selanjutnya.
              </p>
              
              {/* Tech Stack */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  Next.js 15
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  TypeScript
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  Tailwind CSS
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  QRCode.js
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  Canvas API
                </span>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">Server Status</div>
                  <div className="text-green-600 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Running
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">Build Status</div>
                  <div className="text-green-600 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Ready
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">Dependencies</div>
                  <div className="text-green-600 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Installed
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">
                  🚀 Next Steps
                </h4>
                <p className="text-blue-700 text-sm">
                  Ready untuk Batch 1: Project Setup & Core Foundation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fitur yang Akan Datang
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div className="text-3xl mb-4">🎨</div>
              <h4 className="font-bold text-gray-900 mb-2">Custom Colors</h4>
              <p className="text-gray-600 text-sm">Pilih warna foreground dan background sesuai brand</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div className="text-3xl mb-4">📊</div>
              <h4 className="font-bold text-gray-900 mb-2">Multiple Formats</h4>
              <p className="text-gray-600 text-sm">Export ke PNG, SVG, JPG dengan kualitas tinggi</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Real-time Preview</h4>
              <p className="text-gray-600 text-sm">Lihat hasil QR code secara langsung saat editing</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div className="text-3xl mb-4">🔧</div>
              <h4 className="font-bold text-gray-900 mb-2">Advanced Options</h4>
              <p className="text-gray-600 text-sm">Error correction, size options, dan mode generation</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">
            Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
          </p>
          <p className="text-sm opacity-75">
            QR Generator Web v1.0.0 - Batch 0 Complete
          </p>
        </div>
      </footer>
    </div>
  )
}