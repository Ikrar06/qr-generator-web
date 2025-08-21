// src/types/qr-types.ts
import { ReactNode } from 'react';

// QR Generation Mode Types
export enum QRMode {
  BASIC = 'basic',
  COLORED = 'colored',
  SVG = 'svg',
  HIGH_QUALITY = 'hq'
}

// Error Correction Levels (from QRCode library)
export enum ErrorCorrectionLevel {
  LOW = 'L',      // ~7%
  MEDIUM = 'M',   // ~15%
  QUARTILE = 'Q', // ~25%
  HIGH = 'H'      // ~30%
}

// Output Format Types
export enum OutputFormat {
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg',
  SVG = 'svg',
  WEBP = 'webp'
}

// QR Data Input Types
export enum QRDataType {
  TEXT = 'text',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WIFI = 'wifi',
  VCARD = 'vcard'
}

// Color Option Interface
export interface ColorOption {
  name: string;
  value: string;
  hex: string;
}

// Color Options Interface for QR Generation
export interface ColorOptions {
  dark: string;    // Foreground color
  light: string;   // Background color
}

// QR Generation Options Interface
export interface QROptions {
  // Basic options
  width: number;
  height: number;
  margin: number;
  
  // Color options
  color: ColorOptions;
  
  // Quality options
  errorCorrectionLevel: ErrorCorrectionLevel;
  type: 'image/png' | 'image/jpeg' | 'image/webp' | 'svg';
  quality: number;  // 0.1 to 1.0 for JPEG/WEBP
  
  // Advanced options
  maskPattern?: number; // 0-7
  version?: number;     // 1-40, auto if not specified
  
  // SVG specific options
  xmlDeclaration?: boolean;
  
  // Canvas specific options
  rendererOpts?: {
    crisp?: boolean;
  };
}

// Default QR Options
export const defaultQROptions: QROptions = {
  width: 256,
  height: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff'
  },
  errorCorrectionLevel: ErrorCorrectionLevel.MEDIUM,
  type: 'image/png',
  quality: 0.92,
  xmlDeclaration: true,
  rendererOpts: {
    crisp: true
  }
};

// QR Generation Request Interface
export interface QRGenerationRequest {
  data: string;
  mode: QRMode;
  options: Partial<QROptions>;
  filename?: string;
}

// QR Generation Response Interface
export interface QRGenerationResponse {
  success: boolean;
  data?: string | Buffer;  // Base64 string or Buffer
  dataUrl?: string;        // Data URL for preview
  filename: string;
  format: OutputFormat;
  size: {
    width: number;
    height: number;
  };
  metadata?: {
    version: number;
    errorCorrectionLevel: string;
    maskPattern: number;
    segments: Array<{
      data: string;
      mode: string;
      numBits: number;
    }>;
  };
  error?: string;
  timestamp: number;
}

// QR Data Input Interface
export interface QRDataInput {
  type: QRDataType;
  value: string;
  isValid: boolean;
  errors: string[];
}

// Validation Result Interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// QR Generation State Interface (for React hooks)
export interface QRGenerationState {
  isGenerating: boolean;
  isDownloading: boolean;
  currentQR: QRGenerationResponse | null;
  error: string | null;
  history: QRGenerationResponse[];
}

// Form State Interface
export interface QRFormState {
  data: string;
  mode: QRMode;
  format: OutputFormat;
  colors: {
    foreground: string;
    background: string;
  };
  size: number;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
  quality: number;
}

// Default Form State
export const defaultFormState: QRFormState = {
  data: '',
  mode: QRMode.BASIC,
  format: OutputFormat.PNG,
  colors: {
    foreground: '#000000',
    background: '#ffffff'
  },
  size: 256,
  errorCorrection: ErrorCorrectionLevel.MEDIUM,
  margin: 2,
  quality: 0.92
};

// Progress State Interface
export interface ProgressState {
  stage: 'idle' | 'validating' | 'generating' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

// API Error Response Interface
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  requestId?: string;
}

// File Download Interface
export interface DownloadOptions {
  filename: string;
  format: OutputFormat;
  data: string | Blob;
  mimeType: string;
}

// Color Palette Interface
export interface ColorPalette {
  name: string;
  colors: ColorOption[];
  category: 'basic' | 'gradient' | 'theme' | 'custom';
}

// QR Analytics Interface (for tracking usage)
export interface QRAnalytics {
  generationCount: number;
  popularModes: Record<QRMode, number>;
  popularFormats: Record<OutputFormat, number>;
  averageDataLength: number;
  errorRate: number;
  lastGenerated: number;
}

// Component Props Interfaces
export interface QRComponentProps {
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface QRInputProps extends QRComponentProps {
  value: string;
  onChange: (value: string) => void;
  onValidate?: (result: ValidationResult) => void;
  placeholder?: string;
  maxLength?: number;
  dataType?: QRDataType;
}

export interface QRPreviewProps extends QRComponentProps {
  qrData: QRGenerationResponse | null;
  showMetadata?: boolean;
  allowZoom?: boolean;
  onError?: (error: string) => void;
}

// Type Guards
export const isValidQRMode = (mode: string): mode is QRMode => {
  return Object.values(QRMode).includes(mode as QRMode);
};

export const isValidOutputFormat = (format: string): format is OutputFormat => {
  return Object.values(OutputFormat).includes(format as OutputFormat);
};

export const isValidErrorCorrectionLevel = (level: string): level is ErrorCorrectionLevel => {
  return Object.values(ErrorCorrectionLevel).includes(level as ErrorCorrectionLevel);
};

// Utility Types
export type QRModeConfig = {
  [K in QRMode]: {
    name: string;
    description: string;
    features: string[];
    defaultOptions: Partial<QROptions>;
  };
};

export type FormatMimeTypes = {
  [K in OutputFormat]: string;
};

export type QRGenerationHookReturn = {
  // State
  state: QRGenerationState;
  progress: ProgressState; // Add progress property
  
  // Core functionality
  generate: (request: QRGenerationRequest) => Promise<QRGenerationResponse>;
  generatePreview: (request: QRGenerationRequest) => void;
  generateDebounced: ((request: QRGenerationRequest) => void) & { cancel: () => void };
  generateBatch: (requests: QRGenerationRequest[]) => Promise<QRGenerationResponse[]>;
  download: (response: QRGenerationResponse, options?: Partial<DownloadOptions>) => Promise<void>;
  clear: () => void;
  retry: () => Promise<QRGenerationResponse | null>;
  cancel: () => void;

  // History management
  getFromHistory: (timestamp: number) => QRGenerationResponse | null;
  removeFromHistory: (timestamp: number) => void;
  clearHistory: () => void;

  // Utilities
  updateSettings: (options: Partial<any>) => void;
  getSupportedFormats: (mode: QRMode) => OutputFormat[];
  validateRequest: (request: QRGenerationRequest) => { isValid: boolean; errors: string[] };
  getStats: () => {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    formatBreakdown: Record<OutputFormat, number>;
    modeBreakdown: Record<string, number>;
    averageGenerationTime: number;
    lastGenerated: number | null;
  };

  // Status checks
  isGenerating: boolean;
  isDownloading: boolean;
  hasError: boolean;
  hasCurrentQR: boolean;
  historyCount: number;
};

// Additional utility types from component-types.ts
export type Exact<T, U extends T = T> = T & {
  [K in keyof T]: K extends keyof U ? U[K] : never;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Keys>>;
}[Keys];

// Base component types
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

export interface BaseInteractiveProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Additional component types that might be used in QR application
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends BaseInteractiveProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input component types
export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends BaseInteractiveProps {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

// Textarea component types
export interface TextareaProps extends BaseInteractiveProps {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  fullWidth?: boolean;
}

// Card component types
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outline' | 'filled' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

// Toast component types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastProps extends BaseComponentProps {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 for persistent
  position?: ToastPosition;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Form state management types
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  isValidating: boolean;
}

export interface FormState<T extends Record<string, any> = Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
  errors: Partial<Record<keyof T, string>>;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  timestamp: number;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error handling types
export interface ErrorInfo {
  code: string;
  message: string;
  field?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  context?: Record<string, any>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

// Loading and async state types
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
  stage?: string;
}

// File handling types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
}

export interface UploadState extends LoadingState {
  file: File | null;
  progress: number;
  uploaded: boolean;
  url?: string;
}

// Color picker types
export interface ColorPickerProps extends BaseInteractiveProps {
  value: string;
  onChange: (color: string) => void;
  format?: 'hex' | 'rgb' | 'hsl';
  showPresets?: boolean;
  presets?: string[];
  showAlpha?: boolean;
  showInput?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  alpha: number;
  name?: string;
}

// QR-specific component types
export interface QRModeOption {
  value: QRMode;
  label: string;
  description: string;
  icon?: ReactNode;
  disabled?: boolean;
  premium?: boolean;
}

export interface QRFormatOption {
  value: OutputFormat;
  label: string;
  description: string;
  mimeType: string;
  extension: string;
  supportsTransparency: boolean;
  supportsAnimation: boolean;
  icon?: ReactNode;
}

export interface QRErrorCorrectionOption {
  value: ErrorCorrectionLevel;
  label: string;
  description: string;
  recoveryPercentage: string;
  recommended?: boolean;
}

// Tab component types
export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  badge?: string | number;
  icon?: ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// Dropdown/Select component types
export interface SelectOption<T = any> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
}

export interface SelectProps<T = any> extends BaseInteractiveProps {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  groupBy?: string;
  renderOption?: (option: SelectOption<T>) => ReactNode;
  renderValue?: (value: T) => ReactNode;
  noOptionsMessage?: string;
}

// Theme and styling types
export interface ThemeConfig {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    error: Record<string, string>;
    neutral: Record<string, string>;
  };
  fonts: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
}

// Analytics and tracking types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Utility function return types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler<T> = (value: T) => void;
export type SubmitHandler<T> = (data: T) => void | Promise<void>;

// Responsive value types
export type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T };

export interface BreakpointValues<T> {
  base: T;
  sm: T;
  md: T;
  lg: T;
  xl: T;
  '2xl': T;
}

// Hook return types
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export interface UseCopyToClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  cancel: () => void;
  flush: () => void;
}

export interface UseMediaQueryReturn {
  matches: boolean;
  media: string;
}

// QR-specific advanced types
export interface QRCodeMetrics {
  dataCapacity: number;
  usedCapacity: number;
  efficiency: number;
  complexity: 'low' | 'medium' | 'high';
  scanDistance: {
    min: string;
    max: string;
    optimal: string;
  };
}

export interface QRCustomizationOptions {
  logo?: {
    image: string | File;
    size: number; // percentage of QR code
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    borderRadius: number;
    border?: {
      width: number;
      color: string;
    };
  };
  pattern?: {
    dataPattern: 'square' | 'circle' | 'rounded' | 'diamond';
    eyePattern: 'square' | 'circle' | 'rounded';
    eyeColor?: string;
  };
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    direction?: number; // degrees for linear
    stops?: number[]; // color stop positions
  };
  frame?: {
    style: 'none' | 'square' | 'rounded' | 'circle';
    color: string;
    width: number;
    text?: {
      content: string;
      position: 'top' | 'bottom';
      font: string;
      size: number;
      color: string;
    };
  };
}

export interface QRBatchGenerationRequest {
  items: Array<{
    data: string;
    filename?: string;
    customization?: QRCustomizationOptions;
  }>;
  commonOptions: Partial<QROptions>;
  format: OutputFormat;
  zipFilename?: string;
}

export interface QRBatchGenerationResponse {
  success: boolean;
  items: QRGenerationResponse[];
  zipFile?: {
    data: string | Buffer;
    filename: string;
    size: number;
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  };
  timestamp: number;
}

// WiFi QR specific types
export interface WiFiConfig {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

// vCard QR specific types
export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// SMS QR specific types
export interface SMSData {
  phone: string;
  message: string;
}

// Event QR specific types
export interface EventData {
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  description?: string;
}

// QR Template types
export interface QRTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'personal' | 'marketing' | 'event' | 'utility';
  preview: string; // base64 image
  options: Partial<QROptions>;
  customization?: QRCustomizationOptions;
  dataTemplate?: string; // template with placeholders
  variables?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'url' | 'date';
    required: boolean;
    placeholder?: string;
    validation?: string; // regex pattern
  }>;
}

// QR History types
export interface QRHistoryItem extends QRGenerationResponse {
  id: string;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
  tags: string[];
  favorite: boolean;
  note?: string;
}

export interface QRHistoryFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  formats?: OutputFormat[];
  modes?: QRMode[];
  tags?: string[];
  favorite?: boolean;
  searchTerm?: string;
}

// QR Sharing types
export interface QRShareOptions {
  method: 'link' | 'email' | 'download' | 'embed' | 'api';
  expiration?: Date;
  password?: string;
  allowDownload?: boolean;
  trackViews?: boolean;
  customDomain?: string;
}

export interface QRShareResponse {
  success: boolean;
  shareUrl?: string;
  shareId?: string;
  embedCode?: string;
  apiEndpoint?: string;
  expiresAt?: number;
  error?: string;
}

// Performance monitoring types
export interface QRPerformanceMetrics {
  generationTime: number;
  fileSize: number;
  compressionRatio: number;
  renderTime: number;
  memoryUsage: number;
  cacheHit: boolean;
}

// Quality assessment types
export interface QRQualityAssessment {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  scanability: number; // 0-100 score
  readability: number; // 0-100 score
  durability: number; // 0-100 score
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
  recommendations: string[];
}