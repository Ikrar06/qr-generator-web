// src/hooks/useQRGenerator.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  QRGenerationRequest, 
  QRGenerationResponse, 
  QRGenerationState,
  QRMode,
  OutputFormat,
  DownloadOptions,
  QRGenerationHookReturn,
  ProgressState,
  ErrorCorrectionLevel
} from '@/types/qr-types';
import { QRGenerator, qrUtils } from '@/lib/qr-generator';
import { downloadQR, DownloadProgressCallback } from '@/lib/download-utils';
import { formatErrorMessage, debounce } from '@/lib/utils';
import { PERFORMANCE_CONFIG } from '@/lib/constants';

/**
 * Custom hook for QR code generation and management
 * Provides state management, generation logic, and download functionality
 */
export function useQRGenerator(): QRGenerationHookReturn {
  // State management
  const [state, setState] = useState<QRGenerationState>({
    isGenerating: false,
    isDownloading: false,
    currentQR: null,
    error: null,
    history: []
  });

  const [progress, setProgress] = useState<ProgressState>({
    stage: 'idle',
    progress: 0,
    message: ''
  });

  // Refs for managing async operations
  const generatorRef = useRef<QRGenerator>(new QRGenerator());
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<QRGenerationRequest | null>(null);

  /**
   * Generate QR code with progress tracking
   */
  const generate = useCallback(async (request: QRGenerationRequest): Promise<QRGenerationResponse> => {
    // Cancel any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    lastRequestRef.current = request;

    // Validate request
    const validation = qrUtils.validateRequest(request);
    if (!validation.isValid) {
      const error = validation.errors.join(', ');
      setState(prev => ({
        ...prev,
        error,
        isGenerating: false
      }));
      throw new Error(error);
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }));

    setProgress({
      stage: 'validating',
      progress: 10,
      message: 'Validating input data...'
    });

    try {
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Operation cancelled');
      }

      setProgress({
        stage: 'generating',
        progress: 30,
        message: 'Generating QR code...'
      });

      // Generate QR code
      const result = await generatorRef.current.generate(request);

      // Check if operation was aborted after generation
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Operation cancelled');
      }

      setProgress({
        stage: 'processing',
        progress: 70,
        message: 'Processing result...'
      });

      // Update state with result
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentQR: result,
        error: result.success ? null : result.error || 'Generation failed',
        history: result.success ? [result, ...prev.history.slice(0, 49)] : prev.history
      }));

      setProgress({
        stage: 'complete',
        progress: 100,
        message: result.success ? 'QR code generated successfully!' : 'Generation failed'
      });

      // Reset progress after delay
      setTimeout(() => {
        setProgress({
          stage: 'idle',
          progress: 0,
          message: ''
        });
      }, 2000);

      return result;

    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));

      setProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage
      });

      // Create failed response
      const failedResponse: QRGenerationResponse = {
        success: false,
        filename: request.filename || 'qr-code.png',
        format: OutputFormat.PNG,
        size: { width: 256, height: 256 },
        error: errorMessage,
        timestamp: Date.now()
      };

      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Debounced generate function for real-time preview
   */
  const generateDebounced = useCallback(
    debounce((request: QRGenerationRequest) => {
      generate(request).catch(console.error);
    }, PERFORMANCE_CONFIG.DEBOUNCE_DELAY),
    [generate]
  );

  /**
   * Download generated QR code
   */
  const download = useCallback(async (
    response: QRGenerationResponse,
    options?: Partial<DownloadOptions>
  ): Promise<void> => {
    if (!response.success || !response.data) {
      throw new Error('Invalid QR response for download');
    }

    setState(prev => ({
      ...prev,
      isDownloading: true,
      error: null
    }));

    const downloadProgress: DownloadProgressCallback = (progress, stage) => {
      setProgress({
        stage: 'processing',
        progress,
        message: stage
      });
    };

    try {
      await downloadQR(response, options, downloadProgress);
      
      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Download completed successfully!'
      });

      // Reset progress after delay
      setTimeout(() => {
        setProgress({
          stage: 'idle',
          progress: 0,
          message: ''
        });
      }, 2000);

    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));

      setProgress({
        stage: 'error',
        progress: 0,
        message: `Download failed: ${errorMessage}`
      });

      throw error;
    } finally {
      setState(prev => ({
        ...prev,
        isDownloading: false
      }));
    }
  }, []);

  /**
   * Clear current QR and reset state
   */
  const clear = useCallback(() => {
    // Cancel any ongoing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      currentQR: null,
      error: null,
      isGenerating: false,
      isDownloading: false
    }));

    setProgress({
      stage: 'idle',
      progress: 0,
      message: ''
    });

    lastRequestRef.current = null;
  }, []);

  /**
   * Retry last generation request
   */
  const retry = useCallback(async (): Promise<QRGenerationResponse | null> => {
    if (!lastRequestRef.current) {
      return null;
    }

    try {
      return await generate(lastRequestRef.current);
    } catch (error) {
      console.error('Retry failed:', error);
      return null;
    }
  }, [generate]);

  /**
   * Get QR from history by timestamp
   */
  const getFromHistory = useCallback((timestamp: number): QRGenerationResponse | null => {
    return state.history.find(qr => qr.timestamp === timestamp) || null;
  }, [state.history]);

  /**
   * Remove QR from history
   */
  const removeFromHistory = useCallback((timestamp: number) => {
    setState(prev => ({
      ...prev,
      history: prev.history.filter(qr => qr.timestamp !== timestamp)
    }));
  }, []);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: []
    }));
  }, []);

  /**
   * Update QR generator settings
   */
  const updateSettings = useCallback((options: Partial<any>) => {
    generatorRef.current = new QRGenerator(options);
  }, []);

  /**
   * Get supported formats for current mode
   */
  const getSupportedFormats = useCallback((mode: QRMode): OutputFormat[] => {
    return qrUtils.getSupportedFormats(mode);
  }, []);

  /**
   * Validate generation request
   */
  const validateRequest = useCallback((request: QRGenerationRequest) => {
    return qrUtils.validateRequest(request);
  }, []);

  /**
   * Generate preview (non-blocking)
   */
  const generatePreview = useCallback((request: QRGenerationRequest) => {
    generateDebounced(request);
  }, [generateDebounced]);

  /**
   * Batch generate multiple QR codes
   */
  const generateBatch = useCallback(async (requests: QRGenerationRequest[]): Promise<QRGenerationResponse[]> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }));

    try {
      const results = await generatorRef.current.generateBatch(requests);
      
      // Add successful results to history
      const successfulResults = results.filter(r => r.success);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        history: [...successfulResults, ...prev.history].slice(0, 50)
      }));

      return results;
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  /**
   * Cancel current operation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isGenerating: false,
      isDownloading: false
    }));

    setProgress({
      stage: 'idle',
      progress: 0,
      message: 'Operation cancelled'
    });

    // Clear cancelled message after delay
    setTimeout(() => {
      setProgress({
        stage: 'idle',
        progress: 0,
        message: ''
      });
    }, 1500);
  }, []);

  /**
   * Get generation statistics
   */
  const getStats = useCallback(() => {
    const history = state.history;
    const total = history.length;
    const successful = history.filter(qr => qr.success).length;
    const failed = total - successful;
    
    const formatBreakdown = history.reduce((acc, qr) => {
      acc[qr.format] = (acc[qr.format] || 0) + 1;
      return acc;
    }, {} as Record<OutputFormat, number>);

    const modeBreakdown: Record<string, number> = {};
    history.forEach(qr => {
      if (qr.metadata?.segments?.[0]?.mode) {
        const mode = qr.metadata.segments[0].mode;
        modeBreakdown[mode] = (modeBreakdown[mode] || 0) + 1;
      }
    });

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      formatBreakdown,
      modeBreakdown,
      averageGenerationTime: 0, // Could be tracked if needed
      lastGenerated: history.length > 0 ? history[0].timestamp : null
    };
  }, [state.history]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      generateDebounced.cancel();
    };
  }, [generateDebounced]);

  // Extended return object with additional utilities
  return {
    // Core functionality
    state,
    progress, // Add progress to the return object
    generate,
    generatePreview,
    generateDebounced,
    generateBatch,
    download,
    clear,
    retry,
    cancel,

    // History management
    getFromHistory,
    removeFromHistory,
    clearHistory,

    // Utilities
    updateSettings,
    getSupportedFormats,
    validateRequest,
    getStats,

    // Status checks
    isGenerating: state.isGenerating,
    isDownloading: state.isDownloading,
    hasError: !!state.error,
    hasCurrentQR: !!state.currentQR,
    historyCount: state.history.length
  };
}

/**
 * Hook for managing QR generation form state
 */
export function useQRForm(initialData?: Partial<QRGenerationRequest>) {
  const [formData, setFormData] = useState<QRGenerationRequest>({
    data: '',
    mode: QRMode.BASIC,
    options: {
      width: 256,
      height: 256,
      margin: 2,
      quality: 0.92,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: ErrorCorrectionLevel.MEDIUM,
      type: 'image/png'
    },
    ...initialData
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback(<K extends keyof QRGenerationRequest>(
    field: K,
    value: QRGenerationRequest[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);

    // Clear field error
    if (formErrors[field as string]) {
      setFormErrors(prev => ({
        ...prev,
        [field as string]: ''
      }));
    }
  }, [formErrors]);

  const updateOption = useCallback((option: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: value
      }
    }));
    setIsDirty(true);
  }, []);

  const updateColor = useCallback((type: 'dark' | 'light', color: string) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        color: {
          dark: prev.options?.color?.dark || '#000000',
          light: prev.options?.color?.light || '#ffffff',
          [type]: color
        }
      }
    }));
    setIsDirty(true);
  }, []);

  const updateTransparency = useCallback((isTransparent: boolean) => {
  console.log('=== DEBUG updateTransparency ===');
  console.log('updateTransparency called with:', isTransparent);
  console.log('Current formData.options:', formData.options);
  console.log('Current transparency:', formData.options?.transparent);
  
  setFormData(prev => {
    const newFormData = {
      ...prev,
      options: {
        ...prev.options,
        transparent: isTransparent,
        // IMPORTANT: Keep original color values
        color: {
          dark: prev.options?.color?.dark || '#000000',
          light: prev.options?.color?.light || '#ffffff' // Keep original color
        }
      }
    };
    
    console.log('New form data:', newFormData);
    return newFormData;
  });
  
  setIsDirty(true);
}, [formData.options]);

// Also add debug to the return statement:
console.log('Current formData in useQRForm:', formData);
console.log('formData.options?.transparent:', formData.options?.transparent);

  const validateForm = useCallback(() => {
    const validation = qrUtils.validateRequest(formData);
    const errors: Record<string, string> = {};

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        if (error.includes('Data')) {
          errors.data = error;
        } else if (error.includes('mode')) {
          errors.mode = error;
        } else {
          errors.general = error;
        }
      });
    }

    setFormErrors(errors);
    return validation.isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      data: '',
      mode: QRMode.BASIC,
      options: {
        width: 256,
        height: 256,
        margin: 2,
        quality: 0.92,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: ErrorCorrectionLevel.MEDIUM,
        type: 'image/png'
      },
      ...initialData
    });
    setFormErrors({});
    setIsDirty(false);
  }, [initialData]);

  return {
    formData,
    formErrors,
    isDirty,
    updateField,
    updateOption,
    updateColor,
    updateTransparency,
    validateForm,
    resetForm,
    isValid: Object.keys(formErrors).length === 0
  };
}