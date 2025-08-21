// src/lib/constants.ts
import { 
  QRMode, 
  OutputFormat, 
  ErrorCorrectionLevel, 
  QROptions,
  ColorOption,
  QRModeConfig,
  FormatMimeTypes,
  defaultQROptions
} from '@/types/qr-types';
import { QRFormatOption, QRErrorCorrectionOption, QRModeOption } from '@/lib/types';

// Application Constants with environment variable support
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'QR Generator Web',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  description: 'Professional QR Code Generator with Advanced Features',
  author: 'QR Generator Team',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://qr-generator-web-iota.vercel.app/',
  repository: 'https://github.com/username/qr-generator-web'
} as const;

// QR Code Limits and Constraints
export const QR_LIMITS = {
  MAX_DATA_LENGTH: parseInt(process.env.NEXT_PUBLIC_MAX_INPUT_LENGTH || '4296'),
  MAX_NUMERIC_LENGTH: 7089,
  MAX_BINARY_LENGTH: 2953,
  MIN_SIZE: 64,
  MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_QR_SIZE || '2048'),
  DEFAULT_SIZE: parseInt(process.env.NEXT_PUBLIC_DEFAULT_QR_SIZE || '256'),
  MIN_MARGIN: 0,
  MAX_MARGIN: 10,
  DEFAULT_MARGIN: 2,
  MIN_QUALITY: 0.1,
  MAX_QUALITY: 1.0,
  DEFAULT_QUALITY: 0.92
} as const;

// Default Color Palette
export const DEFAULT_COLORS: ColorOption[] = [
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#ffffff' },
  { name: 'Navy Blue', value: 'navy', hex: '#1e3a8a' },
  { name: 'Royal Blue', value: 'blue', hex: '#3b82f6' },
  { name: 'Sky Blue', value: 'sky', hex: '#0ea5e9' },
  { name: 'Emerald', value: 'emerald', hex: '#10b981' },
  { name: 'Green', value: 'green', hex: '#22c55e' },
  { name: 'Lime', value: 'lime', hex: '#84cc16' },
  { name: 'Yellow', value: 'yellow', hex: '#eab308' },
  { name: 'Amber', value: 'amber', hex: '#f59e0b' },
  { name: 'Orange', value: 'orange', hex: '#f97316' },
  { name: 'Red', value: 'red', hex: '#ef4444' },
  { name: 'Pink', value: 'pink', hex: '#ec4899' },
  { name: 'Purple', value: 'purple', hex: '#a855f7' },
  { name: 'Indigo', value: 'indigo', hex: '#6366f1' },
  { name: 'Gray', value: 'gray', hex: '#6b7280' },
  { name: 'Slate', value: 'slate', hex: '#64748b' },
  { name: 'Zinc', value: 'zinc', hex: '#71717a' }
];

// Popular Color Combinations
export const POPULAR_COLOR_COMBINATIONS = [
  { name: 'Classic', foreground: '#000000', background: '#ffffff' },
  { name: 'Inverted', foreground: '#ffffff', background: '#000000' },
  { name: 'Ocean', foreground: '#1e40af', background: '#f0f9ff' },
  { name: 'Forest', foreground: '#166534', background: '#f0fdf4' },
  { name: 'Sunset', foreground: '#dc2626', background: '#fef2f2' },
  { name: 'Royal', foreground: '#7c3aed', background: '#faf5ff' },
  { name: 'Modern', foreground: '#374151', background: '#f9fafb' },
  { name: 'Corporate', foreground: '#1f2937', background: '#f3f4f6' }
];

// QR Size Options
export const QR_SIZE_OPTIONS = [
  { value: 128, label: '128×128', description: 'Small - Good for digital use' },
  { value: 256, label: '256×256', description: 'Medium - Recommended for most uses' },
  { value: 512, label: '512×512', description: 'Large - Good for printing' },
  { value: 1024, label: '1024×1024', description: 'Extra Large - High resolution printing' },
  { value: 2048, label: '2048×2048', description: 'Maximum - Professional printing' }
];

// Error Correction Level Options
export const ERROR_CORRECTION_OPTIONS: QRErrorCorrectionOption[] = [
  {
    value: ErrorCorrectionLevel.LOW,
    label: 'Low (~7%)',
    description: 'Can recover from up to 7% damage',
    recoveryPercentage: '~7%'
  },
  {
    value: ErrorCorrectionLevel.MEDIUM,
    label: 'Medium (~15%)',
    description: 'Can recover from up to 15% damage',
    recoveryPercentage: '~15%',
    recommended: true
  },
  {
    value: ErrorCorrectionLevel.QUARTILE,
    label: 'Quartile (~25%)',
    description: 'Can recover from up to 25% damage',
    recoveryPercentage: '~25%'
  },
  {
    value: ErrorCorrectionLevel.HIGH,
    label: 'High (~30%)',
    description: 'Can recover from up to 30% damage',
    recoveryPercentage: '~30%'
  }
];

// Get default error correction from environment
const getDefaultErrorCorrection = (): ErrorCorrectionLevel => {
  const envValue = process.env.NEXT_PUBLIC_DEFAULT_ERROR_CORRECTION;
  switch (envValue) {
    case 'L': return ErrorCorrectionLevel.LOW;
    case 'M': return ErrorCorrectionLevel.MEDIUM;
    case 'Q': return ErrorCorrectionLevel.QUARTILE;
    case 'H': return ErrorCorrectionLevel.HIGH;
    default: return ErrorCorrectionLevel.MEDIUM;
  }
};

// QR Mode Configuration
export const QR_MODE_CONFIG: QRModeConfig = {
  [QRMode.BASIC]: {
    name: 'Basic',
    description: 'Simple black and white QR code',
    features: ['Fast generation', 'Smallest file size', 'Universal compatibility'],
    defaultOptions: {
      width: QR_LIMITS.DEFAULT_SIZE,
      height: QR_LIMITS.DEFAULT_SIZE,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: getDefaultErrorCorrection()
    }
  },
  [QRMode.COLORED]: {
    name: 'Colored',
    description: 'Customizable foreground and background colors',
    features: ['Custom colors', 'Brand matching', 'Visual appeal'],
    defaultOptions: {
      width: QR_LIMITS.DEFAULT_SIZE,
      height: QR_LIMITS.DEFAULT_SIZE,
      color: { dark: '#1e40af', light: '#f0f9ff' },
      errorCorrectionLevel: getDefaultErrorCorrection()
    }
  },
  [QRMode.SVG]: {
    name: 'Vector (SVG)',
    description: 'Scalable vector format for perfect quality at any size',
    features: ['Infinite scalability', 'Small file size', 'Perfect for printing'],
    defaultOptions: {
      width: QR_LIMITS.DEFAULT_SIZE,
      height: QR_LIMITS.DEFAULT_SIZE,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: getDefaultErrorCorrection(),
      type: 'svg' as const
    }
  },
  [QRMode.HIGH_QUALITY]: {
    name: 'High Quality',
    description: 'Maximum error correction for damaged or dirty surfaces',
    features: ['30% error recovery', 'Robust scanning', 'Professional use'],
    defaultOptions: {
      width: 512,
      height: 512,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: ErrorCorrectionLevel.HIGH
    }
  }
};

// QR Mode Options for UI
export const QR_MODE_OPTIONS: QRModeOption[] = [
  {
    value: QRMode.BASIC,
    label: 'Basic',
    description: 'Simple black & white QR code'
  },
  {
    value: QRMode.COLORED,
    label: 'Colored',
    description: 'Custom foreground & background colors'
  },
  {
    value: QRMode.SVG,
    label: 'Vector (SVG)',
    description: 'Scalable vector format'
  },
  {
    value: QRMode.HIGH_QUALITY,
    label: 'High Quality',
    description: 'Maximum error correction'
  }
];

// Output Format Configuration
export const FORMAT_MIME_TYPES: FormatMimeTypes = {
  [OutputFormat.PNG]: 'image/png',
  [OutputFormat.JPG]: 'image/jpeg',
  [OutputFormat.JPEG]: 'image/jpeg',
  [OutputFormat.SVG]: 'image/svg+xml',
  [OutputFormat.WEBP]: 'image/webp'
};

// Format Options for UI
export const FORMAT_OPTIONS: QRFormatOption[] = [
  {
    value: OutputFormat.PNG,
    label: 'PNG',
    description: 'High quality with transparency support',
    mimeType: 'image/png',
    extension: 'png',
    supportsTransparency: true,
    supportsAnimation: false
  },
  {
    value: OutputFormat.JPG,
    label: 'JPG',
    description: 'Compressed format, smaller file size',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    supportsTransparency: false,
    supportsAnimation: false
  },
  {
    value: OutputFormat.SVG,
    label: 'SVG',
    description: 'Vector format, perfect for any size',
    mimeType: 'image/svg+xml',
    extension: 'svg',
    supportsTransparency: true,
    supportsAnimation: true
  },
  {
    value: OutputFormat.WEBP,
    label: 'WebP',
    description: 'Modern format with superior compression',
    mimeType: 'image/webp',
    extension: 'webp',
    supportsTransparency: true,
    supportsAnimation: true
  }
];

// Default QR Generation Options per Mode
export const DEFAULT_OPTIONS_BY_MODE: Record<QRMode, Partial<QROptions>> = {
  [QRMode.BASIC]: {
    ...defaultQROptions,
    width: QR_LIMITS.DEFAULT_SIZE,
    height: QR_LIMITS.DEFAULT_SIZE,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: getDefaultErrorCorrection()
  },
  [QRMode.COLORED]: {
    ...defaultQROptions,
    width: QR_LIMITS.DEFAULT_SIZE,
    height: QR_LIMITS.DEFAULT_SIZE,
    color: { dark: '#1e40af', light: '#f0f9ff' },
    errorCorrectionLevel: getDefaultErrorCorrection()
  },
  [QRMode.SVG]: {
    ...defaultQROptions,
    width: QR_LIMITS.DEFAULT_SIZE,
    height: QR_LIMITS.DEFAULT_SIZE,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: getDefaultErrorCorrection(),
    type: 'image/png'
  },
  [QRMode.HIGH_QUALITY]: {
    ...defaultQROptions,
    width: 512,
    height: 512,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: ErrorCorrectionLevel.HIGH
  }
};

// Input Validation Constants
export const VALIDATION_PATTERNS = {
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[0-9\(\)\-\s\.]{7,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  WIFI: /^WIFI:T:[^;]*;S:[^;]*;P:[^;]*;H?:[^;]*;?;?$/i
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  EMPTY_DATA: 'Input data cannot be empty',
  DATA_TOO_LONG: `Input data exceeds maximum length (${QR_LIMITS.MAX_DATA_LENGTH} characters)`,
  INVALID_URL: 'Invalid URL format',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_WIFI: 'Invalid WiFi configuration format',
  INVALID_COLOR: 'Invalid color format',
  GENERATION_FAILED: 'QR code generation failed',
  DOWNLOAD_FAILED: 'Download failed',
  UNSUPPORTED_FORMAT: 'Unsupported output format',
  NETWORK_ERROR: 'Network connection error',
  UNKNOWN_ERROR: 'An unexpected error occurred'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  QR_GENERATED: 'QR code generated successfully',
  QR_DOWNLOADED: 'QR code downloaded successfully',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
  SETTINGS_SAVED: 'Settings saved successfully'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  QR_HISTORY: 'qr_generation_history',
  USER_PREFERENCES: 'user_preferences',
  COLOR_PRESETS: 'custom_color_presets',
  RECENT_COLORS: 'recent_colors',
  ANALYTICS: 'qr_analytics'
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  EXTRA_SLOW: 500
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1010,
  FIXED: 1020,
  MODAL_BACKDROP: 1030,
  MODAL: 1040,
  POPOVER: 1050,
  TOOLTIP: 1060,
  TOAST: 1070
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_APP_URL || '') + '/api'
    : 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID,
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  ENABLE_PERFORMANCE_METRICS: process.env.NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS === 'true',
  ENABLE_PWA: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_BATCH_GENERATION: false, // Future feature
  ENABLE_QR_TEMPLATES: false,     // Future feature
  ENABLE_BRAND_CUSTOMIZATION: false // Future feature
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,           // Input debounce delay
  THROTTLE_DELAY: 100,           // Scroll/resize throttle delay
  LAZY_LOAD_THRESHOLD: '10px',   // Intersection observer threshold
  MAX_HISTORY_ITEMS: 50,         // Maximum items in generation history
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache duration
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB default
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
} as const;

// SEO and Meta Configuration
export const SEO_CONFIG = {
  TITLE: `${APP_CONFIG.name} - Professional QR Code Generator`,
  DESCRIPTION: 'Create high-quality QR codes with custom colors, formats, and error correction. Free online QR code generator with SVG, PNG, and JPG export options.',
  KEYWORDS: ['QR code', 'QR generator', 'QR code creator', 'custom QR code', 'vector QR code', 'free QR generator'],
  AUTHOR: 'QR Generator Pro Team',
  CANONICAL_URL: APP_CONFIG.url,
  OG_IMAGE: '/og-image.png',
  TWITTER_CARD: 'summary_large_image'
} as const;