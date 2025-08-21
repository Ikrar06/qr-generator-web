// src/app/components/DownloadButton.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { QRGenerationResponse, OutputFormat } from '@/types/qr-types';
import { FORMAT_OPTIONS } from '@/lib/constants';
import { downloadFile, formatFileSize, sanitizeFilename } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  qrData: QRGenerationResponse | null;
  loading?: boolean;
  disabled?: boolean;
  onDownloadStart?: () => void;
  onDownloadComplete?: (filename: string) => void;
  onDownloadError?: (error: string) => void;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  qrData,
  loading = false,
  disabled = false,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  className
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(OutputFormat.PNG);
  const [customFilename, setCustomFilename] = useState('');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showFilenameInput, setShowFilenameInput] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected format when qrData changes
  useEffect(() => {
    if (qrData?.format) {
      setSelectedFormat(qrData.format);
    }
  }, [qrData?.format]);

  // Generate final filename
  const generateFinalFilename = (format: OutputFormat): string => {
    let baseName = customFilename.trim();
    
    if (!baseName) {
      baseName = qrData?.filename || `qr-code-${Date.now()}`;
    }
    
    // Remove existing extension
    baseName = baseName.replace(/\.(png|jpg|jpeg|svg|webp)$/i, '');
    
    // Sanitize filename
    baseName = sanitizeFilename(baseName);
    
    // Add appropriate extension
    const formatOption = FORMAT_OPTIONS.find(opt => opt.value === format);
    const extension = formatOption?.extension || 'png';
    
    return `${baseName}.${extension}`;
  };

  // Handle download
  const handleDownload = async (format?: OutputFormat) => {
    if (!qrData || !qrData.success) {
      onDownloadError?.('No QR code data available for download');
      return;
    }

    const downloadFormat = format || selectedFormat;
    const filename = generateFinalFilename(downloadFormat);

    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      onDownloadStart?.();

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => Math.min(prev + 10, 90));
      }, 50);

      let downloadData: string | Blob;
      let mimeType: string;

      if (downloadFormat === OutputFormat.SVG && typeof qrData.data === 'string') {
        // SVG download
        downloadData = new Blob([qrData.data], { type: 'image/svg+xml' });
        mimeType = 'image/svg+xml';
      } else if (qrData.dataUrl) {
        // Convert data URL to blob for other formats
        const response = await fetch(qrData.dataUrl);
        downloadData = await response.blob();
        mimeType = response.headers.get('content-type') || 'image/png';
      } else {
        throw new Error('No suitable data format available for download');
      }

      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Trigger download
      downloadFile(downloadData, filename, mimeType);

      // Complete
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        onDownloadComplete?.(filename);
      }, 500);

    } catch (error) {
      setIsDownloading(false);
      setDownloadProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      onDownloadError?.(errorMessage);
    }
  };

  // Quick download with current format
  const handleQuickDownload = () => {
    handleDownload(qrData?.format);
  };

  // Get estimated file size for format
  const getEstimatedFileSize = (format: OutputFormat): string => {
    if (!qrData?.dataUrl) return 'Unknown';
    
    const baseSize = qrData.dataUrl.length * 0.75; // Base64 to bytes conversion
    
    switch (format) {
      case OutputFormat.PNG:
        return formatFileSize(baseSize);
      case OutputFormat.JPG:
      case OutputFormat.JPEG:
        return formatFileSize(baseSize * 0.3); // JPEG compression
      case OutputFormat.WEBP:
        return formatFileSize(baseSize * 0.25); // WebP compression
      case OutputFormat.SVG:
        return qrData.data ? formatFileSize(new Blob([qrData.data as string]).size) : 'Unknown';
      default:
        return formatFileSize(baseSize);
    }
  };

  const canDownload = qrData && qrData.success && !loading && !disabled;

  return (
    <Card className={cn("w-full", className)} variant="outline">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Download Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleQuickDownload}
              disabled={!canDownload || isDownloading}
              loading={isDownloading}
              size="lg"
              className="flex-1"
              data-testid="download-button"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Downloading... {downloadProgress}%
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download {qrData?.format.toUpperCase() || 'QR Code'}
                </>
              )}
            </Button>

            {/* Format Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                disabled={!canDownload || isDownloading}
                variant="outline"
                size="lg"
                className="px-3"
                title="Choose format"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              {showFormatDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-900 mb-2 px-2">Choose Format</div>
                    {FORMAT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedFormat(option.value);
                          setShowFormatDropdown(false);
                          handleDownload(option.value);
                        }}
                        disabled={isDownloading}
                        className={cn(
                          "w-full text-left p-2 rounded-md transition-colors duration-200",
                          "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                          selectedFormat === option.value && "bg-blue-50 text-blue-900"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-gray-600">
                              {getEstimatedFileSize(option.value)}
                            </div>
                            <div className="text-xs text-gray-400">
                              .{option.extension}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Download Progress Bar */}
          {isDownloading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Preparing download...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Filename Customization */}
          <div>
            <button
              type="button"
              onClick={() => setShowFilenameInput(!showFilenameInput)}
              disabled={!canDownload || isDownloading}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
            >
              {showFilenameInput ? 'Hide' : 'Customize'} filename
            </button>

            {showFilenameInput && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder={qrData?.filename || 'qr-code'}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Final filename: {generateFinalFilename(selectedFormat)}
                </p>
              </div>
            )}
          </div>

          {/* Download Options Summary */}
          {qrData && (
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Selected Format:</span>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 font-mono">
                    {selectedFormat.toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-medium">Estimated Size:</span>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800">
                    {getEstimatedFileSize(selectedFormat)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Format Comparison Table */}
          {!qrData && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Format Comparison</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {FORMAT_OPTIONS.map((option) => (
                  <div key={option.value} className="px-3 py-2 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">
                          {option.supportsTransparency && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800 mr-1">
                              Transparent
                            </span>
                          )}
                          {option.supportsAnimation && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              Animated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};