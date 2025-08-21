// src/lib/download-utils.ts
import { saveAs } from 'file-saver';
import { 
  OutputFormat, 
  QRGenerationResponse, 
  DownloadOptions 
} from '@/types/qr-types';
import { FORMAT_MIME_TYPES } from '@/lib/constants';
import { 
  dataURLtoBlob, 
  sanitizeFilename, 
  formatFileSize
} from '@/lib/utils';

/**
 * File download utilities for QR code generation
 */

/**
 * Generate unique filename with timestamp - local implementation
 */
function generateUniqueFilename(prefix: string = 'qr-code', extension: string = 'png'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomSuffix}.${extension}`;
}

export interface DownloadProgressCallback {
  (progress: number, stage: string): void;
}

export class DownloadError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string = 'DOWNLOAD_FAILED', details?: any) {
    super(message);
    this.name = 'DownloadError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Convert response data to Blob
 */
function responseDataToBlob(data: string | Buffer | ArrayBuffer | Blob | any, format: OutputFormat): Blob {
  if (data instanceof Blob) {
    return data;
  }
  
  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      // Data URL
      return dataURLtoBlob(data);
    } else if (format === OutputFormat.SVG) {
      // SVG string
      return new Blob([data], { type: FORMAT_MIME_TYPES[OutputFormat.SVG] });
    } else {
      // Base64 string
      try {
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: FORMAT_MIME_TYPES[format] });
      } catch (error) {
        // If atob fails, treat as regular string
        return new Blob([data], { type: FORMAT_MIME_TYPES[format] });
      }
    }
  }
  
  // Handle Buffer (Node.js) or ArrayBuffer
  let blobPart: BlobPart;
  
  if (data instanceof ArrayBuffer) {
    blobPart = data;
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    // Handle Buffer - convert to standard ArrayBuffer
    const arrayBuffer = new ArrayBuffer(data.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < data.length; i++) {
      view[i] = data[i];
    }
    blobPart = arrayBuffer;
  } else {
    // For any other type, try to convert to ArrayBuffer
    try {
      if (data && typeof data === 'object') {
        // Handle typed arrays by copying to standard ArrayBuffer
        if (data.buffer && data.byteLength !== undefined) {
          const arrayBuffer = new ArrayBuffer(data.byteLength);
          const sourceView = new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength);
          const targetView = new Uint8Array(arrayBuffer);
          targetView.set(sourceView);
          blobPart = arrayBuffer;
        } else {
          // Last resort: treat as ArrayBuffer
          blobPart = data as ArrayBuffer;
        }
      } else {
        // Fallback for primitive types
        blobPart = data as ArrayBuffer;
      }
    } catch (error) {
      console.warn('Failed to process data, using fallback:', error);
      // Create a simple ArrayBuffer from string representation
      const str = String(data);
      const arrayBuffer = new ArrayBuffer(str.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
      }
      blobPart = arrayBuffer;
    }
  }
  
  return new Blob([blobPart], { type: FORMAT_MIME_TYPES[format] });
}

/**
 * Download QR code from generation response
 */
export async function downloadQR(
  response: QRGenerationResponse,
  options?: Partial<DownloadOptions>,
  onProgress?: DownloadProgressCallback
): Promise<void> {
  try {
    if (!response.success || !response.data) {
      throw new DownloadError('Invalid QR generation response', 'INVALID_RESPONSE');
    }

    onProgress?.(10, 'Preparing download...');

    // Convert response data to blob
    const blob = responseDataToBlob(response.data, response.format);

    onProgress?.(30, 'Processing file...');

    // Determine download options with converted blob
    const downloadOptions: DownloadOptions = {
      filename: sanitizeFilename(options?.filename || response.filename),
      format: options?.format || response.format,
      data: blob,
      mimeType: options?.mimeType || FORMAT_MIME_TYPES[response.format]
    };

    onProgress?.(60, 'Initiating download...');

    // Add proper file extension if missing
    const filename = ensureFileExtension(downloadOptions.filename, downloadOptions.format);

    onProgress?.(80, 'Starting download...');

    // Use file-saver to download
    saveAs(downloadOptions.data as Blob, filename);

    onProgress?.(100, 'Download complete');

  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }
    throw new DownloadError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'DOWNLOAD_FAILED',
      error
    );
  }
}

/**
 * Download multiple QR codes as a ZIP file
 */
export async function downloadBatch(
  responses: QRGenerationResponse[],
  zipFilename: string = 'qr-codes.zip',
  onProgress?: DownloadProgressCallback
): Promise<void> {
  // Note: This requires a ZIP library like JSZip in a full implementation
  // For now, we'll download files individually
  
  const successfulResponses = responses.filter(r => r.success && r.data);
  
  if (successfulResponses.length === 0) {
    throw new DownloadError('No valid QR codes to download', 'NO_VALID_DATA');
  }

  onProgress?.(0, 'Starting batch download...');

  for (let i = 0; i < successfulResponses.length; i++) {
    const response = successfulResponses[i];
    const progress = Math.round(((i + 1) / successfulResponses.length) * 100);
    
    onProgress?.(progress, `Downloading ${i + 1} of ${successfulResponses.length}...`);
    
    try {
      await downloadQR(response);
      // Add small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`Failed to download QR code: ${response.filename}`, error);
    }
  }

  onProgress?.(100, 'Batch download complete');
}

/**
 * Get download URL for QR code (for sharing or embedding)
 */
export function getDownloadURL(response: QRGenerationResponse): string | null {
  if (!response.success || !response.data) {
    return null;
  }

  if (typeof response.data === 'string' && response.data.startsWith('data:')) {
    return response.data;
  }

  if (response.dataUrl) {
    return response.dataUrl;
  }

  // Create blob URL for other data types
  try {
    const blob = responseDataToBlob(response.data, response.format);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to create download URL:', error);
    return null;
  }
}

/**
 * Copy QR code data to clipboard
 */
export async function copyToClipboard(response: QRGenerationResponse): Promise<boolean> {
  if (!response.success || !response.data) {
    return false;
  }

  try {
    if (response.format === OutputFormat.SVG && typeof response.data === 'string') {
      // Copy SVG as text
      await navigator.clipboard.writeText(response.data);
      return true;
    }

    // For raster images, try to copy as blob
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      let blob: Blob;
      
      if (typeof response.data === 'string' && response.data.startsWith('data:')) {
        blob = dataURLtoBlob(response.data);
      } else {
        const url = getDownloadURL(response);
        if (!url) return false;
        
        const fetchResponse = await fetch(url);
        blob = await fetchResponse.blob();
      }

      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });

      await navigator.clipboard.write([clipboardItem]);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share QR code using Web Share API
 */
export async function shareQR(
  response: QRGenerationResponse,
  shareData?: {
    title?: string;
    text?: string;
    url?: string;
  }
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  if (!response.success || !response.data) {
    return false;
  }

  try {
    let blob: Blob;
    
    if (typeof response.data === 'string' && response.data.startsWith('data:')) {
      blob = dataURLtoBlob(response.data);
    } else {
      const url = getDownloadURL(response);
      if (!url) return false;
      
      const fetchResponse = await fetch(url);
      blob = await fetchResponse.blob();
    }

    const file = new File([blob], response.filename, { type: blob.type });

    const data: ShareData = {
      title: shareData?.title || 'QR Code',
      text: shareData?.text || 'Generated QR Code',
      files: [file]
    };

    if (shareData?.url) {
      data.url = shareData.url;
    }

    await navigator.share(data);
    return true;
  } catch (error) {
    console.error('Failed to share QR code:', error);
    return false;
  }
}

/**
 * Get file size from data with improved type safety
 */
function getDataSize(data: string | Buffer | ArrayBuffer | Blob | any): number {
  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      // Data URL - estimate from base64
      const base64Data = data.split(',')[1];
      return Math.round((base64Data.length * 3) / 4);
    } else {
      // Regular string
      return new Blob([data]).size;
    }
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    return data.length;
  } else if (data instanceof ArrayBuffer) {
    return data.byteLength;
  } else if (data instanceof Blob) {
    return data.size;
  } else {
    // Handle typed arrays and other array-like objects safely
    if (data && typeof data === 'object') {
      // Check for byteLength property (typed arrays)
      if (typeof data.byteLength === 'number') {
        return data.byteLength;
      }
      // Check for length property (regular arrays)
      if (typeof data.length === 'number') {
        return data.length;
      }
    }
  }
  
  // Fallback: try to create blob to get size
  try {
    const blob = responseDataToBlob(data, OutputFormat.PNG);
    return blob.size;
  } catch (error) {
    console.warn('Failed to calculate data size:', error);
    return 0;
  }
}

/**
 * Get file information from QR response
 */
export function getFileInfo(response: QRGenerationResponse): {
  name: string;
  size: string;
  type: string;
  dimensions: string;
} {
  const info = {
    name: response.filename,
    size: 'Unknown',
    type: FORMAT_MIME_TYPES[response.format] || 'Unknown',
    dimensions: `${response.size.width}×${response.size.height}`
  };

  // Calculate file size
  if (response.data) {
    const sizeBytes = getDataSize(response.data);
    if (sizeBytes > 0) {
      info.size = formatFileSize(sizeBytes);
    }
  }

  return info;
}

/**
 * Validate download options
 */
export function validateDownloadOptions(options: DownloadOptions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.filename || options.filename.trim().length === 0) {
    errors.push('Filename is required');
  }

  if (!options.format || !Object.values(OutputFormat).includes(options.format)) {
    errors.push('Valid format is required');
  }

  if (!options.data) {
    errors.push('Data is required');
  }

  if (!options.mimeType || options.mimeType.trim().length === 0) {
    errors.push('MIME type is required');
  }

  // Check filename for invalid characters
  if (options.filename && /[<>:"/\\|?*]/.test(options.filename)) {
    errors.push('Filename contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Ensure filename has correct extension for format
 */
export function ensureFileExtension(filename: string, format: OutputFormat): string {
  const extensions: Record<OutputFormat, string> = {
    [OutputFormat.PNG]: '.png',
    [OutputFormat.JPG]: '.jpg',
    [OutputFormat.JPEG]: '.jpg',
    [OutputFormat.SVG]: '.svg',
    [OutputFormat.WEBP]: '.webp'
  };

  const extension = extensions[format];
  const regex = new RegExp(`\\${extension}$`, 'i');

  if (regex.test(filename)) {
    return filename;
  }

  // Remove any existing extension and add correct one
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return nameWithoutExt + extension;
}

/**
 * Generate safe download filename
 */
export function generateSafeFilename(
  prefix: string = 'qr-code',
  format: OutputFormat = OutputFormat.PNG
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const extension = ensureFileExtension('', format).substring(1); // Remove the dot
  
  return sanitizeFilename(`${prefix}-${timestamp}-${randomSuffix}.${extension}`);
}

/**
 * Check if browser supports file downloads
 */
export function isDownloadSupported(): boolean {
  try {
    // Check for basic download support
    const link = document.createElement('a');
    const hasDownloadAttribute = 'download' in link;
    
    // Check for Blob support
    const hasBlob = typeof Blob !== 'undefined';
    
    // Check for URL.createObjectURL support
    const hasObjectURL = typeof URL !== 'undefined' && 'createObjectURL' in URL;
    
    return hasDownloadAttribute && hasBlob && hasObjectURL;
  } catch (error) {
    return false;
  }
}

/**
 * Check if browser supports Web Share API
 */
export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Check if browser supports clipboard operations
 */
export function isClipboardSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'clipboard' in navigator && 
         'writeText' in navigator.clipboard;
}

/**
 * Download utility class for managing multiple downloads
 */
export class DownloadManager {
  private activeDownloads: Map<string, AbortController> = new Map();
  private downloadHistory: QRGenerationResponse[] = [];
  private maxHistorySize: number = 50;

  /**
   * Download QR with tracking
   */
  async download(
    response: QRGenerationResponse,
    options?: Partial<DownloadOptions>,
    onProgress?: DownloadProgressCallback
  ): Promise<void> {
    const downloadId = this.generateDownloadId(response);
    const controller = new AbortController();
    
    this.activeDownloads.set(downloadId, controller);

    try {
      await downloadQR(response, options, onProgress);
      this.addToHistory(response);
    } finally {
      this.activeDownloads.delete(downloadId);
    }
  }

  /**
   * Cancel active download
   */
  cancelDownload(response: QRGenerationResponse): void {
    const downloadId = this.generateDownloadId(response);
    const controller = this.activeDownloads.get(downloadId);
    
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(downloadId);
    }
  }

  /**
   * Cancel all active downloads
   */
  cancelAllDownloads(): void {
    for (const controller of this.activeDownloads.values()) {
      controller.abort();
    }
    this.activeDownloads.clear();
  }

  /**
   * Get active download count
   */
  getActiveDownloadCount(): number {
    return this.activeDownloads.size;
  }

  /**
   * Get download history
   */
  getHistory(): QRGenerationResponse[] {
    return [...this.downloadHistory];
  }

  /**
   * Clear download history
   */
  clearHistory(): void {
    this.downloadHistory = [];
  }

  /**
   * Get download statistics
   */
  getStats(): {
    totalDownloads: number;
    formatBreakdown: Record<OutputFormat, number>;
    averageFileSize: number;
  } {
    const stats = {
      totalDownloads: this.downloadHistory.length,
      formatBreakdown: {} as Record<OutputFormat, number>,
      averageFileSize: 0
    };

    // Initialize format breakdown
    for (const format of Object.values(OutputFormat)) {
      stats.formatBreakdown[format] = 0;
    }

    // Calculate stats
    let totalSize = 0;
    for (const response of this.downloadHistory) {
      stats.formatBreakdown[response.format]++;
      
      // Calculate file size using helper function
      if (response.data) {
        totalSize += getDataSize(response.data);
      }
    }

    stats.averageFileSize = this.downloadHistory.length > 0 ? 
      totalSize / this.downloadHistory.length : 0;

    return stats;
  }

  private generateDownloadId(response: QRGenerationResponse): string {
    return `${response.filename}-${response.timestamp}`;
  }

  private addToHistory(response: QRGenerationResponse): void {
    this.downloadHistory.unshift(response);
    
    // Limit history size
    if (this.downloadHistory.length > this.maxHistorySize) {
      this.downloadHistory = this.downloadHistory.slice(0, this.maxHistorySize);
    }
  }
}

// Export default download manager instance
export const downloadManager = new DownloadManager();