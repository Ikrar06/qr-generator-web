// src/hooks/useQRForm.ts
'use client';

import { useState, useCallback } from 'react';
import { 
  QRGenerationRequest, 
  QRMode,
  ErrorCorrectionLevel,
  QRDataType
} from '@/types/qr-types';
import { qrUtils } from '@/lib/qr-generator';

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

  // Add debug to the return statement:
  console.log('Current formData in useQRForm:', formData);
  console.log('formData.options?.transparent:', formData.options?.transparent);

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