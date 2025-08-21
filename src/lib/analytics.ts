// src/lib/analytics.ts
'use client';

import { 
  QRMode, 
  OutputFormat, 
  ErrorCorrectionLevel, 
  QRDataType,
  QRGenerationResponse,
  QRGenerationRequest,
  AnalyticsEvent,
  QRPerformanceMetrics
} from '@/types/qr-types';

/**
 * Analytics configuration
 */
interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  apiEndpoint?: string;
  sessionTimeout: number;
  batchSize: number;
  flushInterval: number;
}

/**
 * QR-specific analytics events
 */
export const QRAnalyticsEvents = {
  QR_GENERATED: 'qr_generated',
  QR_DOWNLOAD: 'qr_download',
  QR_PREVIEW: 'qr_preview',
  QR_ERROR: 'qr_error',
  COLOR_CHANGED: 'color_changed',
  MODE_CHANGED: 'mode_changed',
  FORMAT_CHANGED: 'format_changed',
  SIZE_CHANGED: 'size_changed',
  DATA_TYPE_CHANGED: 'data_type_changed',
  VALIDATION_ERROR: 'validation_error',
  BATCH_GENERATED: 'batch_generated',
  HISTORY_ACCESSED: 'history_accessed',
  TEMPLATE_USED: 'template_used',
  SHARE_INITIATED: 'share_initiated',
  HELP_ACCESSED: 'help_accessed',
  PAGE_VIEWED: 'page_viewed',
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended'
} as const;

/**
 * User engagement metrics
 */
interface UserEngagementMetrics {
  sessionId: string;
  sessionStartTime: number;
  totalQRGenerated: number;
  totalDownloads: number;
  averageGenerationTime: number;
  mostUsedMode: QRMode;
  mostUsedFormat: OutputFormat;
  errorRate: number;
  featuresUsed: string[];
  timeSpentOnPage: number;
}

/**
 * QR usage analytics
 */
interface QRUsageAnalytics {
  dataTypeBreakdown: Record<QRDataType, number>;
  modeBreakdown: Record<QRMode, number>;
  formatBreakdown: Record<OutputFormat, number>;
  errorCorrectionBreakdown: Record<ErrorCorrectionLevel, number>;
  sizeDistribution: { min: number; max: number; avg: number; median: number };
  colorUsage: {
    customColors: number;
    defaultColors: number;
    popularForeground: string[];
    popularBackground: string[];
  };
  performanceMetrics: {
    averageGenerationTime: number;
    averageFileSize: number;
    successRate: number;
  };
}

/**
 * Error tracking
 */
interface ErrorTracking {
  errorCode: string;
  errorMessage: string;
  errorContext: {
    mode: QRMode;
    format: OutputFormat;
    dataType: QRDataType;
    dataLength: number;
    userAgent: string;
    timestamp: number;
    sessionId: string;
    requestId?: string;
  };
  stackTrace?: string;
  userId?: string;
  resolved: boolean;
}

/**
 * Performance monitoring
 */
interface PerformanceData {
  metric: string;
  value: number;
  timestamp: number;
  context: Record<string, any>;
}

/**
 * Main Analytics class
 */
export class QRAnalytics {
  private config: AnalyticsConfig;
  private sessionId: string;
  private startTime: number;
  private eventQueue: AnalyticsEvent[] = [];
  private userMetrics: UserEngagementMetrics;
  private performanceObserver?: PerformanceObserver;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      batchSize: 20,
      flushInterval: 30000, // 30 seconds
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    this.userMetrics = {
      sessionId: this.sessionId,
      sessionStartTime: this.startTime,
      totalQRGenerated: 0,
      totalDownloads: 0,
      averageGenerationTime: 0,
      mostUsedMode: QRMode.BASIC,
      mostUsedFormat: OutputFormat.PNG,
      errorRate: 0,
      featuresUsed: [],
      timeSpentOnPage: 0
    };

    if (this.config.enabled) {
      this.initializeTracking();
    }
  }

  /**
   * Initialize tracking systems
   */
  private initializeTracking(): void {
    // Track session start
    this.track(QRAnalyticsEvents.SESSION_STARTED, {
      sessionId: this.sessionId,
      timestamp: this.startTime,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : 'unknown',
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : null
    });

    // Setup performance monitoring
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupPerformanceMonitoring();
    }

    // Setup page visibility tracking
    if (typeof document !== 'undefined') {
      this.setupVisibilityTracking();
    }

    // Setup periodic flushing
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Setup beforeunload handler
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.trackSessionEnd();
        this.flush(true);
      });
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('qr-generation')) {
            this.trackPerformance('qr_generation_time', entry.duration, {
              entryType: entry.entryType,
              name: entry.name
            });
          }
        });
      });

      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation', 'paint'] 
      });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }

  /**
   * Setup page visibility tracking
   */
  private setupVisibilityTracking(): void {
    let pageShowTime = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeSpent = Date.now() - pageShowTime;
        this.userMetrics.timeSpentOnPage += timeSpent;
      } else {
        pageShowTime = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `qr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Track QR generation event
   */
  trackQRGeneration(request: QRGenerationRequest, response: QRGenerationResponse, duration: number): void {
    this.userMetrics.totalQRGenerated++;
    
    // Update average generation time
    this.userMetrics.averageGenerationTime = 
      (this.userMetrics.averageGenerationTime * (this.userMetrics.totalQRGenerated - 1) + duration) / 
      this.userMetrics.totalQRGenerated;

    // Track mode usage
    this.updateMostUsedMode(request.mode);
    this.updateMostUsedFormat(response.format);

    // Add to features used
    if (!this.userMetrics.featuresUsed.includes('generation')) {
      this.userMetrics.featuresUsed.push('generation');
    }

    if (request.mode !== QRMode.BASIC && !this.userMetrics.featuresUsed.includes('custom_mode')) {
      this.userMetrics.featuresUsed.push('custom_mode');
    }

    if (request.options?.color && !this.userMetrics.featuresUsed.includes('custom_colors')) {
      this.userMetrics.featuresUsed.push('custom_colors');
    }

    this.track(QRAnalyticsEvents.QR_GENERATED, {
      mode: request.mode,
      format: response.format,
      dataLength: request.data.length,
      success: response.success,
      duration,
      size: response.size,
      errorCorrectionLevel: request.options?.errorCorrectionLevel,
      customColors: !!(request.options?.color),
      fileSize: response.metadata ? this.estimateFileSize(response) : 0
    });
  }

  /**
   * Track QR download event
   */
  trackQRDownload(response: QRGenerationResponse, format: OutputFormat): void {
    this.userMetrics.totalDownloads++;
    
    if (!this.userMetrics.featuresUsed.includes('download')) {
      this.userMetrics.featuresUsed.push('download');
    }

    this.track(QRAnalyticsEvents.QR_DOWNLOAD, {
      originalFormat: response.format,
      downloadFormat: format,
      fileSize: this.estimateFileSize(response),
      mode: response.metadata ? 'generated' : 'history'
    });
  }

  /**
   * Track QR preview event
   */
  trackQRPreview(request: QRGenerationRequest): void {
    this.track(QRAnalyticsEvents.QR_PREVIEW, {
      mode: request.mode,
      dataType: this.detectDataType(request.data),
      dataLength: request.data.length,
      hasCustomColors: !!(request.options?.color)
    });
  }

  /**
   * Track error event
   */
  trackError(error: string | Error, context: Record<string, any> = {}): void {
    const errorData: ErrorTracking = {
      errorCode: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorContext: {
        mode: context.mode || QRMode.BASIC,
        format: context.format || OutputFormat.PNG,
        dataType: context.dataType || QRDataType.TEXT,
        dataLength: context.dataLength || 0,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        timestamp: Date.now(),
        sessionId: this.sessionId,
        requestId: context.requestId
      },
      stackTrace: error instanceof Error ? error.stack : undefined,
      resolved: false
    };

    this.track(QRAnalyticsEvents.QR_ERROR, errorData);
    
    // Update error rate
    const totalAttempts = this.userMetrics.totalQRGenerated + 1;
    this.userMetrics.errorRate = (this.userMetrics.errorRate * (totalAttempts - 1) + 1) / totalAttempts;
  }

  /**
   * Track user interaction events
   */
  trackInteraction(eventType: string, properties: Record<string, any> = {}): void {
    const eventKey = `${eventType}_used`;
    if (!this.userMetrics.featuresUsed.includes(eventKey)) {
      this.userMetrics.featuresUsed.push(eventKey);
    }

    this.track(eventType as keyof typeof QRAnalyticsEvents, {
      ...properties,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, context: Record<string, any> = {}): void {
    const performanceData: PerformanceData = {
      metric,
      value,
      timestamp: Date.now(),
      context: {
        sessionId: this.sessionId,
        ...context
      }
    };

    this.track('performance_metric', performanceData);
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, properties: Record<string, any> = {}): void {
    if (!this.userMetrics.featuresUsed.includes(feature)) {
      this.userMetrics.featuresUsed.push(feature);
    }

    this.track('feature_used', {
      feature,
      ...properties,
      sessionTime: Date.now() - this.startTime
    });
  }

  /**
   * Generic event tracking
   */
  track(event: string, properties: Record<string, any> = {}): void {
    if (!this.config.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      name: event,
      properties: {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        ...properties
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.eventQueue.push(analyticsEvent);

    // Auto-flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }

    // Send to external analytics services
    this.sendToExternalServices(analyticsEvent);
  }

  /**
   * Send events to external analytics services
   */
  private sendToExternalServices(event: AnalyticsEvent): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', event.name, {
        event_category: 'QR_Generator',
        event_label: event.properties?.mode || 'unknown',
        value: event.properties?.duration || 0,
        custom_parameters: event.properties
      });
    }

    // Custom analytics endpoint
    if (this.config.apiEndpoint) {
      this.sendToCustomEndpoint(event);
    }
  }

  /**
   * Send event to custom analytics endpoint
   */
  private async sendToCustomEndpoint(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: [event],
          sessionId: this.sessionId,
          userId: this.getUserId()
        })
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  /**
   * Flush queued events
   */
  flush(force: boolean = false): void {
    if (this.eventQueue.length === 0) return;
    
    if (!force && this.eventQueue.length < this.config.batchSize) return;

    // Send batched events
    if (this.config.apiEndpoint) {
      this.sendBatchToEndpoint([...this.eventQueue]);
    }

    // Store in local storage for offline analysis
    this.storeEventsLocally([...this.eventQueue]);

    // Clear the queue
    this.eventQueue = [];
  }

  /**
   * Send batch of events to endpoint
   */
  private async sendBatchToEndpoint(events: AnalyticsEvent[]): Promise<void> {
    try {
      await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          sessionId: this.sessionId,
          userId: this.getUserId(),
          batchId: `batch_${Date.now()}`
        })
      });
    } catch (error) {
      console.warn('Failed to send analytics batch:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Store events locally for offline analysis
   */
  private storeEventsLocally(events: AnalyticsEvent[]): void {
    if (typeof window === 'undefined') return;

    try {
      const existingEvents = JSON.parse(localStorage.getItem('qr_analytics_events') || '[]');
      const allEvents = [...existingEvents, ...events];
      
      // Keep only last 1000 events
      const recentEvents = allEvents.slice(-1000);
      
      localStorage.setItem('qr_analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to store analytics events locally:', error);
    }
  }

  /**
   * Get user analytics summary
   */
  getAnalyticsSummary(): UserEngagementMetrics & QRUsageAnalytics {
    const events = this.getStoredEvents();
    
    return {
      ...this.userMetrics,
      ...this.calculateUsageAnalytics(events)
    };
  }

  /**
 * Calculate usage analytics from stored events
 */
private calculateUsageAnalytics(events: AnalyticsEvent[]): QRUsageAnalytics {
  const qrEvents = events.filter(e => e.name === QRAnalyticsEvents.QR_GENERATED);
  
  const dataTypeBreakdown = {} as Record<QRDataType, number>;
  const modeBreakdown = {} as Record<QRMode, number>;
  const formatBreakdown = {} as Record<OutputFormat, number>;
  const errorCorrectionBreakdown = {} as Record<ErrorCorrectionLevel, number>;
  
  const sizes: number[] = [];
  const generationTimes: number[] = [];
  const fileSizes: number[] = [];
  const foregroundColors: string[] = [];
  const backgroundColors: string[] = [];
  
  let customColorCount = 0;
  let defaultColorCount = 0;
  let successCount = 0;

  qrEvents.forEach(event => {
    const props = event.properties || {};
    
    // Data type breakdown (estimated from data)
    const dataType = this.detectDataType(props.data || '');
    dataTypeBreakdown[dataType] = (dataTypeBreakdown[dataType] || 0) + 1;
    
    // Mode breakdown - FIX: Add type checking
    if (props.mode && Object.values(QRMode).includes(props.mode as QRMode)) {
      const mode = props.mode as QRMode;
      modeBreakdown[mode] = (modeBreakdown[mode] || 0) + 1;
    }
    
    // Format breakdown - FIX: Add type checking
    if (props.format && Object.values(OutputFormat).includes(props.format as OutputFormat)) {
      const format = props.format as OutputFormat;
      formatBreakdown[format] = (formatBreakdown[format] || 0) + 1;
    }
    
    // Error correction breakdown - FIX: Add type checking
    if (props.errorCorrectionLevel && Object.values(ErrorCorrectionLevel).includes(props.errorCorrectionLevel as ErrorCorrectionLevel)) {
      const errorCorrectionLevel = props.errorCorrectionLevel as ErrorCorrectionLevel;
      errorCorrectionBreakdown[errorCorrectionLevel] = 
        (errorCorrectionBreakdown[errorCorrectionLevel] || 0) + 1;
    }
    
    // Size data
    if (props.size?.width) {
      sizes.push(props.size.width);
    }
    
    // Performance data
    if (props.duration) {
      generationTimes.push(props.duration);
    }
    
    if (props.fileSize) {
      fileSizes.push(props.fileSize);
    }
    
    // Color usage
    if (props.customColors) {
      customColorCount++;
      // In a real implementation, you'd track actual colors
    } else {
      defaultColorCount++;
    }
    
    // Success rate
    if (props.success) {
      successCount++;
    }
  });

  return {
    dataTypeBreakdown,
    modeBreakdown,
    formatBreakdown,
    errorCorrectionBreakdown,
    sizeDistribution: {
      min: Math.min(...sizes) || 0,
      max: Math.max(...sizes) || 0,
      avg: sizes.reduce((a, b) => a + b, 0) / sizes.length || 0,
      median: this.calculateMedian(sizes)
    },
    colorUsage: {
      customColors: customColorCount,
      defaultColors: defaultColorCount,
      popularForeground: [], // Would be populated with actual color data
      popularBackground: []
    },
    performanceMetrics: {
      averageGenerationTime: generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length || 0,
      averageFileSize: fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length || 0,
      successRate: qrEvents.length > 0 ? (successCount / qrEvents.length) * 100 : 0
    }
  };
}

  /**
   * Get stored analytics events
   */
  private getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('qr_analytics_events') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored analytics events:', error);
      return [];
    }
  }

  /**
   * Helper methods
   */
  private updateMostUsedMode(mode: QRMode): void {
    // Simple implementation - in reality you'd track counts
    this.userMetrics.mostUsedMode = mode;
  }

  private updateMostUsedFormat(format: OutputFormat): void {
    // Simple implementation - in reality you'd track counts
    this.userMetrics.mostUsedFormat = format;
  }

  private detectDataType(data: string): QRDataType {
    if (data.startsWith('http://') || data.startsWith('https://')) return QRDataType.URL;
    if (data.includes('@') && data.includes('.')) return QRDataType.EMAIL;
    if (data.startsWith('tel:')) return QRDataType.PHONE;
    if (data.startsWith('sms:')) return QRDataType.SMS;
    if (data.startsWith('WIFI:')) return QRDataType.WIFI;
    if (data.startsWith('BEGIN:VCARD')) return QRDataType.VCARD;
    return QRDataType.TEXT;
  }

  private estimateFileSize(response: QRGenerationResponse): number {
    if (!response.size) return 0;
    
    // Rough estimation based on format and size
    const pixelCount = response.size.width * response.size.height;
    switch (response.format) {
      case OutputFormat.PNG:
        return Math.round(pixelCount * 0.5); // Rough PNG compression
      case OutputFormat.JPG:
      case OutputFormat.JPEG:
        return Math.round(pixelCount * 0.1); // JPEG compression
      case OutputFormat.SVG:
        return Math.round(response.data?.toString().length || 1000);
      case OutputFormat.WEBP:
        return Math.round(pixelCount * 0.3); // WebP compression
      default:
        return 0;
    }
  }

  private calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  private getUserId(): string | undefined {
    // Implementation depends on your user system
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qr_user_id') || undefined;
    }
    return undefined;
  }

  private trackSessionEnd(): void {
    this.track(QRAnalyticsEvents.SESSION_ENDED, {
      sessionDuration: Date.now() - this.startTime,
      totalQRGenerated: this.userMetrics.totalQRGenerated,
      totalDownloads: this.userMetrics.totalDownloads,
      featuresUsed: this.userMetrics.featuresUsed,
      errorRate: this.userMetrics.errorRate
    });
  }

  /**
   * Clean up analytics instance
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    this.trackSessionEnd();
    this.flush(true);
  }
}

// Global analytics instance
let globalAnalytics: QRAnalytics | null = null;

/**
 * Get or create global analytics instance
 */
export function getAnalytics(): QRAnalytics {
  if (!globalAnalytics) {
    globalAnalytics = new QRAnalytics({
      enabled: process.env.NODE_ENV === 'production',
      trackingId: process.env.NEXT_PUBLIC_GA_ID
    });
  }
  return globalAnalytics;
}

/**
 * Initialize analytics with custom config
 */
export function initializeAnalytics(config: Partial<AnalyticsConfig>): QRAnalytics {
  globalAnalytics = new QRAnalytics(config);
  return globalAnalytics;
}

/**
 * Convenience functions for common tracking
 */
export const analytics = {
  trackQRGeneration: (request: QRGenerationRequest, response: QRGenerationResponse, duration: number) => 
    getAnalytics().trackQRGeneration(request, response, duration),
    
  trackQRDownload: (response: QRGenerationResponse, format: OutputFormat) => 
    getAnalytics().trackQRDownload(response, format),
    
  trackError: (error: string | Error, context?: Record<string, any>) => 
    getAnalytics().trackError(error, context),
    
  trackFeature: (feature: string, properties?: Record<string, any>) => 
    getAnalytics().trackFeatureUsage(feature, properties),
    
  trackInteraction: (event: string, properties?: Record<string, any>) => 
    getAnalytics().trackInteraction(event, properties)
};

export default analytics;