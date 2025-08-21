// src/app/error.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

interface ErrorDetails {
  code: string;
  title: string;
  description: string;
  suggestions: string[];
  showTechnicalDetails: boolean;
}

function getErrorDetails(error: Error): ErrorDetails {
  // Analyze error type and provide appropriate details
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      title: 'Connection Problem',
      description: 'Unable to connect to our servers. Please check your internet connection.',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again',
        'Check if you\'re behind a firewall'
      ],
      showTechnicalDetails: false
    };
  }
  
  if (message.includes('chunk') || message.includes('loading')) {
    return {
      code: 'CHUNK_LOAD_ERROR',
      title: 'Loading Failed',
      description: 'Some application resources failed to load properly.',
      suggestions: [
        'Refresh the page to reload resources',
        'Clear your browser cache',
        'Try using an incognito/private browsing window',
        'Update your browser to the latest version'
      ],
      showTechnicalDetails: false
    };
  }
  
  if (message.includes('qr') || message.includes('generation')) {
    return {
      code: 'QR_GENERATION_ERROR',
      title: 'QR Generation Failed',
      description: 'There was an error generating your QR code.',
      suggestions: [
        'Try reducing the amount of data',
        'Check that your input is valid',
        'Try a different generation mode',
        'Refresh the page and try again'
      ],
      showTechnicalDetails: true
    };
  }
  
  if (message.includes('canvas') || message.includes('image')) {
    return {
      code: 'CANVAS_ERROR',
      title: 'Image Processing Failed',
      description: 'There was an error processing the QR code image.',
      suggestions: [
        'Try using a different output format',
        'Reduce the QR code size',
        'Check browser compatibility',
        'Try refreshing the page'
      ],
      showTechnicalDetails: true
    };
  }
  
  if (message.includes('permission') || message.includes('denied')) {
    return {
      code: 'PERMISSION_ERROR',
      title: 'Permission Denied',
      description: 'The application doesn\'t have the necessary permissions to complete this action.',
      suggestions: [
        'Check browser permissions',
        'Allow clipboard access if copying QR codes',
        'Allow downloads if saving QR codes',
        'Try using a different browser'
      ],
      showTechnicalDetails: false
    };
  }
  
  if (message.includes('out of memory') || message.includes('memory')) {
    return {
      code: 'MEMORY_ERROR',
      title: 'Memory Error',
      description: 'Not enough memory available to complete this operation.',
      suggestions: [
        'Try generating a smaller QR code',
        'Close other browser tabs',
        'Restart your browser',
        'Try on a device with more memory'
      ],
      showTechnicalDetails: true
    };
  }
  
  // Generic error
  return {
    code: 'UNKNOWN_ERROR',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred while using the QR generator.',
    suggestions: [
      'Try refreshing the page',
      'Clear your browser cache and cookies',
      'Try using a different browser',
      'Contact support if the problem persists'
    ],
    showTechnicalDetails: true
  };
}

function ErrorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`text-red-500 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function HomeIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

export default function Error({ error, reset }: ErrorProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [errorId, setErrorId] = useState<string>('');
  
  const errorDetails = getErrorDetails(error);

  useEffect(() => {
    // Generate unique error ID for tracking
    const id = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setErrorId(id);
    
    // Log error for monitoring (in production, this would go to an error tracking service)
    console.error('Application Error:', {
      id,
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, Bugsnag, etc.
      // errorTrackingService.captureException(error, { extra: { id, digest: error.digest } });
    }
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleCopyErrorDetails = async () => {
    const details = `Error ID: ${errorId}
Error Code: ${errorDetails.code}
Message: ${error.message}
Digest: ${error.digest || 'N/A'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}`;

    try {
      await navigator.clipboard.writeText(details);
      if (typeof window !== 'undefined' && window.QRApp) {
        window.QRApp.showToast('Error details copied to clipboard', 'success');
      }
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <ErrorIcon className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {errorDetails.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
            {errorDetails.description}
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Error Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">What can you do?</h2>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                {errorDetails.code}
              </span>
            </div>

            {/* Suggestions */}
            <div className="mb-6">
              <ul className="space-y-3">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                variant="primary"
                onClick={reset}
                leftIcon={<RefreshIcon className="w-4 h-4" />}
                className="flex-1"
              >
                Try Again
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleReload}
                leftIcon={<RefreshIcon className="w-4 h-4" />}
                className="flex-1"
              >
                Reload Page
              </Button>
              
              <Button
                variant="outline"
                onClick={handleGoHome}
                leftIcon={<HomeIcon className="w-4 h-4" />}
                className="flex-1"
              >
                Go Home
              </Button>
            </div>

            {/* Technical Details Toggle */}
            {errorDetails.showTechnicalDetails && (
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 
                           flex items-center space-x-2"
                >
                  <span>Technical Details</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${
                      showTechnical ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showTechnical && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Error ID:</span>
                        <span className="font-mono text-gray-600">{errorId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Error Code:</span>
                        <span className="font-mono text-gray-600">{errorDetails.code}</span>
                      </div>
                      {error.digest && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Digest:</span>
                          <span className="font-mono text-gray-600">{error.digest}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <span className="font-medium text-gray-700">Message:</span>
                        <div className="mt-1 p-2 bg-white rounded border font-mono text-xs text-gray-800 break-all">
                          {error.message}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyErrorDetails}
                        className="w-full"
                      >
                        Copy Error Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 px-6 py-4 border-t">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Need More Help?</h3>
                <p className="text-sm text-blue-800 mb-2">
                  If this problem persists, you can contact our support team with the error ID above.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="/contact"
                    className="text-sm text-blue-700 hover:text-blue-800 underline"
                  >
                    Contact Support
                  </a>
                  <span className="hidden sm:inline text-blue-600">•</span>
                  <a
                    href="/help"
                    className="text-sm text-blue-700 hover:text-blue-800 underline"
                  >
                    Help Center
                  </a>
                  <span className="hidden sm:inline text-blue-600">•</span>
                  <a
                    href="https://github.com/qr-generator-web/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:text-blue-800 underline"
                  >
                    Report Bug
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Error occurred at {new Date().toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            QR Generator v1.0.0 • Error ID: {errorId}
          </p>
        </div>
      </div>
    </div>
  );
}