// src/lib/error-handling.ts
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  GENERATION = 'generation',
  DOWNLOAD = 'download',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  component?: string;
  function?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  additionalData?: Record<string, any>;
}

export interface ProcessedError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError: Error | string | unknown;
  context: ErrorContext;
  userMessage: string;
  suggestions: string[];
  isRetryable: boolean;
  retryCount: number;
  maxRetries: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ProcessedError[] = [];
  private isReporting = false;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Process and classify error
   */
  processError(
    error: Error | string | unknown,
    context: Partial<ErrorContext> = {}
  ): ProcessedError {
    const processedError: ProcessedError = {
      id: this.generateErrorId(),
      type: this.classifyError(error),
      severity: this.determineSeverity(error),
      message: this.extractMessage(error),
      originalError: error,
      context: {
        timestamp: Date.now(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        ...context
      },
      userMessage: '',
      suggestions: [],
      isRetryable: false,
      retryCount: 0,
      maxRetries: 3
    };

    // Generate user-friendly message and suggestions
    this.enhanceErrorForUser(processedError);
    
    return processedError;
  }

  /**
   * Handle error with automatic processing and reporting
   */
  async handleError(
    error: Error | string | unknown,
    context: Partial<ErrorContext> = {}
  ): Promise<ProcessedError> {
    const processedError = this.processError(error, context);
    
    // Log error
    this.logError(processedError);
    
    // Queue for reporting
    this.queueForReporting(processedError);
    
    // Show user notification
    this.showUserNotification(processedError);
    
    return processedError;
  }

  /**
   * Classify error type
   */
  private classifyError(error: Error | string | unknown): ErrorType {
    const message = this.extractMessage(error);
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('validation') || 
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('required') ||
        lowerMessage.includes('format')) {
      return ErrorType.VALIDATION;
    }

    if (lowerMessage.includes('network') || 
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('connection') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('offline')) {
      return ErrorType.NETWORK;
    }

    if (lowerMessage.includes('generation') || 
        lowerMessage.includes('qr') ||
        lowerMessage.includes('canvas') ||
        lowerMessage.includes('encode')) {
      return ErrorType.GENERATION;
    }

    if (lowerMessage.includes('download') || 
        lowerMessage.includes('file') ||
        lowerMessage.includes('save') ||
        lowerMessage.includes('blob')) {
      return ErrorType.DOWNLOAD;
    }

    if (lowerMessage.includes('storage') || 
        lowerMessage.includes('quota') ||
        lowerMessage.includes('disk')) {
      return ErrorType.STORAGE;
    }

    if (lowerMessage.includes('permission') || 
        lowerMessage.includes('denied') ||
        lowerMessage.includes('unauthorized')) {
      return ErrorType.PERMISSION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error | string | unknown): ErrorSeverity {
    const message = this.extractMessage(error);
    const lowerMessage = message.toLowerCase();

    // Critical errors that break core functionality
    if (lowerMessage.includes('critical') ||
        lowerMessage.includes('fatal') ||
        lowerMessage.includes('crash') ||
        lowerMessage.includes('corrupted')) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity - major functionality impacted
    if (lowerMessage.includes('generation failed') ||
        lowerMessage.includes('download failed') ||
        lowerMessage.includes('server error') ||
        lowerMessage.includes('service unavailable')) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity - some functionality impacted
    if (lowerMessage.includes('warning') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('retry') ||
        lowerMessage.includes('temporary')) {
      return ErrorSeverity.MEDIUM;
    }

    // Default to low severity
    return ErrorSeverity.LOW;
  }

  /**
   * Extract error message
   */
  private extractMessage(error: Error | string | unknown): string {
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

      if ('statusText' in error && typeof error.statusText === 'string') {
        return error.statusText;
      }
    }

    return 'An unexpected error occurred';
  }

  /**
   * Enhance error with user-friendly information
   */
  private enhanceErrorForUser(processedError: ProcessedError): void {
    const { type, severity, message } = processedError;
    
    switch (type) {
      case ErrorType.VALIDATION:
        processedError.userMessage = 'Please check your input and try again.';
        processedError.suggestions = [
          'Verify that all required fields are filled',
          'Check data format (URL, email, phone)',
          'Ensure text length is within limits'
        ];
        processedError.isRetryable = false;
        break;

      case ErrorType.NETWORK:
        processedError.userMessage = 'Connection problem. Please check your internet and try again.';
        processedError.suggestions = [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and retry'
        ];
        processedError.isRetryable = true;
        break;

      case ErrorType.GENERATION:
        processedError.userMessage = 'Failed to generate QR code. Please try again.';
        processedError.suggestions = [
          'Try a different generation mode',
          'Reduce the amount of data',
          'Check color contrast settings'
        ];
        processedError.isRetryable = true;
        break;

      case ErrorType.DOWNLOAD:
        processedError.userMessage = 'Download failed. Please try again.';
        processedError.suggestions = [
          'Try a different file format',
          'Check browser download settings',
          'Ensure sufficient storage space'
        ];
        processedError.isRetryable = true;
        break;

      case ErrorType.STORAGE:
        processedError.userMessage = 'Storage limit reached. Please free up space.';
        processedError.suggestions = [
          'Clear browser cache',
          'Delete old downloads',
          'Use a smaller QR code size'
        ];
        processedError.isRetryable = false;
        break;

      case ErrorType.PERMISSION:
        processedError.userMessage = 'Permission required. Please allow access and try again.';
        processedError.suggestions = [
          'Check browser permissions',
          'Allow file downloads',
          'Refresh the page and try again'
        ];
        processedError.isRetryable = true;
        break;

      default:
        processedError.userMessage = 'Something went wrong. Please try again.';
        processedError.suggestions = [
          'Refresh the page',
          'Try again in a moment',
          'Contact support if problem persists'
        ];
        processedError.isRetryable = true;
        break;
    }

    // Adjust retry settings based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        processedError.isRetryable = false;
        processedError.maxRetries = 0;
        break;
      case ErrorSeverity.HIGH:
        processedError.maxRetries = 1;
        break;
      case ErrorSeverity.MEDIUM:
        processedError.maxRetries = 3;
        break;
      case ErrorSeverity.LOW:
        processedError.maxRetries = 5;
        break;
    }
  }

  /**
   * Log error for debugging
   */
  private logError(processedError: ProcessedError): void {
    const logLevel = this.getLogLevel(processedError.severity);
    const logData = {
      id: processedError.id,
      type: processedError.type,
      severity: processedError.severity,
      message: processedError.message,
      context: processedError.context,
      stack: processedError.originalError instanceof Error ? processedError.originalError.stack : undefined
    };

    switch (logLevel) {
      case 'error':
        console.error(`[${processedError.type.toUpperCase()}] ${processedError.message}`, logData);
        break;
      case 'warn':
        console.warn(`[${processedError.type.toUpperCase()}] ${processedError.message}`, logData);
        break;
      case 'info':
        console.info(`[${processedError.type.toUpperCase()}] ${processedError.message}`, logData);
        break;
      default:
        console.log(`[${processedError.type.toUpperCase()}] ${processedError.message}`, logData);
    }
  }

  /**
   * Get appropriate log level for severity
   */
  private getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'log';
    }
  }

  /**
   * Show user notification
   */
  private showUserNotification(processedError: ProcessedError): void {
    if (typeof window === 'undefined' || !window.QRApp) {
      return;
    }

    const notificationType = this.getNotificationType(processedError.severity);
    window.QRApp.showToast(processedError.userMessage, notificationType);
  }

  /**
   * Get notification type for severity
   */
  private getNotificationType(severity: ErrorSeverity): 'error' | 'warning' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'info';
    }
  }

  /**
   * Queue error for reporting
   */
  private queueForReporting(processedError: ProcessedError): void {
    this.errorQueue.push(processedError);
    
    // Trigger batch reporting for high/critical errors
    if (processedError.severity === ErrorSeverity.HIGH || 
        processedError.severity === ErrorSeverity.CRITICAL) {
      this.reportErrors();
    }
  }

  /**
   * Report errors to external service
   */
  private async reportErrors(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    // Only report in production
    if (process.env.NODE_ENV !== 'production') {
      this.errorQueue = [];
      return;
    }

    this.isReporting = true;
    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors })
      });
    } catch (reportingError) {
      console.error('Failed to report errors:', reportingError);
      // Re-queue errors for next batch
      this.errorQueue.unshift(...errors);
    } finally {
      this.isReporting = false;
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `err_${timestamp}_${random}`;
  }

  /**
   * Create retry strategy for error
   */
  createRetryStrategy(processedError: ProcessedError): {
    canRetry: boolean;
    nextRetryDelay: number;
    execute: () => Promise<void>;
  } {
    const canRetry = processedError.isRetryable && 
                    processedError.retryCount < processedError.maxRetries;

    const nextRetryDelay = Math.min(
      1000 * Math.pow(2, processedError.retryCount), // Exponential backoff
      10000 // Max 10 seconds
    );

    return {
      canRetry,
      nextRetryDelay,
      execute: async () => {
        if (!canRetry) {
          throw new Error('Retry not available');
        }
        
        processedError.retryCount++;
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, nextRetryDelay + jitter));
      }
    };
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    averageRetryCount: number;
  } {
    // This would typically come from persistent storage
    // For now, return current session data
    const errorsByType = this.errorQueue.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<ErrorType, number>);

    const errorsBySeverity = this.errorQueue.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const totalRetries = this.errorQueue.reduce((acc, error) => acc + error.retryCount, 0);
    const averageRetryCount = this.errorQueue.length > 0 ? totalRetries / this.errorQueue.length : 0;

    return {
      totalErrors: this.errorQueue.length,
      errorsByType,
      errorsBySeverity,
      averageRetryCount
    };
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export function handleError(
  error: Error | string | unknown,
  context?: Partial<ErrorContext>
): Promise<ProcessedError> {
  return errorHandler.handleError(error, context);
}

export function processError(
  error: Error | string | unknown,
  context?: Partial<ErrorContext>
): ProcessedError {
  return errorHandler.processError(error, context);
}

export function createRetryStrategy(processedError: ProcessedError) {
  return errorHandler.createRetryStrategy(processedError);
}

// Global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleError(event.reason, {
      component: 'global',
      function: 'unhandledrejection'
    });
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    handleError(event.error, {
      component: 'global',
      function: 'error',
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });
}