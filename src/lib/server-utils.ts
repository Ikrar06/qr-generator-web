// src/lib/server-utils.ts
import { NextRequest } from 'next/server';
import { formatErrorMessage } from '@/lib/utils';

// Performance metrics interface
interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

// Request log interface
interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  userAgent: string;
  ip: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Error log interface
interface ErrorLog {
  requestId?: string;
  error: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Rate limit data interface
interface RateLimitData {
  requests: number;
  resetTime: number;
}

// API Response interface
interface APIResponse<T = unknown> {
  success: boolean;
  timestamp: number;
  data?: T;
  error?: {
    message: string;
    code: string;
    timestamp: number;
  };
  meta?: Record<string, unknown>;
}

// Request info interface
interface RequestInfo {
  method: string;
  url: string;
  userAgent: string;
  ip: string;
  contentType: string;
  contentLength: string;
  referer: string;
  origin: string;
  timestamp: number;
}

// Performance stats interface
interface PerformanceStats {
  averageResponseTime: number;
  totalRequests: number;
  successRate: number;
  recentMetrics: PerformanceMetric[];
}

// Error stats interface
interface ErrorStats {
  totalErrors: number;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorLog[];
}

// Health data interface
interface HealthData {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  memory: NodeJS.MemoryUsage;
  performance: PerformanceStats;
  errors: ErrorStats;
  timestamp: number;
}

// Rate limit result interface
interface RateLimitResult {
  allowed: boolean;
  resetTime: number;
  remaining: number;
}

// Header validation result interface
interface HeaderValidationResult {
  isValid: boolean;
  errors: string[];
}

// In-memory storage for logs (in production, use external logging service)
const performanceMetrics: PerformanceMetric[] = [];
const requestLogs: RequestLog[] = [];
const errorLogs: ErrorLog[] = [];

// Configuration
const LOG_CONFIG = {
  MAX_LOGS: 1000,
  RETAIN_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  ENABLE_CONSOLE_LOG: process.env.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_METRICS: true,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

/**
 * Log API request for monitoring and debugging
 */
export async function logAPIRequest(
  request: NextRequest,
  requestId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const log: RequestLog = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: getClientIP(request),
      timestamp: Date.now(),
      metadata
    };

    // Add to in-memory storage
    requestLogs.push(log);
    cleanupLogs();

    // Console log in development
    if (LOG_CONFIG.ENABLE_CONSOLE_LOG) {
      console.log(`[REQUEST] ${log.method} ${log.url} - ${requestId}`, metadata);
    }

    // In production, you would send this to external logging service
    // await sendToExternalLogger('request', log);

  } catch (error) {
    console.error('Failed to log request:', error);
  }
}

/**
 * Log API error for monitoring and debugging
 */
export async function logAPIError(
  error: unknown,
  requestId?: string,
  request?: NextRequest
): Promise<void> {
  try {
    const errorMessage = formatErrorMessage(error);
    const severity = determineSeverity(error);

    const log: ErrorLog = {
      requestId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      url: request?.url,
      userAgent: request?.headers.get('user-agent') || undefined,
      ip: request ? getClientIP(request) : undefined,
      timestamp: Date.now(),
      severity
    };

    // Add to in-memory storage
    errorLogs.push(log);
    cleanupLogs();

    // Always log errors to console
    console.error(`[ERROR] ${severity.toUpperCase()} - ${errorMessage}`, {
      requestId,
      stack: log.stack
    });

    // In production, you would send this to external error tracking service
    // await sendToExternalLogger('error', log);

  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

/**
 * Measure performance of async operations
 */
export async function measurePerformance<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  if (!LOG_CONFIG.ENABLE_PERFORMANCE_METRICS) {
    return await operation();
  }

  const startTime = Date.now();
  let success = false;
  let result: T;

  try {
    result = await operation();
    success = true;
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - startTime;

    const metric: PerformanceMetric = {
      operation: operationName,
      duration,
      timestamp: Date.now(),
      success,
      metadata
    };

    performanceMetrics.push(metric);
    cleanupLogs();

    if (LOG_CONFIG.ENABLE_CONSOLE_LOG) {
      console.log(`[PERF] ${operationName}: ${duration}ms (${success ? 'success' : 'failed'})`);
    }

    // In production, send to monitoring service
    // await sendToMonitoringService(metric);
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  const xClientIP = request.headers.get('x-client-ip');
  
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || xClientIP || 'unknown';
}

/**
 * Format response with consistent structure
 */
export function formatAPIResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  metadata?: Record<string, unknown>
): APIResponse<T> {
  const response: APIResponse<T> = {
    success,
    timestamp: Date.now()
  };

  if (success && data !== undefined) {
    response.data = data;
  }

  if (!success && error) {
    response.error = {
      message: error,
      code: 'UNKNOWN_ERROR',
      timestamp: Date.now()
    };
  }

  if (metadata) {
    response.meta = metadata;
  }

  return response;
}

/**
 * Validate request headers
 */
export function validateRequestHeaders(request: NextRequest): HeaderValidationResult {
  const errors: string[] = [];
  const contentType = request.headers.get('content-type') || '';
  const userAgent = request.headers.get('user-agent') || '';

  // Check content type for POST requests
  if (request.method === 'POST') {
    const validContentTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ];

    if (!validContentTypes.some(type => contentType.includes(type))) {
      errors.push('Invalid content type');
    }
  }

  // Check for suspicious user agents (basic bot detection)
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /bot/i,
    /crawler/i,
    /scraper/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  if (isSuspicious && process.env.NODE_ENV === 'production') {
    // In production, you might want to handle bots differently
    // For now, we'll just log it
    console.log(`[SUSPICIOUS] Potential bot detected: ${userAgent}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize input data to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }

  // Basic XSS prevention
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Generate secure filename
 */
export function generateSecureFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  // Sanitize original name
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  return prefix ? `${prefix}_${timestamp}_${random}_${safeName}` : `${timestamp}_${random}_${safeName}`;
}

/**
 * Check if request is from allowed origin (CORS helper)
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  
  // Allow all origins in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Define allowed origins for production
  const allowedOrigins = [
    'https://qr-generator-web-iota.vercel.app/',
    'https://www.qr-generator-pro.com',
    // Add your production domains here
  ];

  if (!origin) {
    // Allow same-origin requests (no origin header)
    return true;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Rate limiting check (basic implementation)
 */
export function checkRateLimit(
  clientId: string, 
  windowMs: number = 60000, 
  maxRequests: number = 100
): RateLimitResult {
  // This is a basic in-memory rate limiter
  // In production, use Redis or similar
  
  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, {
      requests: 1,
      resetTime: Date.now() + windowMs
    });
    
    return {
      allowed: true,
      resetTime: Date.now() + windowMs,
      remaining: maxRequests - 1
    };
  }

  const clientData = rateLimitStore.get(clientId)!;
  
  // Reset if window expired
  if (Date.now() > clientData.resetTime) {
    clientData.requests = 1;
    clientData.resetTime = Date.now() + windowMs;
    
    return {
      allowed: true,
      resetTime: clientData.resetTime,
      remaining: maxRequests - 1
    };
  }

  // Check if limit exceeded
  if (clientData.requests >= maxRequests) {
    return {
      allowed: false,
      resetTime: clientData.resetTime,
      remaining: 0
    };
  }

  // Increment and allow
  clientData.requests++;
  
  return {
    allowed: true,
    resetTime: clientData.resetTime,
    remaining: maxRequests - clientData.requests
  };
}

/**
 * Get comprehensive request information for logging
 */
export function getRequestInfo(request: NextRequest): RequestInfo {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: getClientIP(request),
    contentType: request.headers.get('content-type') || 'unknown',
    contentLength: request.headers.get('content-length') || '0',
    referer: request.headers.get('referer') || 'none',
    origin: request.headers.get('origin') || 'none',
    timestamp: Date.now()
  };
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(): PerformanceStats {
  if (performanceMetrics.length === 0) {
    return {
      averageResponseTime: 0,
      totalRequests: 0,
      successRate: 0,
      recentMetrics: []
    };
  }

  const totalDuration = performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0);
  const successfulRequests = performanceMetrics.filter(metric => metric.success).length;
  
  return {
    averageResponseTime: Math.round(totalDuration / performanceMetrics.length),
    totalRequests: performanceMetrics.length,
    successRate: Math.round((successfulRequests / performanceMetrics.length) * 100),
    recentMetrics: performanceMetrics.slice(-10) // Last 10 metrics
  };
}

/**
 * Get error statistics
 */
export function getErrorStats(): ErrorStats {
  const errorsBySeverity = errorLogs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalErrors: errorLogs.length,
    errorsBySeverity,
    recentErrors: errorLogs.slice(-5) // Last 5 errors
  };
}

/**
 * Health check data
 */
export function getHealthData(): HealthData {
  const performance = getPerformanceStats();
  const errors = getErrorStats();
  
  let isHealthy = true;
  
  // Check critical system resources
  const memory = process.memoryUsage();
  const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
  
  // Consider unhealthy if:
  if (errors.totalErrors > 50) {
    isHealthy = false;
  }
  
  if (performance.totalRequests > 10 && performance.successRate < 50) {
    isHealthy = false;
  }
  
  if (memoryUsagePercent > 90) {
    isHealthy = false;
  }
  
  const criticalErrors = errors.errorsBySeverity.critical || 0;
  if (criticalErrors > 5) {
    isHealthy = false;
  }
  
  if (performance.totalRequests === 0 && errors.totalErrors === 0) {
    isHealthy = true;
  }

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    uptime: process.uptime() * 1000,
    memory: process.memoryUsage(),
    performance,
    errors,
    timestamp: Date.now()
  };
}

/**
 * Clean up old logs to prevent memory issues
 */
function cleanupLogs(): void {
  const now = Date.now();
  const maxAge = LOG_CONFIG.RETAIN_DURATION;

  // Clean up performance metrics
  const validMetrics = performanceMetrics.filter(
    metric => now - metric.timestamp < maxAge
  );
  performanceMetrics.length = 0;
  performanceMetrics.push(...validMetrics.slice(-LOG_CONFIG.MAX_LOGS));

  // Clean up request logs
  const validRequests = requestLogs.filter(
    log => now - log.timestamp < maxAge
  );
  requestLogs.length = 0;
  requestLogs.push(...validRequests.slice(-LOG_CONFIG.MAX_LOGS));

  // Clean up error logs
  const validErrors = errorLogs.filter(
    log => now - log.timestamp < maxAge
  );
  errorLogs.length = 0;
  errorLogs.push(...validErrors.slice(-LOG_CONFIG.MAX_LOGS));

  // Clean up rate limit store
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime + 60000) { // Extra minute buffer
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Determine error severity based on error type and message
 */
function determineSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
  if (!(error instanceof Error)) {
    return 'medium';
  }

  const message = error.message.toLowerCase();
  
  // Critical errors
  if (message.includes('out of memory') || 
      message.includes('segmentation fault') ||
      message.includes('database connection failed')) {
    return 'critical';
  }

  // High severity errors
  if (message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('authentication')) {
    return 'high';
  }

  // Low severity errors (validation, user input, etc.)
  if (message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format')) {
    return 'low';
  }

  // Default to medium
  return 'medium';
}

// Simple in-memory rate limit store
const rateLimitStore = new Map<string, RateLimitData>();

// Export performance and error arrays for testing
export const testUtils = {
  getPerformanceMetrics: () => [...performanceMetrics],
  getRequestLogs: () => [...requestLogs],
  getErrorLogs: () => [...errorLogs],
  clearLogs: () => {
    performanceMetrics.length = 0;
    requestLogs.length = 0;
    errorLogs.length = 0;
    rateLimitStore.clear();
  }
};