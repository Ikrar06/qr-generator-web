// src/components/QRPreview.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRGenerationResponse, OutputFormat } from '@/types/qr-types';
import { copyToClipboard, formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface QRPreviewProps {
  qrData: QRGenerationResponse | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onZoomChange?: (zoom: number) => void;
  showMetadata?: boolean;
  allowZoom?: boolean;
  isTransparent?: boolean;
  className?: string;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  qrData,
  loading = false,
  error = null,
  onRetry,
  onZoomChange,
  showMetadata = true,
  allowZoom = true,
  isTransparent = false,
  className
}) => {
  const [zoom, setZoom] = useState(1);
  const [showFullMetadata, setShowFullMetadata] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewBackground, setPreviewBackground] = useState<'transparent' | 'white' | 'black' | 'checkered'>('checkered');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(0.25, Math.min(4, newZoom));
    setZoom(clampedZoom);
    onZoomChange?.(clampedZoom);
  }, [onZoomChange]);

  // Copy QR data URL to clipboard
  const handleCopyDataURL = async () => {
    if (qrData?.dataUrl) {
      const success = await copyToClipboard(qrData.dataUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageError(false);
  };

  // Reset zoom
  const resetZoom = () => {
    handleZoomChange(1);
  };

  // Zoom in
  const zoomIn = () => {
    handleZoomChange(zoom + 0.25);
  };

  // Zoom out
  const zoomOut = () => {
    handleZoomChange(zoom - 0.25);
  };

  // Get preview background style
  const getPreviewBackgroundStyle = () => {
    if (!isTransparent) {
      return { backgroundColor: '#f9fafb' };
    }

    switch (previewBackground) {
      case 'transparent':
        return { backgroundColor: 'transparent' };
      case 'white':
        return { backgroundColor: '#ffffff' };
      case 'black':
        return { backgroundColor: '#000000' };
      case 'checkered':
      default:
        return {
          backgroundImage: `
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#ffffff'
        };
    }
  };

  // Format metadata for display
  const formatMetadata = (metadata: any) => {
    if (!metadata) return {};
    
    return {
      'Version': metadata.version || 'Auto',
      'Error Correction': metadata.errorCorrectionLevel || 'Medium',
      'Mask Pattern': metadata.maskPattern !== undefined ? metadata.maskPattern : 'Auto',
      'Data Segments': metadata.segments?.length || 1,
      'Encoding Mode': metadata.segments?.[0]?.mode || 'Auto'
    };
  };

  return (
    <Card className={cn("w-full", className)} variant="outline">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QR Code Preview</span>
          <div className="flex items-center gap-1">
            {/* Background selector for transparent QR codes */}
            {isTransparent && qrData && !loading && !error && (
              <div className="flex items-center gap-1 mr-3">
                <Button
                  variant={previewBackground === 'checkered' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewBackground('checkered')}
                  className="px-2"
                  title="Checkered background"
                >
                  <div 
                    className="w-4 h-4 border border-gray-400 rounded-sm"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                      `,
                      backgroundSize: '4px 4px',
                      backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                    }}
                  />
                </Button>
                <Button
                  variant={previewBackground === 'white' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewBackground('white')}
                  className="px-2"
                  title="White background"
                >
                  <div className="w-4 h-4 bg-white border border-gray-400 rounded-sm"></div>
                </Button>
                <Button
                  variant={previewBackground === 'black' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewBackground('black')}
                  className="px-2"
                  title="Black background"
                >
                  <div className="w-4 h-4 bg-black border border-gray-400 rounded-sm"></div>
                </Button>
              </div>
            )}
            
            {allowZoom && qrData && !loading && !error && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomOut}
                  disabled={zoom <= 0.25}
                  className="px-2"
                  title="Zoom out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </Button>
                <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomIn}
                  disabled={zoom >= 4}
                  className="px-2"
                  title="Zoom in"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetZoom}
                  disabled={zoom === 1}
                  className="px-2"
                  title="Reset zoom"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Button>
              </>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          {loading 
            ? 'Generating your QR code...'
            : error 
            ? 'There was an error generating the QR code'
            : qrData 
            ? isTransparent 
              ? 'Your transparent QR code is ready for download'
              : 'Your QR code is ready for download'
            : 'QR code will appear here after generation'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* QR Code Display Area */}
          <div 
            className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg min-h-[300px]"
            style={getPreviewBackgroundStyle()}
          >
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Generating QR code...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 mb-3">{error}</p>
                {onRetry && (
                  <Button onClick={onRetry} size="sm" variant="outline">
                    Try Again
                  </Button>
                )}
              </div>
            ) : qrData ? (
              <div className="text-center">
                {!imageError ? (
                  <div 
                    className="inline-block transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {qrData.format === OutputFormat.SVG ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: qrData.data as string }}
                        className="max-w-full max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:max-h-full"
                      />
                    ) : (
                      <img
                        ref={imageRef}
                        src={qrData.dataUrl}
                        alt="Generated QR Code"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        className={cn(
                          "max-w-full max-h-full rounded",
                          !isTransparent && "border border-gray-300"
                        )}
                        style={{
                          // Maintain aspect ratio and prevent stretching
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '300px',
                          maxHeight: '300px'
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">Failed to display QR code</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4a2 2 0 012-2h8a2 2 0 012 2v2m-6 12v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h2m8 0h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2" />
                </svg>
                <p className="text-sm text-gray-500">Enter data and click generate to create your QR code</p>
              </div>
            )}
          </div>

          {/* Preview Background Info for Transparent QR */}
          {isTransparent && qrData && !loading && !error && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Preview background for demonstration only. Actual QR code has transparent background.</span>
            </div>
          )}

          {/* QR Code Actions */}
          {qrData && !loading && !error && (
            <div className="flex justify-center gap-2">
              <Button
                onClick={handleCopyDataURL}
                variant="outline"
                size="sm"
                disabled={!qrData.dataUrl}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Data URL
                  </>
                )}
              </Button>

              {allowZoom && (
                <>
                  <Button
                    onClick={zoomOut}
                    variant="outline"
                    size="sm"
                    disabled={zoom <= 0.25}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </Button>
                  <Button
                    onClick={resetZoom}
                    variant="outline"
                    size="sm"
                    disabled={zoom === 1}
                  >
                    Fit
                  </Button>
                  <Button
                    onClick={zoomIn}
                    variant="outline"
                    size="sm"
                    disabled={zoom >= 4}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </Button>
                </>
              )}
            </div>
          )}

          {/* QR Code Information */}
          {qrData && !loading && !error && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">{qrData.format.toUpperCase()}</div>
                  <div className="text-xs text-gray-500">Format</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">
                    {qrData.size.width}×{qrData.size.height}
                  </div>
                  <div className="text-xs text-gray-500">Dimensions</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">
                    {qrData.dataUrl ? formatFileSize(qrData.dataUrl.length * 0.75) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">File Size</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">
                    {isTransparent ? 'Transparent' : 'Opaque'}
                  </div>
                  <div className="text-xs text-gray-500">Background</div>
                </div>
              </div>

              {/* Detailed Metadata */}
              {showMetadata && qrData.metadata && (
                <div className="border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setShowFullMetadata(!showFullMetadata)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      Technical Details
                    </span>
                    <svg 
                      className={cn(
                        "w-4 h-4 text-gray-500 transition-transform duration-200",
                        showFullMetadata && "rotate-180"
                      )} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showFullMetadata && (
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(formatMetadata(qrData.metadata)).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-xs font-mono text-gray-900">{value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Background:</span>
                          <span className="text-xs font-mono text-gray-900">
                            {isTransparent ? 'Transparent' : 'Solid Color'}
                          </span>
                        </div>
                      </div>

                      {qrData.metadata.segments && qrData.metadata.segments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="text-xs font-medium text-gray-900 mb-2">Data Segments</h5>
                          <div className="space-y-2">
                            {qrData.metadata.segments.map((segment, index) => (
                              <div key={index} className="bg-white rounded p-2 border border-gray-200">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-600">Mode:</span>
                                  <span className="font-mono text-gray-900">{segment.mode}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-600">Bits:</span>
                                  <span className="font-mono text-gray-900">{segment.numBits}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-600">Length:</span>
                                  <span className="font-mono text-gray-900">{segment.data.length}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tips for better scanning */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      {isTransparent ? 'Transparent QR Code Tips' : 'Scanning Tips'}
                    </h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      {isTransparent ? (
                        <>
                          <li>• Use PNG or SVG format to preserve transparency</li>
                          <li>• Ensure good contrast between foreground color and background surface</li>
                          <li>• Test on different colored backgrounds before final use</li>
                          <li>• Avoid using transparent QR codes on busy or patterned backgrounds</li>
                        </>
                      ) : (
                        <>
                          <li>• Print at least 2×2 cm (0.8×0.8 inch) for mobile scanning</li>
                          <li>• Ensure good lighting when scanning</li>
                          <li>• Keep the QR code flat and avoid reflections</li>
                          <li>• Test scanning from different distances and angles</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRPreview;