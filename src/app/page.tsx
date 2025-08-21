// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import UserGuide from '../components/UserGuide';
import { LoadingSpinner, LoadingStates } from './components/LoadingSpinner';
import { useErrorBoundary } from './components/ErrorBoundary';
import {
  QRDataInput,
  ModeSelector,
  ColorPicker,
  QRPreview,
  DownloadButton,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button
} from '@/components';
import { useQRGenerator, useQRForm } from '@/hooks/useQRGenerator';
import { QRMode, OutputFormat, ErrorCorrectionLevel, QRDataType } from '@/types/qr-types';
import { analytics } from '@/lib/analytics';
import { handleError, ErrorContext } from '@/lib/error-handling';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card text-center group">
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

interface StatsItemProps {
  value: string;
  label: string;
}

function StatsItem({ value, label }: StatsItemProps) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
        {value}
      </div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [currentDataType, setCurrentDataType] = useState<QRDataType>(QRDataType.TEXT);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Error boundary hook for programmatic error handling
  const { showBoundary } = useErrorBoundary();

  // Initialize QR generation hooks
  const qrGenerator = useQRGenerator();
  const qrForm = useQRForm();

  // Handle client-side mounting with proper error handling
  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsClient(true);
        
        // Track page view
        analytics.trackInteraction('page_viewed', {
          page: 'home',
          timestamp: Date.now(),
          referrer: typeof document !== 'undefined' ? document.referrer : null
        });
        
        // Performance marking
        if (typeof window !== 'undefined' && window.QRApp) {
          window.QRApp.markStart('page-load');
        }

        // Simulate initial loading for better UX
        setTimeout(() => {
          setIsPageLoading(false);
          if (typeof window !== 'undefined' && window.QRApp) {
            window.QRApp.markEnd('page-load');
          }
        }, 500);
        
      } catch (error) {
        console.error('Page initialization error:', error);
        analytics.trackError(error as Error, { context: 'page_initialization' });
        setIsPageLoading(false);
      }
    };

    initializePage();

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && window.QRApp) {
        window.QRApp.markEnd('page-load');
      }
    };
  }, []);

  // Handle QR generation with comprehensive error handling
  const handleGenerate = useCallback(async () => {
    if (!qrForm.validateForm()) {
      analytics.trackInteraction('validation_error', {
        formData: qrForm.formData,
        errors: qrForm.formErrors || {}
      });
      return;
    }

    try {
      // Show loading state
      if (typeof window !== 'undefined' && window.QRApp?.showLoading) {
        window.QRApp.showLoading('Generating QR Code...');
        window.QRApp.markStart('qr-generation');
      }

      const startTime = Date.now();
      const result = await qrGenerator.generate(qrForm.formData);
      const duration = Date.now() - startTime;

      // Track successful generation
      analytics.trackQRGeneration(qrForm.formData, result, duration);
      
      // Performance tracking
      if (typeof window !== 'undefined' && window.QRApp?.hideLoading) {
        window.QRApp.markEnd('qr-generation');
        window.QRApp.hideLoading();
      }

      // Show success toast
      if (typeof window !== 'undefined' && window.QRApp?.showToast) {
        window.QRApp.showToast('QR code generated successfully!', 'success');
      }

    } catch (error) {
      console.error('Generation failed:', error);
      
      // Create proper error context
      const errorContext: ErrorContext = {
        component: 'HomePage',
        function: 'handleGenerate',
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        additionalData: {
          formData: qrForm.formData,
          currentDataType
        }
      };

      // Handle error with centralized error handling
      const errorInfo = await handleError(error as Error, errorContext);

      // Track error in analytics
      analytics.trackError(error as Error, {
        context: 'qr_generation',
        formData: qrForm.formData,
        errorId: errorInfo.id
      });

      // Hide loading state
      if (typeof window !== 'undefined' && window.QRApp?.hideLoading) {
        window.QRApp.hideLoading();
      }

      // Show error toast
      if (typeof window !== 'undefined' && window.QRApp?.showToast) {
        window.QRApp.showToast(
          errorInfo.userMessage || 'Failed to generate QR code. Please try again.',
          'error'
        );
      }

      // For critical errors, trigger error boundary
      if (errorInfo.severity === 'critical') {
        showBoundary(error as Error);
      }
    }
  }, [qrForm, qrGenerator, currentDataType, showBoundary]);

  // Handle download with error handling
  const handleDownload = useCallback(async (format: OutputFormat) => {
    if (!qrGenerator.state.currentQR) {
      analytics.trackInteraction('download_error', {
        reason: 'no_qr_available',
        requestedFormat: format
      });
      return;
    }

    try {
      // Show loading indicator
      if (typeof window !== 'undefined' && window.QRApp?.showLoading) {
        window.QRApp.showLoading('Preparing download...');
      }

      const filename = qrForm.formData.filename || `qr-code.${format.toLowerCase()}`;
      await qrGenerator.download(qrGenerator.state.currentQR, { 
        format,
        filename
      });
      
      // Track successful download
      analytics.trackQRDownload(qrGenerator.state.currentQR, format);
      
      if (typeof window !== 'undefined' && window.QRApp?.hideLoading) {
        window.QRApp.hideLoading();
        if (window.QRApp?.showToast) {
          window.QRApp.showToast(`Downloaded: ${filename}`, 'success');
        }
      }

    } catch (error) {
      console.error('Download failed:', error);
      
      // Create proper error context
      const errorContext: ErrorContext = {
        component: 'HomePage',
        function: 'handleDownload',
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        additionalData: {
          format,
          qrData: qrGenerator.state.currentQR
        }
      };

      // Handle download error
      const errorInfo = await handleError(error as Error, errorContext);

      analytics.trackError(error as Error, {
        context: 'qr_download',
        format,
        errorId: errorInfo.id
      });
      
      if (typeof window !== 'undefined' && window.QRApp?.hideLoading) {
        window.QRApp.hideLoading();
        if (window.QRApp?.showToast) {
          window.QRApp.showToast(
            errorInfo.userMessage || 'Download failed. Please try again.',
            'error'
          );
        }
      }
    }
  }, [qrGenerator, qrForm]);

  // Clear form and generated QR
  const handleClear = useCallback(() => {
    try {
      qrForm.resetForm();
      qrGenerator.clear();
      setCurrentDataType(QRDataType.TEXT);
      
      // Track clear action
      analytics.trackInteraction('form_cleared', {
        timestamp: Date.now()
      });
      
      if (typeof window !== 'undefined' && window.QRApp?.showToast) {
        window.QRApp.showToast('Form cleared successfully', 'info');
      }
    } catch (error) {
      console.error('Clear operation failed:', error);
      analytics.trackError(error as Error, { context: 'form_clear' });
    }
  }, [qrForm, qrGenerator]);

  // Handle data type change with analytics
  const handleDataTypeChange = useCallback((type: QRDataType) => {
    setCurrentDataType(type);
    
    // Track data type change
    analytics.trackInteraction('data_type_changed', {
      previousType: currentDataType,
      newType: type,
      timestamp: Date.now()
    });
  }, [currentDataType]);

  // Handle user guide modal
  const handleShowUserGuide = useCallback(() => {
    setShowUserGuide(true);
    analytics.trackInteraction('help_accessed', {
      source: 'main_page',
      timestamp: Date.now()
    });
  }, []);

  const handleCloseUserGuide = useCallback(() => {
    setShowUserGuide(false);
    analytics.trackInteraction('help_closed', {
      timestamp: Date.now()
    });
  }, []);

  const stats = qrGenerator.getStats();

  // Show page loading state
  if (isPageLoading) {
    return <LoadingStates.PageLoading message="Initializing QR Generator..." />;
  }

  return (
    <>
      <Header />
      
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 md:py-24">
          <div className="container-tight">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Create Professional
                <span className="text-gradient block">QR Codes</span>
                in Seconds
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Generate high-quality QR codes for URLs, text, emails, phone numbers, WiFi, and more. 
                Choose from multiple formats, customize colors, and download instantly.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-8">
                <StatsItem value="6" label="Data Types" />
                <StatsItem value="4" label="Output Formats" />
                <StatsItem value="Free" label="Always Free" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => {
                    document.getElementById('qr-generator')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                    analytics.trackInteraction('cta_start_creating', {
                      source: 'hero_section'
                    });
                  }}
                >
                  Start Creating
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleShowUserGuide}
                >
                  View Guide
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="container-tight">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Powerful features to create exactly the QR code you need
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon="📝"
                title="Multiple Data Types"
                description="Support for URLs, text, emails, phone numbers, SMS, and WiFi credentials"
              />
              <FeatureCard
                icon="🎨"
                title="Custom Colors"
                description="Choose any foreground and background colors to match your brand"
              />
              <FeatureCard
                icon="📱"
                title="Multiple Formats"
                description="Export as PNG, SVG, JPG, or WEBP with high quality output"
              />
              <FeatureCard
                icon="⚡"
                title="Instant Generation"
                description="Generate QR codes instantly with real-time preview"
              />
              <FeatureCard
                icon="🔒"
                title="Privacy Focused"
                description="All processing happens locally. Your data never leaves your device"
              />
              <FeatureCard
                icon="📊"
                title="Error Correction"
                description="Multiple error correction levels for durability and reliability"
              />
              <FeatureCard
                icon="🎯"
                title="High Quality"
                description="Professional-grade QR codes suitable for print and digital use"
              />
              <FeatureCard
                icon="🆓"
                title="Always Free"
                description="Unlimited QR code generation with no registration required"
              />
            </div>
          </div>
        </section>

        {/* Main QR Generator Section */}
        <section id="qr-generator" className="py-16 bg-gray-50">
          <div className="container-tight">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                QR Code Generator
              </h2>
              <p className="text-gray-600">
                Create your QR code in just a few simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Input and Options */}
              <div className="space-y-6">
                {/* Data Input */}
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Enter Your Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QRDataInput
                      value={qrForm.formData.data}
                      onChange={(value) => qrForm.updateField('data', value)}
                      dataType={currentDataType}
                      onDataTypeChange={handleDataTypeChange}
                      onValidationChange={(result) => {
                        // Handle validation result
                        console.log('Validation result:', result);
                      }}
                      disabled={qrGenerator.isGenerating}
                      loading={qrGenerator.isGenerating}
                    />
                  </CardContent>
                </Card>

                {/* Mode Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Choose Generation Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModeSelector
                      selectedMode={qrForm.formData.mode}
                      onModeChange={(mode) => {
                        qrForm.updateField('mode', mode);
                        analytics.trackInteraction('mode_changed', {
                          previousMode: qrForm.formData.mode,
                          newMode: mode
                        });
                      }}
                      disabled={qrGenerator.isGenerating}
                    />
                  </CardContent>
                </Card>

                {/* Color Customization */}
                {(qrForm.formData.mode === QRMode.COLORED || 
                  qrForm.formData.mode === QRMode.HIGH_QUALITY) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 3: Customize Colors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ColorPicker
                        foregroundColor={qrForm.formData.options?.color?.dark || '#000000'}
                        backgroundColor={qrForm.formData.options?.color?.light || '#ffffff'}
                        onForegroundChange={(color) => {
                          qrForm.updateColor('dark', color);
                          analytics.trackInteraction('color_changed', {
                            colorType: 'foreground',
                            color
                          });
                        }}
                        onBackgroundChange={(color) => {
                          qrForm.updateColor('light', color);
                          analytics.trackInteraction('color_changed', {
                            colorType: 'background',
                            color
                          });
                        }}
                        disabled={qrGenerator.isGenerating}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Size Control */}
                    <div>
                      <label className="form-label">
                        Size: {qrForm.formData.options?.width || 256}px
                      </label>
                      <input
                        type="range"
                        min="128"
                        max="1024"
                        step="32"
                        value={qrForm.formData.options?.width || 256}
                        onChange={(e) => {
                          const size = parseInt(e.target.value);
                          qrForm.updateOption('width', size);
                          qrForm.updateOption('height', size);
                          analytics.trackInteraction('size_changed', { size });
                        }}
                        className="w-full mt-2"
                        disabled={qrGenerator.isGenerating}
                      />
                    </div>

                    {/* Error Correction Level */}
                    <div>
                      <label className="form-label">Error Correction</label>
                      <select
                        value={qrForm.formData.options?.errorCorrectionLevel || ErrorCorrectionLevel.MEDIUM}
                        onChange={(e) => {
                          const level = e.target.value as ErrorCorrectionLevel;
                          qrForm.updateOption('errorCorrectionLevel', level);
                          analytics.trackInteraction('error_correction_changed', { level });
                        }}
                        className="input-primary mt-2"
                        disabled={qrGenerator.isGenerating}
                      >
                        <option value={ErrorCorrectionLevel.LOW}>Low (~7%) - More data capacity</option>
                        <option value={ErrorCorrectionLevel.MEDIUM}>Medium (~15%) - Balanced</option>
                        <option value={ErrorCorrectionLevel.QUARTILE}>Quartile (~25%) - Good for print</option>
                        <option value={ErrorCorrectionLevel.HIGH}>High (~30%) - Maximum durability</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleGenerate}
                    loading={qrGenerator.isGenerating}
                    disabled={!qrForm.formData.data.trim() || !qrForm.isValid}
                  >
                    {qrGenerator.isGenerating ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleClear}
                    disabled={qrGenerator.isGenerating}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Right Column - Preview and Download */}
              <div className="space-y-6">
                {/* QR Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {qrGenerator.isGenerating ? (
                      <LoadingStates.QRGenerationLoading />
                    ) : (
                      <QRPreview
                        qrData={qrGenerator.state.currentQR}
                        loading={qrGenerator.isGenerating}
                        error={qrGenerator.state.error}
                        showMetadata={true}
                        allowZoom={true}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Download Options */}
                {qrGenerator.state.currentQR && qrGenerator.state.currentQR.success && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Download</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {qrGenerator.isDownloading ? (
                        <LoadingStates.DownloadLoading />
                      ) : (
                        <DownloadButton
                          qrData={qrGenerator.state.currentQR}
                          loading={qrGenerator.isDownloading}
                          disabled={false}
                          onDownloadStart={() => {
                            console.log('Download started');
                            analytics.trackInteraction('download_started');
                          }}
                          onDownloadComplete={(filename) => {
                            console.log('Download completed:', filename);
                            if (typeof window !== 'undefined' && window.QRApp?.showToast) {
                              window.QRApp.showToast(`Downloaded: ${filename}`, 'success');
                            }
                          }}
                          onDownloadError={(error) => {
                            console.error('Download error:', error);
                            if (typeof window !== 'undefined' && window.QRApp?.showToast) {
                              window.QRApp.showToast(`Download failed: ${error}`, 'error');
                            }
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Progress Indicator */}
                {(qrGenerator.progress.stage !== 'idle' && qrGenerator.progress.message) && (
                  <Card>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">
                          {qrGenerator.progress.message}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${qrGenerator.progress.progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Generation Statistics */}
                {isClient && stats.total > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-blue-600">
                            {stats.total}
                          </div>
                          <div className="text-sm text-gray-600">Generated</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {stats.successRate.toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="guide" className="py-16 bg-white">
          <div className="container-tight">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600">
                Generate professional QR codes in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose Data Type & Enter Content</h3>
                <p className="text-gray-600">
                  Select from URL, text, email, phone, SMS, or WiFi, then input your content
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Customize Style & Settings</h3>
                <p className="text-gray-600">
                  Choose generation mode, colors, size, and error correction level
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
                <p className="text-gray-600">
                  Create your QR code instantly and download in PNG, SVG, JPG, or WEBP
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Data Types Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-tight">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Supported Data Types
              </h2>
              <p className="text-gray-600">
                Create QR codes for different types of content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card">
                <div className="text-2xl mb-3">🔗</div>
                <h3 className="text-lg font-semibold mb-2">Website URL</h3>
                <p className="text-gray-600 text-sm mb-3">Direct visitors to your website or any web page</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">https://example.com</code>
              </div>
              
              <div className="card">
                <div className="text-2xl mb-3">📝</div>
                <h3 className="text-lg font-semibold mb-2">Plain Text</h3>
                <p className="text-gray-600 text-sm mb-3">Share any text content or message</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">Any text content</code>
              </div>
              
              <div className="card">
                <div className="text-2xl mb-3">✉️</div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600 text-sm mb-3">Open email app with pre-filled recipient</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">mailto:hello@example.com</code>
              </div>
              
              <div className="card">
                <div className="text-2xl mb-3">📞</div>
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <p className="text-gray-600 text-sm mb-3">Enable one-tap calling to your number</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">tel:+1234567890</code>
              </div>
              
              <div className="card">
                <div className="text-2xl mb-3">💬</div>
                <h3 className="text-lg font-semibold mb-2">SMS</h3>
                <p className="text-gray-600 text-sm mb-3">Open SMS app with pre-filled message</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">sms:+1234567890</code>
              </div>
              
              <div className="card">
                <div className="text-2xl mb-3">📶</div>
                <h3 className="text-lg font-semibold mb-2">WiFi</h3>
                <p className="text-gray-600 text-sm mb-3">Share WiFi credentials for easy connection</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">WIFI:T:WPA;S:NetworkName;P:Password;;</code>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container-tight">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Everything you need to know about QR code generation
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "What data types can I encode in QR codes?",
                  answer: "You can encode URLs, plain text, email addresses, phone numbers, SMS messages, and WiFi credentials. Our tool supports all major QR code data types and automatically formats them correctly for optimal scanning."
                },
                {
                  question: "What's the difference between the generation modes?",
                  answer: "Basic mode creates standard black and white QR codes. Colored mode allows custom foreground and background colors. SVG mode generates vector graphics for scalability. High Quality mode provides the best error correction and durability for professional use."
                },
                {
                  question: "Which format should I choose for my QR code?",
                  answer: "PNG is best for general use and web display with transparency support. SVG is perfect for print materials and logos as it scales without quality loss. JPG is good for smaller file sizes but doesn't support transparency. WEBP offers the best compression for modern web use."
                },
                {
                  question: "How do error correction levels work?",
                  answer: "Error correction allows QR codes to be readable even when partially damaged. Low (7%) offers maximum data capacity, Medium (15%) is balanced for general use, Quartile (25%) is good for print materials, and High (30%) provides maximum durability for harsh environments."
                },
                {
                  question: "Are there any limits on QR code generation?",
                  answer: "Our tool is completely free with no generation limits. You can create unlimited QR codes without registration. All processing happens in your browser, ensuring privacy and speed."
                },
                {
                  question: "How do I ensure my QR code works properly?",
                  answer: "Test your QR code with multiple devices and apps before using it publicly. Ensure good contrast between foreground and background colors, don't make the code too small for scanning, and consider higher error correction for outdoor or printed use."
                }
              ].map((faq, index) => (
                <details key={index} className="card group">
                  <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 group-open:text-blue-600">
                    {faq.question}
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform duration-200">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="container-tight text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Your QR Code?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust our QR generator for their business and personal needs. Start creating professional QR codes in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  document.getElementById('qr-generator')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                  analytics.trackInteraction('cta_get_started', {
                    source: 'bottom_cta'
                  });
                }}
              >
                Get Started Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShowUserGuide}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                View User Guide
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* User Guide Modal - Now using UserGuide component */}
      <UserGuide
        isOpen={showUserGuide}
        onClose={handleCloseUserGuide}
        startWithSection="getting-started"
      />
    </>
  );
}