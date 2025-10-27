// src/app/components/Footer.tsx
'use client';

import Image from "next/image";

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/Ikrar06/qr-generator-web',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  }
];

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      {/* Main Footer Content */}
      <div className="container-tight py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src="/icon.png" 
                  alt="QR Generator Icon"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold">QR Generator</span>
            </div>
            
            <p className="text-gray-400 mb-4 leading-relaxed max-w-md">
              Create professional QR codes instantly. Free, secure, and always available.
            </p>

            {/* Key Features */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                Privacy First
              </span>
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                Always Free
              </span>
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                Open Source
              </span>
            </div>
          </div>

          {/* Right Section - Social Links & Quick Links */}
          <div className="md:text-right">
            {/* Social Links */}
            <div className="flex md:justify-end space-x-4 mb-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 
                           p-2 rounded-lg hover:bg-gray-800"
                  aria-label={`Follow us on ${item.name}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap md:justify-end gap-6 text-sm">
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#guide"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#guide')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Guide
              </a>
              
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-tight py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>© {currentYear} QR Generator. Made with care for developers.</p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500 max-w-2xl mx-auto">
              All QR code generation happens locally in your browser. Your data never leaves your device, 
              ensuring complete privacy and security.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}