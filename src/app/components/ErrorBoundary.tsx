// src/app/components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number | boolean | null | undefined>;
}

// Internal error handler - moved inside the class to avoid prop serialization issues
const handleErrorInternal = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
  console.error('ErrorBoundary caught an error:', error);
  console.error('Error Info:', errorInfo);
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    try {
      // Google Analytics error tracking
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: true,
          error_id: errorId
        });
      }
      
      // Custom error reporting
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(reportingError => {
        console.error('Failed to report error:', reportingError);
      });
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError);
    }
  }
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Handle error internally instead of using prop
    handleErrorInternal(error, errorInfo, this.state.errorId);

    // Show toast notification
    if (typeof window !== 'undefined' && window.QRApp) {
      window.QRApp.showToast('An unexpected error occurred. Please try again.', 'error');
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error boundary when resetKeys change
    if (this.props.resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged && this.state.hasError) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: ''
        });
        this.retryCount = 0;
      }
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });

      // Show retry toast
      if (typeof window !== 'undefined' && window.QRApp) {
        window.QRApp.showToast(`Retrying... (${this.retryCount}/${this.maxRetries})`, 'info');
      }
    } else {
      // Max retries reached
      if (typeof window !== 'undefined' && window.QRApp) {
        window.QRApp.showToast('Maximum retry attempts reached. Please refresh the page.', 'error');
      }
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = `
Error ID: ${errorId}
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(errorDetails);
        if (typeof window !== 'undefined' && window.QRApp) {
          window.QRApp.showToast('Error details copied to clipboard', 'success');
        }
      }
    } catch (clipboardError) {
      console.error('Failed to copy error details:', clipboardError);
      if (typeof window !== 'undefined' && window.QRApp) {
        window.QRApp.showToast('Failed to copy error details', 'error');
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-red-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-red-800">Something went wrong</CardTitle>
                  <p className="text-sm text-red-600 mt-1">Error ID: {errorId}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
                <p className="text-red-700 text-sm font-mono">
                  {error?.message || 'An unexpected error occurred'}
                </p>
                {process.env.NODE_ENV === 'development' && error?.stack && (
                  <details className="mt-3">
                    <summary className="text-red-600 cursor-pointer text-sm font-medium">
                      Show Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-40 bg-red-100 p-2 rounded border">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Recovery Actions */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">What you can do:</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {canRetry && (
                    <Button
                      variant="primary"
                      onClick={this.handleRetry}
                      fullWidth
                    >
                      Try Again ({this.maxRetries - this.retryCount} attempts left)
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    onClick={this.handleReload}
                    fullWidth
                  >
                    Reload Page
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={this.copyErrorDetails}
                    fullWidth
                  >
                    Copy Error Details
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    fullWidth
                  >
                    Go to Home
                  </Button>
                </div>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Troubleshooting Tips</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Try using a different browser</li>
                  <li>• Disable browser extensions temporarily</li>
                  <li>• If the problem persists, contact support with the Error ID</li>
                </ul>
              </div>

              {/* Reset Button for Developers */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={this.handleReset}
                    size="sm"
                  >
                    Reset Error Boundary (Dev Only)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
interface UseErrorBoundaryReturn {
  showBoundary: (error: Error) => void;
  resetBoundary: () => void;
}

export function useErrorBoundary(): UseErrorBoundaryReturn {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const showBoundary = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetBoundary = React.useCallback(() => {
    setError(null);
  }, []);

  return { showBoundary, resetBoundary };
}

export default ErrorBoundary;