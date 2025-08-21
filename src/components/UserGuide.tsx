// src/components/UserGuide.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { QRDataType, QRMode, OutputFormat, ErrorCorrectionLevel } from '@/types/qr-types';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
  startWithSection?: string;
}

interface GuideSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: string;
}

function GuideSection({ id, title, children, icon }: GuideSectionProps) {
  return (
    <div id={id} className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <div className="prose prose-blue max-w-none">
        {children}
      </div>
    </div>
  );
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className = '' }: CodeBlockProps) {
  return (
    <div className={`bg-gray-100 rounded-lg p-3 font-mono text-sm overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}

interface FeatureGridProps {
  features: Array<{
    icon: string;
    title: string;
    description: string;
    highlight?: boolean;
  }>;
}

function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 my-6">
      {features.map((feature, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border ${
            feature.highlight 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{feature.icon}</span>
            <div>
              <h5 className="font-semibold text-gray-900 mb-1">{feature.title}</h5>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StepListProps {
  steps: Array<{
    number: number;
    title: string;
    description: string;
    tip?: string;
  }>;
}

function StepList({ steps }: StepListProps) {
  return (
    <div className="space-y-4 my-6">
      {steps.map((step) => (
        <div key={step.number} className="flex gap-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-blue-600">{step.number}</span>
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 mb-1">{step.title}</h5>
            <p className="text-gray-600 text-sm mb-2">{step.description}</p>
            {step.tip && (
              <div className="bg-yellow-50 border-l-4 border-yellow-300 p-3 text-sm">
                <strong className="text-yellow-800">Tip:</strong>
                <span className="text-yellow-700 ml-1">{step.tip}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserGuide({ isOpen, onClose, startWithSection }: UserGuideProps) {
  const [activeSection, setActiveSection] = useState(startWithSection || 'getting-started');

  if (!isOpen) return null;

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'data-types', title: 'Data Types', icon: '📝' },
    { id: 'modes', title: 'Generation Modes', icon: '🎨' },
    { id: 'customization', title: 'Customization', icon: '⚙️' },
    { id: 'formats', title: 'Download Formats', icon: '💾' },
    { id: 'best-practices', title: 'Best Practices', icon: '✨' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' },
    { id: 'advanced', title: 'Advanced Tips', icon: '🎯' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 
                 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-gray-200 
                   w-full max-w-6xl max-h-[90vh] overflow-hidden
                   animate-scale-in flex" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">User Guide</h3>
            <p className="text-sm text-gray-600 mt-1">Complete documentation</p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                               flex items-center gap-2 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span>{section.icon}</span>
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">QR Generator Guide</h2>
              <p className="text-gray-600">Everything you need to create perfect QR codes</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 
                         rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl">
              
              {/* Getting Started */}
              <GuideSection id="getting-started" title="Getting Started" icon="🚀">
                <p className="text-gray-600 mb-6">
                  Creating QR codes with our generator is simple and fast. Follow these basic steps to get started.
                </p>

                <StepList steps={[
                  {
                    number: 1,
                    title: "Choose Your Data Type",
                    description: "Select from URL, Text, Email, Phone, SMS, or WiFi from the dropdown menu.",
                    tip: "Different data types have specific formatting requirements for optimal scanning."
                  },
                  {
                    number: 2,
                    title: "Enter Your Content",
                    description: "Type or paste your content in the input field. Real-time validation will guide you.",
                    tip: "The generator provides immediate feedback on data validity and suggestions for improvement."
                  },
                  {
                    number: 3,
                    title: "Select Generation Mode",
                    description: "Choose from Basic, Colored, SVG, or High Quality modes based on your needs.",
                    tip: "Basic mode is fastest, while High Quality mode provides maximum error correction."
                  },
                  {
                    number: 4,
                    title: "Customize (Optional)",
                    description: "Adjust colors, size, and error correction level to match your requirements.",
                    tip: "High contrast between foreground and background colors ensures better scanability."
                  },
                  {
                    number: 5,
                    title: "Generate & Download",
                    description: "Click Generate to create your QR code, then download in your preferred format.",
                    tip: "PNG format works best for most applications, while SVG is perfect for printing."
                  }
                ]} />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Quick Start Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Start with a simple URL or text to get familiar with the interface</li>
                    <li>• Use the preview to verify your QR code before downloading</li>
                    <li>• Test your QR code with multiple devices and apps</li>
                    <li>• Save frequently used settings as templates for future use</li>
                  </ul>
                </div>
              </GuideSection>

              {/* Data Types */}
              <GuideSection id="data-types" title="Supported Data Types" icon="📝">
                <p className="text-gray-600 mb-6">
                  Our generator supports multiple data types, each with specific formatting and use cases.
                </p>

                <FeatureGrid features={[
                  {
                    icon: '🔗',
                    title: 'Website URL',
                    description: 'Direct users to websites. Supports HTTP and HTTPS protocols.',
                    highlight: true
                  },
                  {
                    icon: '📝',
                    title: 'Plain Text',
                    description: 'Any text content including messages, notes, or instructions.'
                  },
                  {
                    icon: '✉️',
                    title: 'Email Address',
                    description: 'Opens default email app with pre-filled recipient address.'
                  },
                  {
                    icon: '📞',
                    title: 'Phone Number',
                    description: 'Enables one-tap calling with formatted phone numbers.'
                  },
                  {
                    icon: '💬',
                    title: 'SMS Message',
                    description: 'Pre-fills SMS app with recipient number and message.'
                  },
                  {
                    icon: '📶',
                    title: 'WiFi Credentials',
                    description: 'Allows easy WiFi network connection with credentials.'
                  }
                ]} />

                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-gray-900">Data Type Examples:</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <strong className="text-gray-900">URL:</strong>
                      <CodeBlock>https://www.example.com</CodeBlock>
                    </div>
                    
                    <div>
                      <strong className="text-gray-900">Email:</strong>
                      <CodeBlock>hello@example.com</CodeBlock>
                    </div>
                    
                    <div>
                      <strong className="text-gray-900">Phone:</strong>
                      <CodeBlock>+1-234-567-8900</CodeBlock>
                    </div>
                    
                    <div>
                      <strong className="text-gray-900">SMS:</strong>
                      <CodeBlock>sms:+1234567890:Hello from QR code!</CodeBlock>
                    </div>
                    
                    <div>
                      <strong className="text-gray-900">WiFi:</strong>
                      <CodeBlock>WIFI:T:WPA;S:NetworkName;P:Password;;</CodeBlock>
                    </div>
                  </div>
                </div>
              </GuideSection>

              {/* Generation Modes */}
              <GuideSection id="modes" title="Generation Modes" icon="🎨">
                <p className="text-gray-600 mb-6">
                  Choose the right generation mode for your specific use case and quality requirements.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        Basic Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li>✓ Fastest generation</li>
                        <li>✓ Standard black and white</li>
                        <li>✓ Smallest file size</li>
                        <li>✓ Universal compatibility</li>
                        <li>• Best for: Quick generation, testing</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <span className="text-2xl">🎨</span>
                        Colored Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-blue-800">
                        <li>✓ Custom colors</li>
                        <li>✓ Brand matching</li>
                        <li>✓ Visual appeal</li>
                        <li>✓ Maintains scanability</li>
                        <li>• Best for: Branding, marketing materials</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📐</span>
                        SVG Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li>✓ Vector graphics</li>
                        <li>✓ Infinite scalability</li>
                        <li>✓ Perfect for print</li>
                        <li>✓ Small file size</li>
                        <li>• Best for: Professional printing, logos</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-900">
                        <span className="text-2xl">🏆</span>
                        High Quality
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-green-800">
                        <li>✓ Maximum error correction</li>
                        <li>✓ Damage resistance</li>
                        <li>✓ Professional quality</li>
                        <li>✓ Optimal scanning</li>
                        <li>• Best for: Important applications, outdoor use</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </GuideSection>

              {/* Customization Options */}
              <GuideSection id="customization" title="Customization Options" icon="⚙️">
                <p className="text-gray-600 mb-6">
                  Fine-tune your QR codes with advanced customization options for perfect results.
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Color Customization</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="text-sm space-y-2">
                        <li><strong>Foreground Color:</strong> The QR code pattern color (default: black)</li>
                        <li><strong>Background Color:</strong> The background color (default: white)</li>
                        <li><strong>Contrast Rule:</strong> Ensure high contrast for reliable scanning</li>
                        <li><strong>Color Picker:</strong> Use hex codes or visual picker for precise colors</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Size Settings</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="text-sm space-y-2">
                        <li><strong>Range:</strong> 128px to 1024px</li>
                        <li><strong>Recommended:</strong> 256px for digital use, 512px+ for print</li>
                        <li><strong>Scan Distance:</strong> Larger sizes scan from greater distances</li>
                        <li><strong>File Size:</strong> Larger sizes create bigger files</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Error Correction Levels</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-red-50 border border-red-200 p-3 rounded">
                        <strong className="text-red-800">Low (7%)</strong>
                        <p className="text-sm text-red-700 mt-1">Maximum data capacity, minimal protection</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <strong className="text-yellow-800">Medium (15%)</strong>
                        <p className="text-sm text-yellow-700 mt-1">Balanced capacity and protection</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <strong className="text-blue-800">Quartile (25%)</strong>
                        <p className="text-sm text-blue-700 mt-1">Good for print and outdoor use</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <strong className="text-green-800">High (30%)</strong>
                        <p className="text-sm text-green-700 mt-1">Maximum protection, reduced capacity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GuideSection>

              {/* Download Formats */}
              <GuideSection id="formats" title="Download Formats" icon="💾">
                <p className="text-gray-600 mb-6">
                  Choose the right file format for your intended use case and platform compatibility.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-900">
                        <span className="text-2xl">🖼️</span>
                        PNG Format
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="text-green-800">
                          <strong>Advantages:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Lossless compression</li>
                            <li>Transparency support</li>
                            <li>Excellent quality</li>
                            <li>Universal compatibility</li>
                          </ul>
                        </div>
                        <div className="text-green-700">
                          <strong>Best for:</strong> Web use, presentations, documents
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <span className="text-2xl">📐</span>
                        SVG Format
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="text-blue-800">
                          <strong>Advantages:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Infinite scalability</li>
                            <li>Small file size</li>
                            <li>Editable vectors</li>
                            <li>Perfect print quality</li>
                          </ul>
                        </div>
                        <div className="text-blue-700">
                          <strong>Best for:</strong> Print materials, logos, professional use
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🗜️</span>
                        JPG Format
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-800">
                          <strong>Advantages:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Smallest file size</li>
                            <li>Universal support</li>
                            <li>Fast loading</li>
                          </ul>
                          <strong>Limitations:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>No transparency</li>
                            <li>Lossy compression</li>
                          </ul>
                        </div>
                        <div className="text-gray-700">
                          <strong>Best for:</strong> Email, social media, bandwidth-limited use
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        WEBP Format
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-800">
                          <strong>Advantages:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Superior compression</li>
                            <li>Transparency support</li>
                            <li>Modern standard</li>
                          </ul>
                          <strong>Limitations:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Limited older browser support</li>
                          </ul>
                        </div>
                        <div className="text-gray-700">
                          <strong>Best for:</strong> Modern web applications, mobile apps
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </GuideSection>

              {/* Best Practices */}
              <GuideSection id="best-practices" title="Best Practices" icon="✨">
                <p className="text-gray-600 mb-6">
                  Follow these guidelines to create QR codes that scan reliably and provide great user experience.
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">Do These Things</h4>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• <strong>Test thoroughly:</strong> Scan with multiple devices and apps before publishing</li>
                        <li>• <strong>Use high contrast:</strong> Dark foreground on light background works best</li>
                        <li>• <strong>Provide quiet space:</strong> Leave empty space around the QR code</li>
                        <li>• <strong>Choose appropriate size:</strong> Bigger is better for distant scanning</li>
                        <li>• <strong>Consider viewing distance:</strong> Match size to expected scan distance</li>
                        <li>• <strong>Use higher error correction:</strong> For outdoor or printed applications</li>
                        <li>• <strong>Keep URLs short:</strong> Reduces complexity and improves scanning</li>
                        <li>• <strong>Provide context:</strong> Tell users what the QR code does</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">Avoid These Mistakes</h4>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <ul className="space-y-2 text-sm text-red-800">
                        <li>• <strong>Don't make them too small:</strong> Minimum 2cm for print, 100px for digital</li>
                        <li>• <strong>Don't use poor contrast:</strong> Avoid similar colors or low contrast</li>
                        <li>• <strong>Don't distort the image:</strong> Keep square proportions always</li>
                        <li>• <strong>Don't use busy backgrounds:</strong> Plain backgrounds scan better</li>
                        <li>• <strong>Don't forget to test:</strong> Always verify before distributing</li>
                        <li>• <strong>Don't overload with data:</strong> Keep content concise when possible</li>
                        <li>• <strong>Don't ignore error correction:</strong> Higher levels help damaged codes</li>
                        <li>• <strong>Don't place on curved surfaces:</strong> Flat placement scans better</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-600 mb-3">Size Guidelines</h4>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong className="text-blue-900">Digital Use</strong>
                          <ul className="text-blue-800 mt-2 space-y-1">
                            <li>• Minimum: 100px</li>
                            <li>• Recommended: 200-300px</li>
                            <li>• Mobile: 150px+</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-blue-900">Print Materials</strong>
                          <ul className="text-blue-800 mt-2 space-y-1">
                            <li>• Business card: 1cm</li>
                            <li>• Flyer/poster: 2-3cm</li>
                            <li>• Billboard: 50cm+</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-blue-900">Scan Distance</strong>
                          <ul className="text-blue-800 mt-2 space-y-1">
                            <li>• Close (arm's length): 1-2cm</li>
                            <li>• Medium (1-2 meters): 5-10cm</li>
                            <li>• Far (3+ meters): 20cm+</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GuideSection>

              {/* Troubleshooting */}
              <GuideSection id="troubleshooting" title="Troubleshooting" icon="🔧">
                <p className="text-gray-600 mb-6">
                  Common issues and their solutions to ensure your QR codes work perfectly.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      problem: "QR code won't scan",
                      icon: "📱",
                      solutions: [
                        "Increase the size of the QR code",
                        "Improve contrast between foreground and background",
                        "Use higher error correction level",
                        "Ensure the code is not distorted or stretched",
                        "Clean the camera lens and ensure good lighting",
                        "Try a different QR code scanner app"
                      ],
                      tips: "Most scanning issues are related to size, contrast, or image quality."
                    },
                    {
                      problem: "Generated file is too large",
                      icon: "💾",
                      solutions: [
                        "Switch to JPG format for smaller files",
                        "Reduce the QR code size",
                        "Use SVG format for scalable vector graphics",
                        "Compress the image after download"
                      ],
                      tips: "SVG files are often smaller than bitmap images for simple QR codes."
                    },
                    {
                      problem: "Colors look wrong when printed",
                      icon: "🎨",
                      solutions: [
                        "Test print with basic black and white first",
                        "Ensure sufficient contrast (minimum 70%)",
                        "Use CMYK color mode for professional printing",
                        "Avoid very light colors for the QR pattern"
                      ],
                      tips: "What looks good on screen may not print well. Always test print first."
                    },
                    {
                      problem: "QR code works sometimes but not always",
                      icon: "⚠️",
                      solutions: [
                        "Increase error correction to High level",
                        "Make the QR code larger",
                        "Ensure consistent lighting when scanning",
                        "Check if the surface is flat and clean"
                      ],
                      tips: "Inconsistent scanning usually indicates environmental factors or low error correction."
                    },
                    {
                      problem: "WiFi QR code not connecting automatically",
                      icon: "📶",
                      solutions: [
                        "Verify the WiFi format: WIFI:T:WPA;S:NetworkName;P:Password;;",
                        "Check that network name and password are correct",
                        "Ensure the device supports WiFi QR codes",
                        "Try manually connecting first to verify credentials"
                      ],
                      tips: "Not all devices support automatic WiFi connection via QR codes."
                    },
                    {
                      problem: "Email or phone QR codes not working",
                      icon: "📧",
                      solutions: [
                        "Use proper formatting (mailto: for email, tel: for phone)",
                        "Test with different apps and devices",
                        "Ensure the default app is set correctly",
                        "Try with international format for phone numbers (+country code)"
                      ],
                      tips: "Different devices handle contact information differently."
                    }
                  ].map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{item.problem}</h5>
                          <p className="text-xs text-gray-500 mt-1">{item.tips}</p>
                        </div>
                      </div>
                      
                      <div className="ml-11">
                        <h6 className="font-medium text-gray-800 mb-2">Solutions:</h6>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {item.solutions.map((solution, sIndex) => (
                            <li key={sIndex} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-yellow-900 mb-2">Still Having Issues?</h4>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <p>If you're still experiencing problems:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Try generating a simple text QR code to test basic functionality</li>
                      <li>Test with multiple QR scanner apps on different devices</li>
                      <li>Check our FAQ section for more specific issues</li>
                      <li>Ensure you're using a recent version of your scanning app</li>
                    </ul>
                  </div>
                </div>
              </GuideSection>

              {/* Advanced Tips */}
              <GuideSection id="advanced" title="Advanced Tips & Tricks" icon="🎯">
                <p className="text-gray-600 mb-6">
                  Professional tips for creating exceptional QR codes and maximizing their effectiveness.
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Design Integration</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <ul className="text-sm space-y-2 text-blue-900">
                        <li>• <strong>Brand Colors:</strong> Use your brand colors but maintain 70%+ contrast</li>
                        <li>• <strong>Logo Integration:</strong> Reserve center space for small logos (use high error correction)</li>
                        <li>• <strong>Frame Design:</strong> Add branded frames around QR codes for context</li>
                        <li>• <strong>Call to Action:</strong> Include text like "Scan to visit website" or "Scan for WiFi"</li>
                        <li>• <strong>Size Hierarchy:</strong> Make QR codes prominent but not overwhelming in design</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Analytics & Tracking</h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <ul className="text-sm space-y-2 text-green-900">
                        <li>• <strong>URL Shorteners:</strong> Use services like bit.ly or tinyurl.com for tracking</li>
                        <li>• <strong>UTM Parameters:</strong> Add tracking codes to URLs for Google Analytics</li>
                        <li>• <strong>Custom Domains:</strong> Use your own short domain for brand consistency</li>
                        <li>• <strong>A/B Testing:</strong> Test different QR designs and placements</li>
                        <li>• <strong>Performance Metrics:</strong> Monitor scan rates, conversion rates, and user behavior</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Production Guidelines</h4>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <ul className="text-sm space-y-2 text-purple-900">
                        <li>• <strong>Print Resolution:</strong> Minimum 300 DPI for professional printing</li>
                        <li>• <strong>Material Testing:</strong> Test on actual materials before mass production</li>
                        <li>• <strong>Environmental Factors:</strong> Consider lighting, viewing angles, and wear</li>
                        <li>• <strong>Batch Testing:</strong> Verify random samples from print batches</li>
                        <li>• <strong>Backup Plans:</strong> Always include alternative access methods</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Advanced Use Cases</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Marketing Campaigns</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Event check-ins and registration</li>
                          <li>• Product information and reviews</li>
                          <li>• Social media engagement</li>
                          <li>• Contest entries and promotions</li>
                          <li>• Customer feedback collection</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Business Applications</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Digital business cards (vCard)</li>
                          <li>• Invoice and payment processing</li>
                          <li>• Inventory and asset tracking</li>
                          <li>• Document authentication</li>
                          <li>• Access control and security</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Educational Uses</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Assignment submissions</li>
                          <li>• Resource sharing</li>
                          <li>• Interactive learning materials</li>
                          <li>• Student attendance tracking</li>
                          <li>• Virtual field trips</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Personal Projects</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Wedding and event planning</li>
                          <li>• Home automation control</li>
                          <li>• Recipe and instruction sharing</li>
                          <li>• Emergency contact information</li>
                          <li>• Personal portfolio access</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Performance Optimization</h4>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <ul className="text-sm space-y-2 text-yellow-900">
                        <li>• <strong>Content Optimization:</strong> Keep URLs short and data concise</li>
                        <li>• <strong>Error Correction Balance:</strong> Higher isn't always better - consider data vs. protection</li>
                        <li>• <strong>Format Selection:</strong> Choose formats based on final use case</li>
                        <li>• <strong>Caching Strategy:</strong> Use CDNs for frequently accessed QR codes</li>
                        <li>• <strong>Mobile Optimization:</strong> Test extensively on mobile devices</li>
                        <li>• <strong>Accessibility:</strong> Provide alternative access methods for users with disabilities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg mt-8">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🎓</span>
                    <div>
                      <h4 className="font-bold text-xl mb-2">Congratulations!</h4>
                      <p className="text-blue-100 mb-4">
                        You now have all the knowledge needed to create professional, effective QR codes. 
                        Remember to always test your codes before deployment and consider your users' experience.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              document.getElementById('qr-generator')?.scrollIntoView({ 
                                behavior: 'smooth' 
                              });
                            }, 100);
                          }}
                        >
                          Start Creating QR Codes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </GuideSection>
              
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Need more help? Check our FAQ or contact support.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      document.getElementById('features')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }, 100);
                  }}
                >
                  View Features
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      document.getElementById('qr-generator')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }, 100);
                  }}
                >
                  Start Creating
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}