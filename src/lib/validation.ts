// src/lib/validation.ts
import { 
  QRMode, 
  OutputFormat, 
  ErrorCorrectionLevel, 
  QRDataType,
  ValidationResult,
  QRGenerationRequest,
  QROptions,
  ColorOptions
} from '@/types/qr-types';
import { 
  isValidURL, 
  isValidEmail, 
  isValidPhone, 
  isValidWiFiConfig, 
  isValidHexColor 
} from '@/lib/utils';

// Validation patterns
export const VALIDATION_PATTERNS = {
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[0-9\(\)\-\s\.]{7,}$/,
  WIFI: /^WIFI:T:[^;]*;S:[^;]*;P:[^;]*;H?:[^;]*;?;?$/i,
  FILENAME: /^[a-zA-Z0-9_.-]+$/
};

// QR Code limits and constraints
export const QR_LIMITS = {
  MIN_SIZE: 100,
  MAX_SIZE: 2000,
  MIN_MARGIN: 0,
  MAX_MARGIN: 100,
  MIN_QUALITY: 0.1,
  MAX_QUALITY: 1.0,
  MAX_DATA_LENGTH: 4296,
  MIN_DATA_LENGTH: 1,
  DEFAULT_SIZE: 256,
  DEFAULT_MARGIN: 4,
  DEFAULT_QUALITY: 0.92
};

// Error messages
export const ERROR_MESSAGES = {
  EMPTY_DATA: 'Input data cannot be empty',
  DATA_TOO_LONG: `Data exceeds maximum length of ${QR_LIMITS.MAX_DATA_LENGTH} characters`,
  DATA_TOO_SHORT: `Data must be at least ${QR_LIMITS.MIN_DATA_LENGTH} character`,
  INVALID_URL: 'Invalid URL format. Use format: https://example.com',
  INVALID_EMAIL: 'Invalid email format. Use format: user@domain.com',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_WIFI: 'Invalid WiFi configuration format',
  INVALID_HEX_COLOR: 'Invalid hex color format. Use format: #RRGGBB',
  INVALID_SIZE: `Size must be between ${QR_LIMITS.MIN_SIZE} and ${QR_LIMITS.MAX_SIZE}`,
  INVALID_MARGIN: `Margin must be between ${QR_LIMITS.MIN_MARGIN} and ${QR_LIMITS.MAX_MARGIN}`,
  INVALID_QUALITY: `Quality must be between ${QR_LIMITS.MIN_QUALITY} and ${QR_LIMITS.MAX_QUALITY}`,
  INVALID_FILENAME: 'Invalid filename. Use only letters, numbers, dots, hyphens, and underscores',
  UNSUPPORTED_FORMAT: 'Unsupported output format',
  NETWORK_ERROR: 'Network error occurred',
  GENERATION_FAILED: 'QR code generation failed'
};

// Simple validation schema interface (alternative to Zod)
interface ValidationSchema<T> {
  parse(data: unknown): T;
  safeParse(data: unknown): { success: boolean; data?: T; error?: string };
}

// Simple validation implementation
class SimpleValidator<T> implements ValidationSchema<T> {
  constructor(private validator: (data: unknown) => T) {}

  parse(data: unknown): T {
    return this.validator(data);
  }

  safeParse(data: unknown): { success: boolean; data?: T; error?: string } {
    try {
      const result = this.validator(data);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      };
    }
  }
}

// Validation helper functions
function validateString(value: unknown, minLength = 0, maxLength = Infinity): string {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  if (value.length < minLength) {
    throw new Error(`String must be at least ${minLength} characters`);
  }
  if (value.length > maxLength) {
    throw new Error(`String must be no more than ${maxLength} characters`);
  }
  return value;
}

function validateNumber(value: unknown, min = -Infinity, max = Infinity): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a number');
  }
  if (value < min) {
    throw new Error(`Number must be at least ${min}`);
  }
  if (value > max) {
    throw new Error(`Number must be no more than ${max}`);
  }
  return value;
}

function validateEnum<T extends Record<string, string | number>>(
  value: unknown, 
  enumObject: T
): T[keyof T] {
  const enumValues = Object.values(enumObject);
  if (!enumValues.includes(value as T[keyof T])) {
    throw new Error(`Value must be one of: ${enumValues.join(', ')}`);
  }
  return value as T[keyof T];
}

function validateObject<T>(value: unknown, validator: (obj: any) => T): T {
  if (!value || typeof value !== 'object') {
    throw new Error('Value must be an object');
  }
  return validator(value);
}

// Validation schemas
export const hexColorSchema = new SimpleValidator<string>((data) => {
  const color = validateString(data);
  if (!isValidHexColor(color)) {
    throw new Error(ERROR_MESSAGES.INVALID_HEX_COLOR);
  }
  return color;
});

export const emailSchema = new SimpleValidator<string>((data) => {
  const email = validateString(data);
  if (!isValidEmail(email)) {
    throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
  }
  return email;
});

export const urlSchema = new SimpleValidator<string>((data) => {
  const url = validateString(data);
  if (!isValidURL(url)) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }
  return url;
});

export const phoneSchema = new SimpleValidator<string>((data) => {
  const phone = validateString(data);
  if (!isValidPhone(phone)) {
    throw new Error(ERROR_MESSAGES.INVALID_PHONE);
  }
  return phone;
});

export const wifiConfigSchema = new SimpleValidator<string>((data) => {
  const config = validateString(data);
  if (!isValidWiFiConfig(config)) {
    throw new Error(ERROR_MESSAGES.INVALID_WIFI);
  }
  return config;
});

// QR Options validation schema
export const qrOptionsSchema = new SimpleValidator<Partial<QROptions>>((data) => {
  return validateObject(data, (obj) => {
    const options: Partial<QROptions> = {};
    
    if (obj.width !== undefined) {
      options.width = validateNumber(obj.width, QR_LIMITS.MIN_SIZE, QR_LIMITS.MAX_SIZE);
    }
    
    if (obj.height !== undefined) {
      options.height = validateNumber(obj.height, QR_LIMITS.MIN_SIZE, QR_LIMITS.MAX_SIZE);
    }
    
    if (obj.margin !== undefined) {
      options.margin = validateNumber(obj.margin, QR_LIMITS.MIN_MARGIN, QR_LIMITS.MAX_MARGIN);
    }
    
    if (obj.color) {
      options.color = validateObject(obj.color, (colorObj) => {
        const color: ColorOptions = {
          dark: hexColorSchema.parse(colorObj.dark),
          light: hexColorSchema.parse(colorObj.light)
        };
        return color;
      });
    }
    
    if (obj.errorCorrectionLevel !== undefined) {
      options.errorCorrectionLevel = validateEnum(obj.errorCorrectionLevel, ErrorCorrectionLevel);
    }
    
    if (obj.type !== undefined) {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'svg'];
      if (!validTypes.includes(obj.type)) {
        throw new Error(`Type must be one of: ${validTypes.join(', ')}`);
      }
      options.type = obj.type;
    }
    
    if (obj.quality !== undefined) {
      options.quality = validateNumber(obj.quality, QR_LIMITS.MIN_QUALITY, QR_LIMITS.MAX_QUALITY);
    }
    
    if (obj.maskPattern !== undefined) {
      options.maskPattern = validateNumber(obj.maskPattern, 0, 7);
    }
    
    if (obj.version !== undefined) {
      options.version = validateNumber(obj.version, 1, 40);
    }
    
    if (obj.xmlDeclaration !== undefined) {
      if (typeof obj.xmlDeclaration !== 'boolean') {
        throw new Error('xmlDeclaration must be a boolean');
      }
      options.xmlDeclaration = obj.xmlDeclaration;
    }
    
    if (obj.rendererOpts) {
      options.rendererOpts = validateObject(obj.rendererOpts, (rendererObj) => {
        const opts: any = {};
        if (rendererObj.crisp !== undefined) {
          if (typeof rendererObj.crisp !== 'boolean') {
            throw new Error('crisp must be a boolean');
          }
          opts.crisp = rendererObj.crisp;
        }
        return opts;
      });
    }
    
    return options;
  });
});

// QR Generation Request validation schema
export const qrGenerationRequestSchema = new SimpleValidator<QRGenerationRequest>((data) => {
  return validateObject(data, (obj) => {
    const request: QRGenerationRequest = {
      data: validateString(obj.data, QR_LIMITS.MIN_DATA_LENGTH, QR_LIMITS.MAX_DATA_LENGTH),
      mode: validateEnum(obj.mode, QRMode),
      options: obj.options ? qrOptionsSchema.parse(obj.options) : {}
    };
    
    if (obj.filename !== undefined) {
      request.filename = validateString(obj.filename);
    }
    
    return request;
  });
});

// Form field validation schemas
export const qrDataInputSchema = new SimpleValidator<{ data: string; type: QRDataType }>((data) => {
  return validateObject(data, (obj) => ({
    data: validateString(obj.data, 1),
    type: validateEnum(obj.type, QRDataType)
  }));
});

export const colorOptionsSchema = new SimpleValidator<ColorOptions>((data) => {
  return validateObject(data, (obj) => ({
    dark: hexColorSchema.parse(obj.dark),
    light: hexColorSchema.parse(obj.light)
  }));
});

export const outputFormatSchema = new SimpleValidator<OutputFormat>((data) => {
  return validateEnum(data, OutputFormat);
});

export const filenameSchema = new SimpleValidator<string>((data) => {
  const filename = validateString(data, 1, 255);
  if (!VALIDATION_PATTERNS.FILENAME.test(filename.replace(/\.[^.]+$/, ''))) {
    throw new Error(ERROR_MESSAGES.INVALID_FILENAME);
  }
  return filename;
});

// Comprehensive validation functions

/**
 * Validates QR data based on its type
 */
export function validateQRData(data: string, type: QRDataType): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Basic validation
  if (!data || data.trim().length === 0) {
    result.isValid = false;
    result.errors.push(ERROR_MESSAGES.EMPTY_DATA);
    return result;
  }

  if (data.length > QR_LIMITS.MAX_DATA_LENGTH) {
    result.isValid = false;
    result.errors.push(ERROR_MESSAGES.DATA_TOO_LONG);
  }

  // Type-specific validation
  try {
    switch (type) {
      case QRDataType.URL:
        urlSchema.parse(data);
        if (!data.startsWith('http')) {
          result.warnings.push('URL without protocol may not work properly');
          result.suggestions.push('Consider adding https:// prefix');
        }
        break;

      case QRDataType.EMAIL:
        emailSchema.parse(data);
        break;

      case QRDataType.PHONE:
        phoneSchema.parse(data);
        break;

      case QRDataType.WIFI:
        wifiConfigSchema.parse(data);
        break;

      case QRDataType.TEXT:
      default:
        // Text doesn't need special validation beyond length
        break;
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(error instanceof Error ? error.message : 'Validation failed');
  }

  // Additional warnings and suggestions
  const hasSpecialChars = /[^\x00-\x7F]/.test(data);
  if (hasSpecialChars) {
    result.warnings.push('Contains non-ASCII characters which may increase QR code complexity');
  }

  if (data.length > 1000) {
    result.warnings.push('Large amount of data may result in complex QR code that\'s hard to scan');
    result.suggestions.push('Consider shortening the data or using a URL shortener');
  }

  return result;
}

/**
 * Validates color options
 */
export function validateColorOptions(colors: Partial<ColorOptions>): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  try {
    if (colors.dark) {
      hexColorSchema.parse(colors.dark);
    }
    
    if (colors.light) {
      hexColorSchema.parse(colors.light);
    }

    // Check color contrast
    if (colors.dark && colors.light) {
      if (colors.dark.toLowerCase() === colors.light.toLowerCase()) {
        result.isValid = false;
        result.errors.push('Foreground and background colors cannot be the same');
      } else if (getColorContrast(colors.dark, colors.light) < 3) {
        result.warnings.push('Low contrast between colors may affect scannability');
        result.suggestions.push('Use darker foreground or lighter background for better contrast');
      }
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(error instanceof Error ? error.message : 'Color validation failed');
  }

  return result;
}

/**
 * Validates QR generation options
 */
export function validateQROptions(options: Partial<QROptions>): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  try {
    qrOptionsSchema.parse(options);

    // Additional logical validations
    if (options.width && options.height && options.width !== options.height) {
      result.warnings.push('Non-square dimensions may cause display issues');
      result.suggestions.push('Use equal width and height for best results');
    }

    if (options.quality && options.quality < 0.8) {
      result.warnings.push('Low quality setting may result in pixelated output');
    }

    if (options.margin && options.margin === 0) {
      result.warnings.push('Zero margin may cause scanning issues');
      result.suggestions.push('Use at least 4 pixels margin for reliable scanning');
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(error instanceof Error ? error.message : 'Options validation failed');
  }

  return result;
}

/**
 * Validates complete QR generation request
 */
export function validateQRGenerationRequest(request: Partial<QRGenerationRequest>): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  try {
    qrGenerationRequestSchema.parse(request);

    // Cross-field validation
    if (request.data && request.options?.type === 'svg' && request.data.length > 1000) {
      result.warnings.push('Large data with SVG format may result in very large file size');
    }

    if (request.mode === QRMode.HIGH_QUALITY && request.options?.errorCorrectionLevel === ErrorCorrectionLevel.LOW) {
      result.warnings.push('High quality mode with low error correction may not provide expected reliability');
      result.suggestions.push('Consider using higher error correction level for high quality mode');
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(error instanceof Error ? error.message : 'Request validation failed');
  }

  return result;
}

/**
 * Sanitizes and validates filename
 */
export function validateAndSanitizeFilename(filename: string): { 
  filename: string; 
  isValid: boolean; 
  warnings: string[] 
} {
  const warnings: string[] = [];
  let sanitized = filename;

  // Remove invalid characters
  const originalLength = sanitized.length;
  sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '-');
  
  if (sanitized.length !== originalLength) {
    warnings.push('Invalid characters were replaced with dashes');
  }

  // Replace spaces with underscores
  if (sanitized.includes(' ')) {
    sanitized = sanitized.replace(/\s+/g, '_');
    warnings.push('Spaces were replaced with underscores');
  }

  // Remove multiple consecutive separators
  sanitized = sanitized.replace(/[-_]{2,}/g, '_');

  // Remove leading/trailing dots, dashes, underscores
  const trimmed = sanitized.replace(/^[.\-_]+/, '').replace(/[.\-_]+$/, '');
  if (trimmed !== sanitized) {
    sanitized = trimmed;
    warnings.push('Leading and trailing separators were removed');
  }

  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
    warnings.push('Filename was truncated to 200 characters');
  }

  // Ensure minimum length
  if (sanitized.length === 0) {
    sanitized = 'qr-code';
    warnings.push('Empty filename was replaced with default name');
  }

  const isValid = VALIDATION_PATTERNS.FILENAME.test(sanitized.replace(/\.[^.]+$/, ''));

  return {
    filename: sanitized,
    isValid,
    warnings
  };
}

/**
 * Get comprehensive validation for all QR generation parameters
 */
export function validateAllQRParams(params: {
  data: string;
  type: QRDataType;
  mode: QRMode;
  options: Partial<QROptions>;
  filename?: string;
}): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Validate data
  const dataValidation = validateQRData(params.data, params.type);
  result.errors.push(...dataValidation.errors);
  result.warnings.push(...dataValidation.warnings);
  result.suggestions.push(...dataValidation.suggestions);

  // Validate options
  const optionsValidation = validateQROptions(params.options);
  result.errors.push(...optionsValidation.errors);
  result.warnings.push(...optionsValidation.warnings);
  result.suggestions.push(...optionsValidation.suggestions);

  // Validate colors if present
  if (params.options.color) {
    const colorValidation = validateColorOptions(params.options.color);
    result.errors.push(...colorValidation.errors);
    result.warnings.push(...colorValidation.warnings);
    result.suggestions.push(...colorValidation.suggestions);
  }

  // Validate filename if present
  if (params.filename) {
    const filenameValidation = validateAndSanitizeFilename(params.filename);
    if (!filenameValidation.isValid) {
      result.errors.push('Invalid filename format');
    }
    result.warnings.push(...filenameValidation.warnings);
  }

  result.isValid = result.errors.length === 0;

  return result;
}

// Helper functions

/**
 * Calculate color contrast ratio (simplified)
 */
function getColorContrast(color1: string, color2: string): number {
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;

  // Calculate relative luminance
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  // Calculate contrast ratio
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Validate API response format
 */
export function validateAPIResponse(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Check for required fields based on response type
  if (response.success === false) {
    return typeof response.error === 'string';
  }

  if (response.success === true) {
    return (
      (typeof response.data === 'string' || response.data instanceof ArrayBuffer) &&
      typeof response.format === 'string' &&
      typeof response.filename === 'string'
    );
  }

  return false;
}

/**
 * Create validation error message from multiple errors
 */
export function createValidationErrorMessage(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return `Multiple validation errors:\n• ${errors.join('\n• ')}`;
}

/**
 * Check if validation result has critical errors
 */
export function hasCriticalErrors(result: ValidationResult): boolean {
  const criticalErrorKeywords = ['cannot be empty', 'exceeds maximum', 'invalid format'];
  
  return result.errors.some(error => 
    criticalErrorKeywords.some(keyword => 
      error.toLowerCase().includes(keyword)
    )
  );
}

/**
 * Get validation summary for display
 */
export function getValidationSummary(result: ValidationResult): {
  status: 'valid' | 'warning' | 'error';
  message: string;
  details: string[];
} {
  if (!result.isValid) {
    return {
      status: 'error',
      message: `${result.errors.length} error(s) found`,
      details: result.errors
    };
  }

  if (result.warnings.length > 0) {
    return {
      status: 'warning',
      message: `${result.warnings.length} warning(s)`,
      details: result.warnings
    };
  }

  return {
    status: 'valid',
    message: 'All validations passed',
    details: []
  };
}