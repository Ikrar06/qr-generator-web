// src/lib/performance.ts
/**
 * Performance optimization utilities for QR Generator Web App
 * Provides comprehensive performance monitoring, optimization, and caching functionality
 */

import { PERFORMANCE_CONFIG, API_CONFIG } from './constants';

// Performance metrics interface
interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  type: 'navigation' | 'resource' | 'measure' | 'paint' | 'custom';
  metadata?: Record<string, any>;
}

// Cache interface
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  version: string;
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private cache: Map<string, CacheItem> = new Map();
  private readonly CACHE_VERSION = '1.0.0';

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Mark the start of a performance measurement
   */
  markStart(name: string, metadata?: Record<string, any>): void {
    try {
      if (typeof window !== 'undefined' && window.performance?.mark) {
        window.performance.mark(`${name}-start`);
        
        // Store metadata for later use
        if (metadata) {
          this.storeMetadata(`${name}-start`, metadata);
        }
      }
    } catch (error) {
      console.warn(`Failed to mark start for ${name}:`, error);
    }
  }

  /**
   * Mark the end of a performance measurement and calculate duration
   */
  markEnd(name: string, metadata?: Record<string, any>): number | null {
    try {
      if (typeof window !== 'undefined' && window.performance?.mark && window.performance?.measure) {
        const endMarkName = `${name}-end`;
        const startMarkName = `${name}-start`;
        
        window.performance.mark(endMarkName);
        window.performance.measure(name, startMarkName, endMarkName);
        
        const measure = window.performance.getEntriesByName(name, 'measure')[0] as PerformanceEntry;
        const duration = measure?.duration || 0;
        
        // Record the metric
        const metric: PerformanceMetrics = {
          name,
          duration,
          timestamp: Date.now(),
          type: 'measure',
          metadata: {
            ...this.getStoredMetadata(startMarkName),
            ...metadata
          }
        };
        
        this.addMetric(metric);
        
        // Clean up marks and measures
        window.performance.clearMarks(startMarkName);
        window.performance.clearMarks(endMarkName);
        window.performance.clearMeasures(name);
        
        return duration;
      }
    } catch (error) {
      console.warn(`Failed to mark end for ${name}:`, error);
    }
    
    return null;
  }

  /**
   * Record a custom performance metric
   */
  recordCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      name,
      duration: value,
      timestamp: Date.now(),
      type: 'custom',
      metadata
    };
    
    this.addMetric(metric);
  }

  /**
   * Get Core Web Vitals metrics
   */
  getCoreWebVitals(): Promise<Record<string, number>> {
    return new Promise((resolve) => {
      const vitals: Record<string, number> = {};
      
      if (typeof window === 'undefined' || !window.performance) {
        resolve(vitals);
        return;
      }
      
      // Get FCP (First Contentful Paint)
      const fcpEntry = window.performance.getEntriesByType('paint')
        .find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) vitals.FCP = fcpEntry.startTime;
      
      // Get LCP (Largest Contentful Paint) - requires web-vitals library or observer
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
        });
        
        try {
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(vitals);
          }, 1000);
        } catch {
          resolve(vitals);
        }
      } else {
        resolve(vitals);
      }
    });
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetrics['type']): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.type === type);
  }

  /**
   * Clear all metrics (useful for memory management)
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: Record<string, any>;
    metrics: PerformanceMetrics[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const summary: Record<string, any> = {
      totalMetrics: this.metrics.length,
      averageQRGeneration: 0,
      averageDownload: 0,
      slowOperations: 0,
      cacheHitRate: this.getCacheHitRate()
    };

    // Analyze QR generation performance
    const qrMetrics = this.metrics.filter(m => m.name.includes('qr-generation'));
    if (qrMetrics.length > 0) {
      const total = qrMetrics.reduce((sum, m) => sum + m.duration, 0);
      summary.averageQRGeneration = total / qrMetrics.length;
      
      if (summary.averageQRGeneration > 2000) {
        recommendations.push('QR generation is slow. Consider optimizing QR generation algorithm or using Web Workers.');
      }
    }

    // Analyze download performance
    const downloadMetrics = this.metrics.filter(m => m.name.includes('download'));
    if (downloadMetrics.length > 0) {
      const total = downloadMetrics.reduce((sum, m) => sum + m.duration, 0);
      summary.averageDownload = total / downloadMetrics.length;
    }

    // Count slow operations
    summary.slowOperations = this.metrics.filter(m => m.duration > 1000).length;
    if (summary.slowOperations > 0) {
      recommendations.push(`${summary.slowOperations} slow operations detected. Consider optimization.`);
    }

    return {
      summary,
      metrics: this.metrics,
      recommendations
    };
  }

  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory issues
    if (this.metrics.length > PERFORMANCE_CONFIG.MAX_HISTORY_ITEMS) {
      this.metrics = this.metrics.slice(-PERFORMANCE_CONFIG.MAX_HISTORY_ITEMS);
    }
  }

  private storeMetadata(key: string, metadata: Record<string, any>): void {
    if (typeof window !== 'undefined') {
      (window as any).__perfMetadata = (window as any).__perfMetadata || {};
      (window as any).__perfMetadata[key] = metadata;
    }
  }

  private getStoredMetadata(key: string): Record<string, any> {
    if (typeof window !== 'undefined' && (window as any).__perfMetadata) {
      return (window as any).__perfMetadata[key] || {};
    }
    return {};
  }

  private getCacheHitRate(): number {
    // This would be implemented based on actual cache usage
    // For now, return a placeholder
    return 0;
  }
}

// Memory-based cache implementation
export class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_VERSION = '1.0.0';

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Check version compatibility
    if (item.version !== this.CACHE_VERSION) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number = PERFORMANCE_CONFIG.CACHE_DURATION): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      version: this.CACHE_VERSION
    };

    this.cache.set(key, item);
  }

  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size and statistics
   */
  getStats(): {
    size: number;
    entries: number;
    memoryUsage: number;
  } {
    let memoryUsage = 0;
    
    this.cache.forEach((item) => {
      // Rough estimation of memory usage
      memoryUsage += JSON.stringify(item).length * 2; // UTF-16 encoding
    });

    return {
      size: this.cache.size,
      entries: this.cache.size,
      memoryUsage
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        this.cache.delete(key);
        removed++;
      }
    });

    return removed;
  }
}

// Image optimization utilities
export const ImageOptimization = {
  /**
   * Compress image data
   */
  compressImage(
    canvas: HTMLCanvasElement,
    format: string = 'image/png',
    quality: number = 0.92
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          format,
          quality
        );
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Resize image while maintaining aspect ratio
   */
  resizeImage(
    canvas: HTMLCanvasElement,
    maxWidth: number,
    maxHeight: number
  ): HTMLCanvasElement {
    const { width, height } = canvas;
    
    // Calculate new dimensions
    let newWidth = width;
    let newHeight = height;
    
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      
      if (width > height) {
        newWidth = maxWidth;
        newHeight = maxWidth / aspectRatio;
        
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = maxHeight * aspectRatio;
        }
      } else {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
        
        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = maxWidth / aspectRatio;
        }
      }
    }
    
    // Create new canvas with resized dimensions
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    
    const ctx = resizedCanvas.getContext('2d');
    if (ctx) {
      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
    }
    
    return resizedCanvas;
  },

  /**
   * Convert image to WebP format if supported
   */
  convertToWebP(canvas: HTMLCanvasElement, quality: number = 0.92): Promise<Blob | null> {
    return new Promise((resolve) => {
      // Check WebP support
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      
      testCanvas.toBlob((blob) => {
        if (blob && blob.type === 'image/webp') {
          // WebP is supported, convert the main canvas
          canvas.toBlob(resolve, 'image/webp', quality);
        } else {
          // WebP not supported
          resolve(null);
        }
      }, 'image/webp', quality);
    });
  }
};

// Lazy loading utilities
export const LazyLoading = {
  /**
   * Create intersection observer for lazy loading
   */
  createObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD,
      ...options
    });
  },

  /**
   * Lazy load images with placeholder
   */
  setupImageLazyLoading(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img[data-src]');
    
    if (!images.length) return;

    const observer = this.createObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer?.unobserve(img);
          }
        }
      });
    });

    if (observer) {
      images.forEach((img) => observer.observe(img));
    }
  }
};

// Bundle size optimization utilities
export const BundleOptimization = {
  /**
   * Dynamic import with error handling
   */
  async dynamicImport<T = any>(importFn: () => Promise<T>): Promise<T | null> {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return null;
    }
  },

  /**
   * Preload critical resources
   */
  preloadResource(href: string, as: string, type?: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;

    document.head.appendChild(link);
  },

  /**
   * Prefetch non-critical resources
   */
  prefetchResource(href: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;

    document.head.appendChild(link);
  }
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  const monitor = PerformanceMonitor.getInstance();
  
  // Monitor page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitor.getCoreWebVitals().then((vitals) => {
        Object.entries(vitals).forEach(([name, value]) => {
          monitor.recordCustomMetric(`core-web-vitals-${name.toLowerCase()}`, value);
        });
      });
    }, 0);
  });

  // Clean up cache periodically
  const cache = new MemoryCache();
  setInterval(() => {
    const removed = cache.cleanup();
    if (removed > 0) {
      console.log(`Cleaned up ${removed} expired cache entries`);
    }
  }, 60000); // Every minute

  // Set up lazy loading
  LazyLoading.setupImageLazyLoading();
};

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const memoryCache = new MemoryCache();