// src/lib/qr-generator.ts
import QRCode from 'qrcode';
import { 
  QRMode, 
  QROptions, 
  QRGenerationRequest, 
  QRGenerationResponse, 
  ErrorCorrectionLevel,
  OutputFormat,
  defaultQROptions 
} from '@/types/qr-types';
import { 
  DEFAULT_OPTIONS_BY_MODE,
  FORMAT_MIME_TYPES,
  QR_LIMITS 
} from '@/lib/constants';
import { validateQRInput, formatErrorMessage, generateUniqueFilename } from '@/lib/utils';

/**
 * Main QR Generator class - port from Python QRCodeGenerator
 * Handles all QR code generation modes with different options
 */
export class QRGenerator {
  private defaultOptions: QROptions;

  constructor(options?: Partial<QROptions>) {
    this.defaultOptions = {
      ...defaultQROptions,
      ...options
    };
  }

  /**
   * Generate QR code based on request parameters
   */
  async generate(request: QRGenerationRequest): Promise<QRGenerationResponse> {
    try {
      // Validate input data
      const validation = validateQRInput(request.data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check data length limits
      if (request.data.length > QR_LIMITS.MAX_DATA_LENGTH) {
        throw new Error(`Data exceeds maximum length of ${QR_LIMITS.MAX_DATA_LENGTH} characters`);
      }

      // Merge options with defaults
      const options = this.mergeOptions(request.mode, request.options);
      
      // Generate filename if not provided
      const filename = request.filename || this.generateFilename(request.mode);

      // Generate QR code based on mode
      let result: QRGenerationResponse;
      
      switch (request.mode) {
        case QRMode.BASIC:
          result = await this.generateBasic(request.data, options, filename);
          break;
        case QRMode.COLORED:
          result = await this.generateColored(request.data, options, filename);
          break;
        case QRMode.SVG:
          result = await this.generateSVG(request.data, options, filename);
          break;
        case QRMode.HIGH_QUALITY:
          result = await this.generateHighQuality(request.data, options, filename);
          break;
        default:
          throw new Error(`Unsupported QR mode: ${request.mode}`);
      }

      // Add metadata
      result.metadata = await this.extractMetadata(request.data, options);
      result.timestamp = Date.now();

      return result;

    } catch (error) {
      return {
        success: false,
        filename: request.filename || this.generateFilename(request.mode),
        format: this.getFormatFromOptions(request.options),
        size: {
          width: request.options?.width || this.defaultOptions.width,
          height: request.options?.height || this.defaultOptions.height
        },
        error: formatErrorMessage(error),
        timestamp: Date.now()
      };
    }
  }

  /**
   * Generate QR code data URL with proper error handling
   */
  private async generateQRDataURL(
    data: string, 
    options: any
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Use the callback version to ensure we get the result properly
        QRCode.toDataURL(data, options, (error: any, url: string) => {
          if (error) {
            reject(error);
          } else {
            resolve(url);
          }
        });
      } catch (syncError) {
        reject(syncError);
      }
    });
  }

  /**
   * Generate basic black and white QR code
   */
  private async generateBasic(
    data: string, 
    options: QROptions, 
    filename: string
  ): Promise<QRGenerationResponse> {
    if (options.type === 'svg') {
      // Generate SVG using toString method
      const svgOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        width: options.width
      };

      const svgString = await QRCode.toString(data, {
        ...svgOptions,
        type: 'svg' as any
      });

      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;

      return {
        success: true,
        data: svgString,
        dataUrl,
        filename,
        format: OutputFormat.SVG,
        size: {
          width: options.width,
          height: options.height
        },
        timestamp: Date.now()
      };
    } else {
      // Generate raster image using callback-based toDataURL
      const baseOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        width: options.width,
        rendererOpts: options.rendererOpts
      };

      let qrDataUrl: string;
      let format: OutputFormat;

      // Use the safe callback-based method
      if (options.type === 'image/jpeg') {
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/jpeg',
          quality: options.quality
        });
        format = OutputFormat.JPG;
      } else if (options.type === 'image/webp') {
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/webp',
          quality: options.quality
        });
        format = OutputFormat.WEBP;
      } else {
        // Default to PNG
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/png'
        });
        format = OutputFormat.PNG;
      }

      return {
        success: true,
        data: qrDataUrl,
        dataUrl: qrDataUrl,
        filename,
        format,
        size: {
          width: options.width,
          height: options.height
        },
        timestamp: Date.now()
      };
    }
  }

  /**
   * Generate colored QR code with custom foreground/background colors
   */
  private async generateColored(
    data: string, 
    options: QROptions, 
    filename: string
  ): Promise<QRGenerationResponse> {
    if (options.type === 'svg') {
      // Generate colored SVG
      const svgOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        color: options.color,
        width: options.width
      };

      const svgString = await QRCode.toString(data, {
        ...svgOptions,
        type: 'svg' as any
      });

      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;

      return {
        success: true,
        data: svgString,
        dataUrl,
        filename,
        format: OutputFormat.SVG,
        size: {
          width: options.width,
          height: options.height
        },
        timestamp: Date.now()
      };
    } else {
      // Generate colored raster image using callback-based method
      const baseOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        color: options.color,
        width: options.width,
        rendererOpts: options.rendererOpts
      };

      let qrDataUrl: string;
      let format: OutputFormat;

      // Use the safe callback-based method
      if (options.type === 'image/jpeg') {
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/jpeg',
          quality: options.quality
        });
        format = OutputFormat.JPG;
      } else if (options.type === 'image/webp') {
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/webp',
          quality: options.quality
        });
        format = OutputFormat.WEBP;
      } else {
        // Default to PNG
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/png'
        });
        format = OutputFormat.PNG;
      }

      return {
        success: true,
        data: qrDataUrl,
        dataUrl: qrDataUrl,
        filename,
        format,
        size: {
          width: options.width,
          height: options.height
        },
        timestamp: Date.now()
      };
    }
  }

  /**
   * Generate SVG QR code for scalable vector output
   */
  private async generateSVG(
    data: string, 
    options: QROptions, 
    filename: string
  ): Promise<QRGenerationResponse> {
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel,
      margin: options.margin,
      color: options.color,
      width: options.width,
      xmlDeclaration: options.xmlDeclaration
    };

    const svgString = await QRCode.toString(data, {
      ...qrOptions,
      type: 'svg' as any
    });

    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;

    return {
      success: true,
      data: svgString,
      dataUrl,
      filename: filename.replace(/\.(png|jpg|jpeg|webp)$/i, '.svg'),
      format: OutputFormat.SVG,
      size: {
        width: options.width,
        height: options.height
      },
      timestamp: Date.now()
    };
  }

  /**
   * Generate high quality QR code with maximum error correction
   */
  private async generateHighQuality(
    data: string, 
    options: QROptions, 
    filename: string
  ): Promise<QRGenerationResponse> {
    const highQualityWidth = Math.max(options.width, 512);
    
    if (options.type === 'svg') {
      // Generate high quality SVG
      const svgOptions = {
        errorCorrectionLevel: ErrorCorrectionLevel.HIGH,
        margin: Math.max(options.margin, 4),
        color: options.color,
        width: highQualityWidth
      };

      const svgString = await QRCode.toString(data, {
        ...svgOptions,
        type: 'svg' as any
      });

      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;

      return {
        success: true,
        data: svgString,
        dataUrl,
        filename,
        format: OutputFormat.SVG,
        size: {
          width: highQualityWidth,
          height: highQualityWidth
        },
        timestamp: Date.now()
      };
    } else {
      // Generate high quality raster image using callback-based method
      const baseOptions = {
        errorCorrectionLevel: ErrorCorrectionLevel.HIGH,
        margin: Math.max(options.margin, 4),
        color: options.color,
        width: highQualityWidth,
        rendererOpts: {
          crisp: true,
          ...options.rendererOpts
        }
      };

      let qrDataUrl: string;
      let format: OutputFormat;

      // Use the safe callback-based method
      if (options.type === 'image/jpeg') {
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/jpeg',
          quality: Math.max(options.quality, 0.95)
        });
        format = OutputFormat.JPG;
      } else if (options.type === 'image/webp') {
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/webp',
          quality: Math.max(options.quality, 0.95)
        });
        format = OutputFormat.WEBP;
      } else {
        // Default to PNG
        qrDataUrl = await this.generateQRDataURL(data, {
          ...baseOptions,
          type: 'image/png'
        });
        format = OutputFormat.PNG;
      }

      return {
        success: true,
        data: qrDataUrl,
        dataUrl: qrDataUrl,
        filename,
        format,
        size: {
          width: highQualityWidth,
          height: highQualityWidth
        },
        timestamp: Date.now()
      };
    }
  }

  /**
   * Extract QR code metadata for analysis
   */
  private async extractMetadata(data: string, options: QROptions) {
    try {
      // This is a simplified metadata extraction
      // In a real implementation, you might use a QR code analysis library
      return {
        version: this.estimateQRVersion(data),
        errorCorrectionLevel: options.errorCorrectionLevel,
        maskPattern: 0, // QRCode library handles this automatically
        segments: [
          {
            data: data,
            mode: this.detectDataMode(data),
            numBits: data.length * 8 // Simplified calculation
          }
        ]
      };
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Estimate QR code version based on data length
   */
  private estimateQRVersion(data: string): number {
    const length = data.length;
    
    // Simplified version estimation for alphanumeric mode
    if (length <= 25) return 1;
    if (length <= 47) return 2;
    if (length <= 77) return 3;
    if (length <= 114) return 4;
    if (length <= 154) return 5;
    if (length <= 195) return 6;
    if (length <= 224) return 7;
    if (length <= 279) return 8;
    if (length <= 335) return 9;
    if (length <= 395) return 10;
    
    // Continue with more versions as needed
    return Math.min(Math.ceil(length / 40), 40); // Max version is 40
  }

  /**
   * Detect data mode based on content
   */
  private detectDataMode(data: string): string {
    if (/^[0-9]+$/.test(data)) return 'numeric';
    if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) return 'alphanumeric';
    return 'byte';
  }

  /**
   * Merge options with mode-specific defaults
   */
  private mergeOptions(mode: QRMode, userOptions: Partial<QROptions> = {}): QROptions {
    const modeDefaults = DEFAULT_OPTIONS_BY_MODE[mode] || {};
    
    return {
      ...this.defaultOptions,
      ...modeDefaults,
      ...userOptions,
      // Ensure color object is properly merged
      color: {
        ...this.defaultOptions.color,
        ...modeDefaults.color,
        ...userOptions.color
      }
    };
  }

  /**
   * Generate filename based on mode and timestamp
   */
  private generateFilename(mode: QRMode): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const modeString = mode.toLowerCase().replace('_', '-');
    return `qr-${modeString}-${timestamp}`;
  }

  /**
   * Get output format from options
   */
  private getFormatFromOptions(options: Partial<QROptions> = {}): OutputFormat {
    if (options.type === 'svg') return OutputFormat.SVG;
    return this.getFormatFromMimeType(options.type || this.defaultOptions.type);
  }

  /**
   * Convert MIME type to OutputFormat
   */
  private getFormatFromMimeType(mimeType: string): OutputFormat {
    switch (mimeType) {
      case 'image/png':
        return OutputFormat.PNG;
      case 'image/jpeg':
        return OutputFormat.JPG;
      case 'image/webp':
        return OutputFormat.WEBP;
      case 'image/svg+xml':
      case 'svg':
        return OutputFormat.SVG;
      default:
        return OutputFormat.PNG;
    }
  }

  /**
   * Validate QR generation request
   */
  static validateRequest(request: QRGenerationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!request.data || request.data.trim().length === 0) {
      errors.push('Data is required');
    }

    if (!request.mode || !Object.values(QRMode).includes(request.mode)) {
      errors.push('Valid mode is required');
    }

    // Check data length
    if (request.data && request.data.length > QR_LIMITS.MAX_DATA_LENGTH) {
      errors.push(`Data exceeds maximum length of ${QR_LIMITS.MAX_DATA_LENGTH} characters`);
    }

    // Validate options if provided
    if (request.options) {
      const { width, height, margin, quality } = request.options;

      if (width !== undefined && (width < QR_LIMITS.MIN_SIZE || width > QR_LIMITS.MAX_SIZE)) {
        errors.push(`Width must be between ${QR_LIMITS.MIN_SIZE} and ${QR_LIMITS.MAX_SIZE} pixels`);
      }

      if (height !== undefined && (height < QR_LIMITS.MIN_SIZE || height > QR_LIMITS.MAX_SIZE)) {
        errors.push(`Height must be between ${QR_LIMITS.MIN_SIZE} and ${QR_LIMITS.MAX_SIZE} pixels`);
      }

      if (margin !== undefined && (margin < QR_LIMITS.MIN_MARGIN || margin > QR_LIMITS.MAX_MARGIN)) {
        errors.push(`Margin must be between ${QR_LIMITS.MIN_MARGIN} and ${QR_LIMITS.MAX_MARGIN}`);
      }

      if (quality !== undefined && (quality < QR_LIMITS.MIN_QUALITY || quality > QR_LIMITS.MAX_QUALITY)) {
        errors.push(`Quality must be between ${QR_LIMITS.MIN_QUALITY} and ${QR_LIMITS.MAX_QUALITY}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported formats for a given mode
   */
  static getSupportedFormats(mode: QRMode): OutputFormat[] {
    switch (mode) {
      case QRMode.SVG:
        return [OutputFormat.SVG];
      case QRMode.BASIC:
      case QRMode.COLORED:
      case QRMode.HIGH_QUALITY:
        return [OutputFormat.PNG, OutputFormat.JPG, OutputFormat.WEBP, OutputFormat.SVG];
      default:
        return [OutputFormat.PNG];
    }
  }

  /**
   * Get MIME type for format
   */
  static getMimeType(format: OutputFormat): string {
    return FORMAT_MIME_TYPES[format] || 'image/png';
  }

  /**
   * Create QR generator instance with preset configuration
   */
  static createPreset(mode: QRMode): QRGenerator {
    const defaultOptions = DEFAULT_OPTIONS_BY_MODE[mode];
    return new QRGenerator(defaultOptions);
  }

  /**
   * Batch generate multiple QR codes
   */
  async generateBatch(requests: QRGenerationRequest[]): Promise<QRGenerationResponse[]> {
    const results: QRGenerationResponse[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.generate(request);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          filename: request.filename || this.generateFilename(request.mode),
          format: this.getFormatFromOptions(request.options),
          size: {
            width: request.options?.width || this.defaultOptions.width,
            height: request.options?.height || this.defaultOptions.height
          },
          error: formatErrorMessage(error),
          timestamp: Date.now()
        });
      }
    }
    
    return results;
  }
}

// Export default instance
export const defaultQRGenerator = new QRGenerator();

// Export utility functions
export const qrUtils = {
  validateRequest: QRGenerator.validateRequest,
  getSupportedFormats: QRGenerator.getSupportedFormats,
  getMimeType: QRGenerator.getMimeType,
  createPreset: QRGenerator.createPreset
};