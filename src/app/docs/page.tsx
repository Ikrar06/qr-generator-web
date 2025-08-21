// src/app/docs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { QRMode, OutputFormat, ErrorCorrectionLevel } from '@/types/qr-types';

interface APITestResult {
  success: boolean;
  data?: any;
  error?: string;
}

export default function DocsPage() {
  const [testData, setTestData] = useState('https://example.com');
  const [testMode, setTestMode] = useState<QRMode>(QRMode.BASIC);
  const [testResult, setTestResult] = useState<APITestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('javascript');
  const [baseUrl, setBaseUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting and base URL
  useEffect(() => {
    setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    setMounted(true);
  }, []);

  const apiDocs = {
    title: "QR Generator API Documentation",
    version: "1.0.0",
    description: "Professional QR Code Generator API with multiple formats and customization options",
    baseUrl: mounted ? baseUrl : '[YOUR_BASE_URL]', // Fallback for SSR
    
    endpoints: {
      "POST /api/generate-qr": {
        description: "Generate QR Code",
        summary: "Create QR codes with various customization options"
      },
      "GET /api/generate-qr": {
        description: "Get API Information", 
        summary: "Retrieve basic API information and supported options"
      },
      "GET /api/health": {
        description: "Health Check",
        summary: "Check API service health and get system information"
      }
    },

    dataTypes: {
      TEXT: {
        description: "Plain text content",
        example: "Hello World!",
        maxLength: 4296
      },
      URL: {
        description: "Website URLs", 
        example: "https://example.com",
        validation: "Must start with http:// or https://"
      },
      EMAIL: {
        description: "Email addresses with optional subject and body",
        examples: [
          "hello@example.com",
          "mailto:hello@example.com",
          "mailto:hello@example.com?subject=Hello&body=Message"
        ]
      },
      PHONE: {
        description: "Phone numbers for one-tap calling",
        examples: [
          "+1234567890",
          "tel:+1234567890"
        ]
      },
      SMS: {
        description: "SMS messages with recipient",
        examples: [
          "sms:+1234567890",
          "sms:+1234567890:Hello from QR code!"
        ]
      },
      WIFI: {
        description: "WiFi network credentials",
        format: "WIFI:T:[WPA|WEP|nopass];S:[network name];P:[password];H:[hidden];;",
        examples: [
          "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;",
          "WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:true;;"
        ]
      }
    },

    outputFormats: {
      PNG: {
        description: "Portable Network Graphics - Best for web use",
        mimeType: "image/png",
        features: ["Transparency", "Lossless compression", "Wide compatibility"]
      },
      SVG: {
        description: "Scalable Vector Graphics - Perfect for print", 
        mimeType: "image/svg+xml",
        features: ["Infinite scalability", "Small file size", "Editable"]
      },
      JPEG: {
        description: "Joint Photographic Experts Group - Smallest file size",
        mimeType: "image/jpeg", 
        features: ["High compression", "Universal compatibility"],
        limitations: ["No transparency", "Lossy compression"]
      },
      WEBP: {
        description: "WebP - Modern web format",
        mimeType: "image/webp",
        features: ["Best compression", "Transparency support", "Modern browsers"]
      }
    },

    examples: {
      javascript: `// Basic QR code generation
const response = await fetch('/api/generate-qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: 'https://example.com',
    mode: 'basic'
  })
});

const result = await response.json();
if (result.success) {
  document.getElementById('qr-image').src = result.data;
}`,

      curl: `# Basic QR code generation
curl -X POST ${mounted ? baseUrl : '[YOUR_BASE_URL]'}/api/generate-qr \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": "https://example.com",
    "mode": "basic"
  }'`,

      python: `import requests

# Generate QR code
response = requests.post('${mounted ? baseUrl : '[YOUR_BASE_URL]'}/api/generate-qr', json={
    'data': 'https://example.com',
    'mode': 'basic'
})

if response.status_code == 200:
    result = response.json()
    print("QR generated:", result['data']['filename'])`
    }
  };

  const testAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: testData, 
          mode: testMode 
        })
      });
      
      const result = await response.json();
      setTestResult({ success: response.ok, data: result });
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Quick Navigation */}
      <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 hidden lg:block">
        <div className="space-y-2">
          <a href="#endpoints" className="block text-blue-600 hover:text-blue-800 transition-colors">API Endpoints</a>
          <a href="#data-types" className="block text-blue-600 hover:text-blue-800 transition-colors">Data Types</a>
          <a href="#formats" className="block text-blue-600 hover:text-blue-800 transition-colors">Output Formats</a>
          <a href="#examples" className="block text-blue-600 hover:text-blue-800 transition-colors">Code Examples</a>
          <a href="/api/docs?format=json" className="block text-blue-600 hover:text-blue-800 transition-colors">JSON API</a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-12 rounded-2xl">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{apiDocs.title}</h1>
          <p className="text-xl opacity-90 mb-4">{apiDocs.description}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Version {apiDocs.version}</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Base URL: {apiDocs.baseUrl}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 bg-gray-50 p-6 rounded-lg">
          <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Home</a>
          <a href="/api/health" className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Health Check</a>
          <a href="/api/generate-qr" className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">API Info</a>
          <a href="#quick-start" className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Quick Start</a>
        </div>

        {/* Quick Start */}
        <section id="quick-start" className="mb-16 bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-1 bg-blue-600 rounded mr-4"></span>
            Quick Start
          </h2>
          <p className="text-gray-600 mb-6">Generate a QR code with a simple POST request:</p>
          <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
            <code>{`curl -X POST ${baseUrl}/api/generate-qr \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": "https://example.com",
    "mode": "basic"
  }'`}</code>
          </pre>
        </section>

        {/* API Endpoints */}
        <section id="endpoints" className="mb-16 bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-1 bg-blue-600 rounded mr-4"></span>
            API Endpoints
          </h2>
          <div className="space-y-4">
            {Object.entries(apiDocs.endpoints).map(([endpoint, info]: [string, any]) => {
              const [method, path] = endpoint.split(' ');
              const methodColors = {
                POST: 'bg-green-500',
                GET: 'bg-blue-500', 
                PUT: 'bg-yellow-500',
                DELETE: 'bg-red-500'
              };
              
              return (
                <div key={endpoint} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <span className={`${methodColors[method as keyof typeof methodColors]} text-white px-3 py-1 rounded text-sm font-semibold mr-4`}>
                      {method}
                    </span>
                    <span className="font-mono text-lg font-semibold text-gray-700">{path}</span>
                  </div>
                  <div className="text-gray-600">
                    <div className="font-semibold">{info.description}</div>
                    <div className="text-sm">{info.summary}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Data Types */}
        <section id="data-types" className="mb-16 bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-1 bg-blue-600 rounded mr-4"></span>
            Supported Data Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(apiDocs.dataTypes).map(([type, info]: [string, any]) => (
              <div key={type} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-all hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">{type}</h3>
                <p className="text-gray-600 mb-4">{info.description}</p>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm text-gray-800">
                  {Array.isArray(info.examples) ? info.examples[0] : info.example}
                </div>
                {info.maxLength && (
                  <p className="text-xs text-gray-500 mt-2">Max length: {info.maxLength} characters</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Output Formats */}
        <section id="formats" className="mb-16 bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-1 bg-blue-600 rounded mr-4"></span>
            Output Formats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(apiDocs.outputFormats).map(([format, info]: [string, any]) => (
              <div key={format} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-all hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">{format}</h3>
                <p className="text-gray-600 mb-3">{info.description}</p>
                <div className="mb-3">
                  <span className="font-semibold">MIME Type:</span> 
                  <code className="bg-gray-100 px-2 py-1 rounded ml-2">{info.mimeType}</code>
                </div>
                <div className="mb-3">
                  <span className="font-semibold">Features:</span>
                  <ul className="list-disc list-inside text-gray-600 ml-4">
                    {info.features.map((feature: string) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                {info.limitations && (
                  <div>
                    <span className="font-semibold text-red-600">Limitations:</span>
                    <ul className="list-disc list-inside text-red-600 ml-4">
                      {info.limitations.map((limitation: string) => (
                        <li key={limitation}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Code Examples */}
        <section id="examples" className="mb-16 bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-1 bg-blue-600 rounded mr-4"></span>
            Code Examples
          </h2>
          
          <div className="flex space-x-2 mb-4 border-b">
            {['javascript', 'curl', 'python'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
            <pre><code>{apiDocs.examples[activeTab as keyof typeof apiDocs.examples]}</code></pre>
          </div>
        </section>

        {/* Live API Tester */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-1 bg-blue-600 rounded mr-4"></span>
            Live API Tester
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data to encode:</label>
              <input
                type="text"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode:</label>
              <select
                value={testMode}
                onChange={(e) => setTestMode(e.target.value as QRMode)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={QRMode.BASIC}>Basic</option>
                <option value={QRMode.COLORED}>Colored</option>
                <option value={QRMode.SVG}>SVG</option>
                <option value={QRMode.HIGH_QUALITY}>High Quality</option>
              </select>
            </div>
            
            <button
              onClick={testAPI}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test API'}
            </button>
            
            {testResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Result:</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                  <code>{JSON.stringify(testResult, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          <p className="text-gray-600">Last updated: {new Date().toISOString()}</p>
          <div className="mt-4 space-x-4">
            <a href="/api/docs?format=json" className="text-blue-600 hover:text-blue-800">View Raw JSON</a>
            <a href="/" className="text-blue-600 hover:text-blue-800">Back to Home</a>
          </div>
        </footer>
      </div>
    </div>
  );
}