// src/lib/utils.ts
import { QRDataType, ValidationResult } from '@/types/qr-types';

/**
 * Utility function for combining and merging class names
 * Simple implementation without external dependencies
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates different types of QR input data
 */
export function validateQRInput(data: string, type: QRDataType = QRDataType.TEXT): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Basic validation
  if (!data || data.trim().length === 0) {
    result.isValid = false;
    result.errors.push('Input data cannot be empty');
    return result;
  }

  // Length validation
  const maxLength = 4296; // QR Code maximum capacity for alphanumeric
  if (data.length > maxLength) {
    result.isValid = false;
    result.errors.push(`Input data exceeds maximum length of ${maxLength} characters`);
  }

  // Type-specific validation
  switch (type) {
    case QRDataType.URL:
      if (!isValidURL(data)) {
        result.isValid = false;
        result.errors.push('Invalid URL format');
        result.suggestions.push('URL should start with http:// or https://');
      } else if (!data.startsWith('http')) {
        result.warnings.push('URL without protocol may not work properly');
        result.suggestions.push('Consider adding https:// prefix');
      }
      break;

    case QRDataType.EMAIL:
      if (!isValidEmail(data)) {
        result.isValid = false;
        result.errors.push('Invalid email format');
        result.suggestions.push('Email should be in format: user@domain.com');
      }
      break;

    case QRDataType.PHONE:
      if (!isValidPhone(data)) {
        result.isValid = false;
        result.errors.push('Invalid phone number format');
        result.suggestions.push('Phone should contain only numbers, +, -, (, ), and spaces');
      }
      break;

    case QRDataType.WIFI:
      if (!isValidWiFiConfig(data)) {
        result.isValid = false;
        result.errors.push('Invalid WiFi configuration format');
        result.suggestions.push('WiFi config should be: WIFI:T:WPA;S:NetworkName;P:Password;;');
      }
      break;
  }

  // Character encoding warnings
  const hasSpecialChars = /[^\x00-\x7F]/.test(data);
  if (hasSpecialChars) {
    result.warnings.push('Contains non-ASCII characters which may increase QR code complexity');
  }

  // Length warnings
  if (data.length > 1000) {
    result.warnings.push('Large amount of data may result in complex QR code that\'s hard to scan');
  }

  return result;
}

/**
 * Validates URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Try with protocol if missing
    try {
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\(\)\-\s\.]{7,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates WiFi configuration format
 */
export function isValidWiFiConfig(config: string): boolean {
  const wifiRegex = /^WIFI:T:[^;]*;S:[^;]*;P:[^;]*;H?:[^;]*;?;?$/i;
  return wifiRegex.test(config);
}

/**
 * Validates hex color format
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/;
  return hexRegex.test(color);
}

/**
 * Converts various color formats to hex
 */
export function toHexColor(color: string): string {
  // Already hex
  if (color.startsWith('#')) {
    return color;
  }

  // RGB format
  if (color.startsWith('rgb')) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const [r, g, b] = matches.map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
  }

  // Named colors
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    gray: '#808080',
    grey: '#808080'
  };

  return namedColors[color.toLowerCase()] || color;
}

/**
 * Generates unique filename with timestamp
 */
export function generateUniqueFilename(prefix: string = 'qr-code', extension: string = 'png'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomSuffix}.${extension}`;
}

/**
 * Sanitizes filename for safe download
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '-') // Replace invalid chars with dash
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[.\-_]+/, '') // Remove leading dots, dashes, underscores
    .replace(/[.\-_]+$/, '') // Remove trailing dots, dashes, underscores
    .substring(0, 200); // Limit length
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats error messages for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Debounce function for limiting function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null;
  
  const debounced = function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    }, wait);
    
    if (callNow) func.apply(this, args);
  } as T & { cancel: () => void };

  debounced.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Throttle function for limiting function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;
  
  const throttled = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  } as T & { cancel: () => void };

  throttled.cancel = function () {
    inThrottle = false;
  };

  return throttled;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert data URL to Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Convert Blob to data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Download file from data URL or Blob
 */
export function downloadFile(data: string | Blob, filename: string, mimeType?: string): void {
  const link = document.createElement('a');
  
  if (typeof data === 'string') {
    link.href = data;
  } else {
    const url = URL.createObjectURL(data);
    link.href = url;
  }
  
  link.download = filename;
  if (mimeType) {
    link.type = mimeType;
  }
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up object URL if created
  if (typeof data !== 'string') {
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (!isBrowser()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false;
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      
      document.body.prepend(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        return true;
      } catch (error) {
        console.error('Failed to copy text: ', error);
        return false;
      } finally {
        textArea.remove();
      }
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
}

/**
 * Wait for specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Create safe object access function
 */
export function get<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result != null ? result : defaultValue;
}

/**
 * Set value at object path
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

/**
 * Merge objects deeply
 */
export function mergeDeep<T extends Record<string, any>>(target: T, ...sources: Array<Partial<T> | undefined>): T {
  if (!sources.length) return target;
  
  for (const source of sources) {
    if (!source) continue;
    
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        const sourceValue = source[key];
        if (isObject(sourceValue)) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], sourceValue);
        } else {
          Object.assign(target, { [key]: sourceValue });
        }
      }
    }
  }

  return target;
}

/**
 * Check if value is object
 */
export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Format number with locale
 */
export function formatNumber(num: number, locale: string = 'en-US', options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Format date with locale
 */
export function formatDate(date: Date | string | number, locale: string = 'en-US', options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string | number, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateObj, locale, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Validate and normalize URL
 */
export function normalizeURL(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(normalizeURL(url));
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Check if string is JSON
 */
export function isJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}