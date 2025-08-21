// src/lib/api-client.ts
import { 
  QRGenerationRequest, 
  QRGenerationResponse, 
  APIError,
  OutputFormat,
  QRMode 
} from '@/types/qr-types';
import { formatErrorMessage } from '@/lib/utils';

// Mock constants if not available yet
const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

const ERROR_MESSAGES = {
  EMPTY_DATA: 'Data cannot be empty',
  DATA_TOO_LONG: 'Data too long',
  GENERATION_FAILED: 'QR generation failed',
  NETWORK_ERROR: 'Network error occurred'
};

// API Response wrapper interface
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: {
    requestId: string;
    processingTime: number;
    timestamp: number;
    version: string;
  };
}

// API Client configuration
interface APIClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Request cache for performance
const requestCache = new Map<string, {
  response: QRGenerationResponse;
  timestamp: number;
  ttl: number;
}>();

/**
 * Main API Client class for QR Generation
 */
class QRAPIClient {
  private config: APIClientConfig;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config?: Partial<APIClientConfig>) {
    this.config = {
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: API_CONFIG.RETRY_DELAY,
      ...config
    };
  }

  /**
   * Generate QR code via API
   */
  async generateQR(request: QRGenerationRequest): Promise<QRGenerationResponse> {
    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Create abort controller for this request
    const requestId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const response = await this.makeRequest<QRGenerationResponse>('/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': '1.0.0',
          'X-Request-ID': requestId
        },
        body: JSON.stringify(request),
        signal: abortController.signal
      });

      // Cache successful responses
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data, 5 * 60 * 1000); // Cache for 5 minutes
        return response.data;
      } else {
        throw new Error(response.error?.message || ERROR_MESSAGES.GENERATION_FAILED);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Generate QR code with retry logic
   */
  async generateQRWithRetry(request: QRGenerationRequest): Promise<QRGenerationResponse> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await this.generateQR(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on validation errors
        if (this.isNonRetryableError(lastError)) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await this.wait(delay);
        }
      }
    }

    throw lastError || new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }

  /**
   * Generate multiple QR codes in batch
   */
  async generateBatch(requests: QRGenerationRequest[]): Promise<QRGenerationResponse[]> {
    const promises = requests.map(request => 
      this.generateQRWithRetry(request).catch(error => ({
        success: false,
        filename: request.filename || `qr-${Date.now()}`,
        format: OutputFormat.PNG,
        size: { width: 256, height: 256 },
        error: formatErrorMessage(error),
        timestamp: Date.now()
      } as QRGenerationResponse))
    );

    return await Promise.all(promises);
  }

  /**
   * Cancel ongoing request
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel all ongoing requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Get API health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      const response = await this.makeRequest('/health', {
        method: 'GET',
        headers: {
          'X-Client-Version': '1.0.0'
        }
      });

      return response;
    } catch (error) {
      throw new Error(`Health check failed: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Get API documentation
   */
  async getAPIInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('/generate-qr', {
        method: 'GET',
        headers: {
          'X-Client-Version': '1.0.0'
        }
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to get API info: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Validate request before sending
   */
  validateRequest(request: QRGenerationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.data || request.data.trim().length === 0) {
      errors.push(ERROR_MESSAGES.EMPTY_DATA);
    }

    if (!request.mode || !Object.values(QRMode).includes(request.mode)) {
      errors.push('Invalid QR mode');
    }

    if (request.data && request.data.length > 4296) {
      errors.push(ERROR_MESSAGES.DATA_TOO_LONG);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    requestCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    // This is a simplified implementation
    // In a real app, you might want to track these metrics properly
    return {
      size: requestCache.size,
      hits: 0, // Would need to track this
      misses: 0 // Would need to track this
    };
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    // Add timeout to request
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), this.config.timeout);
    
    // Combine abort signals if both exist
    const combinedSignal = options.signal 
      ? this.combineAbortSignals([options.signal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const response = await fetch(url, {
        ...options,
        signal: combinedSignal,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          errorData.message || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as APIResponse<T>;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout or was cancelled');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
      }

      throw error;
    }
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: QRGenerationRequest): string {
    const key = {
      data: request.data,
      mode: request.mode,
      options: request.options
    };
    return btoa(JSON.stringify(key));
  }

  /**
   * Get response from cache
   */
  private getFromCache(key: string): QRGenerationResponse | null {
    const cached = requestCache.get(key);
    if (!cached) return null;

    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > cached.ttl) {
      requestCache.delete(key);
      return null;
    }

    return cached.response;
  }

  /**
   * Store response in cache
   */
  private setCache(key: string, response: QRGenerationResponse, ttl: number): void {
    requestCache.set(key, {
      response,
      timestamp: Date.now(),
      ttl
    });

    // Clean up old cache entries (simple LRU)
    if (requestCache.size > 100) {
      const oldestKey = requestCache.keys().next().value;
      if (oldestKey) {
        requestCache.delete(oldestKey);
      }
    }
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'validation error',
      'invalid',
      'required',
      'exceeds maximum',
      'unsupported'
    ];

    return nonRetryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  }

  /**
   * Combine multiple abort signals
   */
  private combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    signals.forEach(signal => {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort());
      }
    });
    
    return controller.signal;
  }

  /**
   * Wait for specified time
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create default API client instance
export const apiClient = new QRAPIClient();

// Convenience functions for common operations
export const qrAPI = {
  /**
   * Generate single QR code
   */
  generate: (request: QRGenerationRequest): Promise<QRGenerationResponse> => {
    return apiClient.generateQRWithRetry(request);
  },

  /**
   * Generate multiple QR codes
   */
  generateBatch: (requests: QRGenerationRequest[]): Promise<QRGenerationResponse[]> => {
    return apiClient.generateBatch(requests);
  },

  /**
   * Cancel ongoing generation
   */
  cancel: (requestId?: string): void => {
    if (requestId) {
      apiClient.cancelRequest(requestId);
    } else {
      apiClient.cancelAllRequests();
    }
  },

  /**
   * Check API health
   */
  healthCheck: (): Promise<any> => {
    return apiClient.getHealthStatus();
  },

  /**
   * Get API information
   */
  getInfo: (): Promise<any> => {
    return apiClient.getAPIInfo();
  },

  /**
   * Validate request data
   */
  validate: (request: QRGenerationRequest): { isValid: boolean; errors: string[] } => {
    return apiClient.validateRequest(request);
  },

  /**
   * Clear cache
   */
  clearCache: (): void => {
    apiClient.clearCache();
  },

  /**
   * Get cache statistics
   */
  getCacheStats: (): { size: number; hits: number; misses: number } => {
    return apiClient.getCacheStats();
  }
};

// Export types for external use
export type { APIResponse, APIClientConfig };

// Export client class for advanced usage
export { QRAPIClient };