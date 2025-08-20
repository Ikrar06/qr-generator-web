// src/lib/canvas-utils.ts
import { OutputFormat } from '@/types/qr-types';
import { FORMAT_MIME_TYPES } from '@/lib/constants';
import { dataURLtoBlob, blobToDataURL } from '@/lib/utils';

/**
 * Canvas manipulation utilities for QR code image processing
 */

export interface CanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  padding?: number;
  quality?: number;
  format?: OutputFormat;
}

export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
  interpolation?: 'nearest' | 'bilinear';
}

export interface BorderOptions {
  width: number;
  color: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Convert data URL to different format
 */
export async function convertFormat(
  dataURL: string,
  targetFormat: OutputFormat,
  quality: number = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        
        // Fill background for formats that don't support transparency
        if (targetFormat === OutputFormat.JPG || targetFormat === OutputFormat.JPEG) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        const mimeType = FORMAT_MIME_TYPES[targetFormat];
        const result = canvas.toDataURL(mimeType, quality);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Resize image while maintaining quality
 */
export async function resizeImage(
  dataURL: string,
  options: ResizeOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let { width, height } = options;
        
        // Maintain aspect ratio if requested
        if (options.maintainAspectRatio) {
          const aspectRatio = img.width / img.height;
          if (width / height > aspectRatio) {
            width = height * aspectRatio;
          } else {
            height = width / aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Set image smoothing based on interpolation method
        if (options.interpolation === 'nearest') {
          ctx.imageSmoothingEnabled = false;
        } else {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const result = canvas.toDataURL('image/png');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Add padding around QR code
 */
export async function addPadding(
  dataURL: string,
  padding: number,
  backgroundColor: string = '#ffffff'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width + (padding * 2);
        canvas.height = img.height + (padding * 2);
        
        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw image centered with padding
        ctx.drawImage(img, padding, padding);
        
        const result = canvas.toDataURL('image/png');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Add border around QR code
 */
export async function addBorder(
  dataURL: string,
  borderOptions: BorderOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const borderWidth = borderOptions.width;
        canvas.width = img.width + (borderWidth * 2);
        canvas.height = img.height + (borderWidth * 2);
        
        // Draw image first
        ctx.drawImage(img, borderWidth, borderWidth);
        
        // Draw border
        ctx.strokeStyle = borderOptions.color;
        ctx.lineWidth = borderWidth;
        
        if (borderOptions.style === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else if (borderOptions.style === 'dotted') {
          ctx.setLineDash([2, 2]);
        }
        
        ctx.strokeRect(borderWidth / 2, borderWidth / 2, 
                      canvas.width - borderWidth, canvas.height - borderWidth);
        
        const result = canvas.toDataURL('image/png');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Apply filters to QR code image
 */
export async function applyFilter(
  dataURL: string,
  filter: 'grayscale' | 'sepia' | 'invert' | 'blur' | 'brightness' | 'contrast',
  intensity: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply CSS filter
        switch (filter) {
          case 'grayscale':
            ctx.filter = `grayscale(${intensity * 100}%)`;
            break;
          case 'sepia':
            ctx.filter = `sepia(${intensity * 100}%)`;
            break;
          case 'invert':
            ctx.filter = `invert(${intensity * 100}%)`;
            break;
          case 'blur':
            ctx.filter = `blur(${intensity}px)`;
            break;
          case 'brightness':
            ctx.filter = `brightness(${intensity})`;
            break;
          case 'contrast':
            ctx.filter = `contrast(${intensity})`;
            break;
        }
        
        ctx.drawImage(img, 0, 0);
        
        const result = canvas.toDataURL('image/png');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Get image dimensions from data URL
 */
export async function getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Crop image to specified dimensions
 */
export async function cropImage(
  dataURL: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        
        const result = canvas.toDataURL('image/png');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Rotate image by specified angle (in degrees)
 */
export async function rotateImage(dataURL: string, angle: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const radians = (angle * Math.PI) / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));
        
        // Calculate new canvas size
        canvas.width = img.width * cos + img.height * sin;
        canvas.height = img.width * sin + img.height * cos;
        
        // Move to center and rotate
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        
        // Draw image centered
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        const result = canvas.toDataURL('image/png');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Composite multiple images together
 */
export async function compositeImages(
  images: Array<{ dataURL: string; x: number; y: number; width?: number; height?: number }>,
  canvasSize: { width: number; height: number },
  backgroundColor: string = '#ffffff'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let loadedImages = 0;
    const totalImages = images.length;
    
    if (totalImages === 0) {
      resolve(canvas.toDataURL('image/png'));
      return;
    }
    
    images.forEach((imgData, index) => {
      const img = new Image();
      
      img.onload = () => {
        const { x, y, width, height } = imgData;
        
        if (width && height) {
          ctx.drawImage(img, x, y, width, height);
        } else {
          ctx.drawImage(img, x, y);
        }
        
        loadedImages++;
        if (loadedImages === totalImages) {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      
      img.onerror = () => reject(new Error(`Failed to load image at index ${index}`));
      img.src = imgData.dataURL;
    });
  });
}

/**
 * Convert canvas to blob with specified format and quality
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat = OutputFormat.PNG,
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = FORMAT_MIME_TYPES[format];
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Convert data URL to canvas element
 */
export async function dataURLToCanvas(dataURL: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Create thumbnail from data URL
 */
export async function createThumbnail(
  dataURL: string,
  maxSize: number = 150,
  quality: number = 0.8
): Promise<string> {
  const dimensions = await getImageDimensions(dataURL);
  const scale = Math.min(maxSize / dimensions.width, maxSize / dimensions.height);
  
  if (scale >= 1) {
    // No need to resize
    return dataURL;
  }
  
  return resizeImage(dataURL, {
    width: Math.round(dimensions.width * scale),
    height: Math.round(dimensions.height * scale),
    maintainAspectRatio: true
  });
}

/**
 * Optimize image for web by reducing file size
 */
export async function optimizeForWeb(
  dataURL: string,
  maxSizeKB: number = 500,
  format: OutputFormat = OutputFormat.WEBP
): Promise<string> {
  let quality = 0.9;
  let result = await convertFormat(dataURL, format, quality);
  
  // Check file size and reduce quality if needed
  while (quality > 0.1) {
    const blob = dataURLtoBlob(result);
    const sizeKB = blob.size / 1024;
    
    if (sizeKB <= maxSizeKB) {
      break;
    }
    
    quality -= 0.1;
    result = await convertFormat(dataURL, format, quality);
  }
  
  return result;
}

/**
 * Add text watermark to image
 */
export async function addTextWatermark(
  dataURL: string,
  text: string,
  options: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    padding?: number;
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Set text properties
        const fontSize = options.fontSize || Math.max(12, canvas.width * 0.03);
        const fontFamily = options.fontFamily || 'Arial, sans-serif';
        const color = options.color || '#ffffff';
        const opacity = options.opacity || 0.7;
        const padding = options.padding || 10;
        
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        
        // Measure text
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        // Calculate position
        let x = padding;
        let y = padding + textHeight;
        
        switch (options.position) {
          case 'top-right':
            x = canvas.width - textWidth - padding;
            y = padding + textHeight;
            break;
          case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            break;
          case 'bottom-right':
            x = canvas.width - textWidth - padding;
            y = canvas.height - padding;
            break;
          case 'center':
            x = (canvas.width - textWidth) / 2;
            y = (canvas.height + textHeight) / 2;
            break;
        }
        
        // Draw text
        ctx.fillText(text, x, y);
        
        // Reset alpha
        ctx.globalAlpha = 1;
        
        const result = canvas.toDataURL('image/png');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

/**
 * Calculate optimal QR code size for print
 */
export function calculatePrintSize(
  scanDistance: number,
  units: 'mm' | 'inches' = 'mm'
): number {
  // Rule of thumb: QR code should be at least 10% of scan distance
  const minRatio = 0.1;
  const size = scanDistance * minRatio;
  
  if (units === 'inches') {
    return Math.max(size, 0.5); // Minimum 0.5 inches
  } else {
    return Math.max(size, 12.7); // Minimum 12.7mm (0.5 inches)
  }
}

/**
 * Convert pixels to physical units for print
 */
export function pixelsToPhysical(
  pixels: number,
  dpi: number = 300,
  unit: 'mm' | 'inches' = 'mm'
): number {
  const inches = pixels / dpi;
  
  if (unit === 'mm') {
    return inches * 25.4;
  }
  
  return inches;
}

/**
 * Convert physical units to pixels for print
 */
export function physicalToPixels(
  size: number,
  unit: 'mm' | 'inches' = 'mm',
  dpi: number = 300
): number {
  let inches = size;
  
  if (unit === 'mm') {
    inches = size / 25.4;
  }
  
  return Math.round(inches * dpi);
}

/**
 * Validate canvas dimensions
 */
export function validateCanvasDimensions(width: number, height: number): boolean {
  // Check browser limits (most browsers support up to 32767x32767)
  const maxDimension = 32767;
  const maxArea = maxDimension * maxDimension;
  
  return width > 0 && 
         height > 0 && 
         width <= maxDimension && 
         height <= maxDimension && 
         (width * height) <= maxArea;
}

/**
 * Get canvas context with fallback
 */
export function getCanvasContext(
  canvas: HTMLCanvasElement,
  contextType: '2d' = '2d',
  options?: CanvasRenderingContext2DSettings
): CanvasRenderingContext2D | null {
  try {
    return canvas.getContext(contextType, options);
  } catch (error) {
    console.error('Failed to get canvas context:', error);
    return null;
  }
}

/**
 * Check if browser supports canvas
 */
export function isCanvasSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  } catch (error) {
    return false;
  }
}

/**
 * Utility class for batch canvas operations
 */
export class CanvasBatch {
  private operations: Array<(dataURL: string) => Promise<string>> = [];
  
  /**
   * Add resize operation to batch
   */
  resize(options: ResizeOptions): this {
    this.operations.push((dataURL) => resizeImage(dataURL, options));
    return this;
  }
  
  /**
   * Add format conversion to batch
   */
  convertTo(format: OutputFormat, quality?: number): this {
    this.operations.push((dataURL) => convertFormat(dataURL, format, quality));
    return this;
  }
  
  /**
   * Add padding to batch
   */
  addPadding(padding: number, backgroundColor?: string): this {
    this.operations.push((dataURL) => addPadding(dataURL, padding, backgroundColor));
    return this;
  }
  
  /**
   * Add border to batch
   */
  addBorder(borderOptions: BorderOptions): this {
    this.operations.push((dataURL) => addBorder(dataURL, borderOptions));
    return this;
  }
  
  /**
   * Add filter to batch
   */
  addFilter(filter: 'grayscale' | 'sepia' | 'invert' | 'blur' | 'brightness' | 'contrast', intensity?: number): this {
    this.operations.push((dataURL) => applyFilter(dataURL, filter, intensity));
    return this;
  }
  
  /**
   * Execute all operations in sequence
   */
  async execute(dataURL: string): Promise<string> {
    let result = dataURL;
    
    for (const operation of this.operations) {
      result = await operation(result);
    }
    
    return result;
  }
  
  /**
   * Clear all operations
   */
  clear(): this {
    this.operations = [];
    return this;
  }
}