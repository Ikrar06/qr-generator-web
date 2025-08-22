// src/app/components/DownloadButton.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { QRGenerationResponse, OutputFormat, QRMode } from '@/types/qr-types';
import { FORMAT_OPTIONS } from '@/lib/constants';
import { downloadFile, formatFileSize, sanitizeFilename } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  qrData: QRGenerationResponse | null;
  loading?: boolean;
  disabled?: boolean;
  qrMode?: QRMode;
  onDownloadStart?: () => void;
  onDownloadComplete?: (filename: string) => void;
  onDownloadError?: (error: string) => void;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  qrData,
  loading = false,
  disabled = false,
  qrMode,
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

  // Get available formats based on QR mode - STRICT RULES
  const getAvailableFormats = (): typeof FORMAT_OPTIONS => {
    if (qrMode === QRMode.SVG) {
      // SVG mode: ONLY SVG format available
      return FORMAT_OPTIONS.filter(format => format.value === OutputFormat.SVG);
    } else {
      // All other modes: NO SVG format available
      return FORMAT_OPTIONS.filter(format => format.value !== OutputFormat.SVG);
    }
  };

  const availableFormats = getAvailableFormats();

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

  // Auto-update selected format based on mode changes
  useEffect(() => {
    const available = getAvailableFormats();
    const isCurrentFormatAvailable = available.some(f => f.value === selectedFormat);
    
    if (!isCurrentFormatAvailable) {
      if (qrMode === QRMode.SVG) {
        // Force SVG format for SVG mode
        setSelectedFormat(OutputFormat.SVG);
      } else {
        // Default to PNG for other modes, or first available
        const defaultFormat = available.find(f => f.value === OutputFormat.PNG) || available[0];
        if (defaultFormat) {
          setSelectedFormat(defaultFormat.value);
        }
      }
    }
  }, [qrMode, selectedFormat]);

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
    const formatOption = availableFormats.find(opt => opt.value === format);
    const extension = formatOption?.extension || 'png';
    
    return `${baseName}.${extension}`;
  };

  // Handle download with strict format validation
  const handleDownload = async (format?: OutputFormat) => {
    if (!qrData || !qrData.success) {
      onDownloadError?.('No QR code data available for download');
      return;
    }

    const downloadFormat = format || selectedFormat;
    
    // STRICT format validation based on mode
    if (qrMode === QRMode.SVG && downloadFormat !== OutputFormat.SVG) {
      onDownloadError?.('Vector mode only supports SVG format downloads');
      return;
    }
    
    if (qrMode !== QRMode.SVG && downloadFormat === OutputFormat.SVG) {
      onDownloadError?.('SVG format is only available in Vector mode');
      return;
    }

    // Validate format availability
    const isFormatAvailable = availableFormats.some(f => f.value === downloadFormat);
    if (!isFormatAvailable) {
      onDownloadError?.(`Format ${downloadFormat} is not available for this QR code mode`);
      return;
    }

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

      // Handle format-specific downloads
      if (downloadFormat === OutputFormat.SVG) {
        // SVG download - only available in SVG mode
        if (qrMode !== QRMode.SVG) {
          throw new Error('SVG format is only available in Vector mode');
        }
        
        if (typeof qrData.data === 'string' && qrData.data.includes('<svg')) {
          downloadData = new Blob([qrData.data], { type: 'image/svg+xml' });
          mimeType = 'image/svg+xml';
        } else {
          throw new Error('SVG data not available');
        }
      } else {
        // Raster formats - not available in SVG mode
        if (qrMode === QRMode.SVG) {
          throw new Error('Raster formats are not available in Vector mode');
        }
        
        if (!qrData.dataUrl) {
          throw new Error('Image data not available for raster formats');
        }

        // Convert to requested format
        if (downloadFormat === OutputFormat.JPG || downloadFormat === OutputFormat.JPEG) {
          downloadData = await convertToFormat(qrData.dataUrl, 'image/jpeg');
          mimeType = 'image/jpeg';
        } else if (downloadFormat === OutputFormat.WEBP) {
          downloadData = await convertToFormat(qrData.dataUrl, 'image/webp');
          mimeType = 'image/webp';
        } else {
          // PNG format
          const response = await fetch(qrData.dataUrl);
          downloadData = await response.blob();
          mimeType = response.headers.get('content-type') || 'image/png';
        }
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

  // Convert image format using canvas
  const convertToFormat = async (dataUrl: string, targetMimeType: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // For JPEG, fill with white background (no transparency)
        if (targetMimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image format'));
          }
        }, targetMimeType, 0.95);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  // Handle format selection with strict validation
  const handleFormatSelect = (format: OutputFormat) => {
    // Strict validation - only allow formats available for current mode
    const isFormatAvailable = availableFormats.some(f => f.value === format);
    
    if (isFormatAvailable) {
      setSelectedFormat(format);
      setShowFormatDropdown(false);
    } else {
      // Show error message for invalid selection
      if (qrMode === QRMode.SVG && format !== OutputFormat.SVG) {
        onDownloadError?.('Vector mode only supports SVG format');
      } else if (qrMode !== QRMode.SVG && format === OutputFormat.SVG) {
        onDownloadError?.('SVG format is only available in Vector mode');
      }
    }
  };

  // Quick download with selected format
  const handleQuickDownload = () => {
    handleDownload(selectedFormat);
  };

  // Get estimated file size for format
  const getEstimatedFileSize = (format: OutputFormat): string => {
    if (format === OutputFormat.SVG && qrData?.data && typeof qrData.data === 'string') {
      return formatFileSize(new Blob([qrData.data]).size);
    }
    
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
      default:
        return formatFileSize(baseSize);
    }
  };

  // Get format display info with fallback
  const getSelectedFormatInfo = () => {
    let formatOption = availableFormats.find(opt => opt.value === selectedFormat);
    
    // If selected format not available, use first (and likely only) available
    if (!formatOption) {
      formatOption = availableFormats[0];
      if (formatOption) {
        setSelectedFormat(formatOption.value);
      }
    }
    
    return formatOption || FORMAT_OPTIONS[0]; // Final fallback
  };

  const canDownload = qrData && qrData.success && !loading && !disabled;
  const selectedFormatInfo = getSelectedFormatInfo();

  // Check if this is SVG mode (only one format available)
  const isSVGMode = qrMode === QRMode.SVG;
  const showFormatSelector = availableFormats.length > 1;

  return (
    <Card className={cn("w-full", className)} variant="outline">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Download Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleQuickDownload}
              disabled={!canDownload || isDownloading}
              size="lg"
              className="flex-1"
              data-testid="download-button"
            >
              {isDownloading ? (
                <>
                  Downloading... {downloadProgress}%
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download {selectedFormatInfo.label}
                </>
              )}
            </Button>

            {/* Format Dropdown - Only show if multiple formats available */}
            {showFormatSelector && (
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
                      {availableFormats.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleFormatSelect(option.value)}
                          disabled={isDownloading}
                          className={cn(
                            "w-full text-left p-2 rounded-md transition-colors duration-200",
                            "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                            selectedFormat === option.value && "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {option.label}
                                {selectedFormat === option.value && (
                                  <span className="text-blue-600">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                            <div className="text-right ml-3">
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
            )}
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
                    {selectedFormatInfo.label}
                    {isSVGMode && (
                      <span className="ml-1 text-green-600 font-medium">(Vector)</span>
                    )}
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

          {/* Mode-specific Information */}
          {isSVGMode ? (
            <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-medium">Vector Mode Active:</span> Only SVG format is available. 
                  SVG files are scalable and perfect for professional printing and logos.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-medium">Raster Mode Active:</span> SVG format not available. 
                  Switch to Vector mode to download scalable SVG files.
                </div>
              </div>
            </div>
          )}

          {/* Format Information Table */}
          {!qrData && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">
                  Available Formats {isSVGMode && '(Vector Mode)'}
                </h4>
              </div>
              <div className="divide-y divide-gray-200">
                {availableFormats.map((option) => (
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
                          {option.value === OutputFormat.SVG && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                              Vector
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