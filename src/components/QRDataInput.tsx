// src/components/QRDataInput.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { QRDataType, ValidationResult } from '@/types/qr-types';
import { validateQRInput, debounce } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface QRDataInputProps {
  value: string;
  onChange: (value: string) => void;
  dataType: QRDataType;
  onDataTypeChange: (type: QRDataType) => void;
  onValidationChange?: (result: ValidationResult) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const DATA_TYPE_OPTIONS = [
  {
    value: QRDataType.TEXT,
    label: 'Text',
    description: 'Plain text content',
    placeholder: 'Enter any text...',
    example: 'Hello World!'
  },
  {
    value: QRDataType.URL,
    label: 'Website URL',
    description: 'Web address or link',
    placeholder: 'https://example.com',
    example: 'https://www.google.com'
  },
  {
    value: QRDataType.EMAIL,
    label: 'Email',
    description: 'Email address',
    placeholder: 'user@example.com',
    example: 'contact@example.com'
  },
  {
    value: QRDataType.PHONE,
    label: 'Phone',
    description: 'Phone number',
    placeholder: '+1234567890',
    example: '+1 (555) 123-4567'
  },
  {
    value: QRDataType.SMS,
    label: 'SMS',
    description: 'SMS message with phone number',
    placeholder: 'SMSTO:+1234567890:Your message here',
    example: 'SMSTO:+1234567890:Hello from QR code!'
  },
  {
    value: QRDataType.WIFI,
    label: 'WiFi',
    description: 'WiFi network configuration',
    placeholder: 'WIFI:T:WPA;S:NetworkName;P:Password;;',
    example: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;'
  }
];

export const QRDataInput: React.FC<QRDataInputProps> = ({
  value,
  onChange,
  dataType,
  onDataTypeChange,
  onValidationChange,
  disabled = false,
  loading = false,
  className
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  });

  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const currentDataType = DATA_TYPE_OPTIONS.find(option => option.value === dataType);
  const maxLength = 4296; // QR Code maximum capacity

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((inputValue: string, inputType: QRDataType) => {
      const result = validateQRInput(inputValue, inputType);
      setValidation(result);
      onValidationChange?.(result);
    }, 300),
    [onValidationChange]
  );

  // Update character count and trigger validation
  useEffect(() => {
    setCharCount(value.length);
    if (value.trim()) {
      debouncedValidate(value, dataType);
    } else {
      const emptyResult: ValidationResult = {
        isValid: value.length === 0,
        errors: value.length === 0 ? [] : ['Input data cannot be empty'],
        warnings: [],
        suggestions: []
      };
      setValidation(emptyResult);
      onValidationChange?.(emptyResult);
    }
  }, [value, dataType, debouncedValidate, onValidationChange]);

  // Handle data type change
  const handleDataTypeChange = (newType: QRDataType) => {
    onDataTypeChange(newType);
    
    // Auto-format data if switching to specific types
    if (newType === QRDataType.URL && value && !value.startsWith('http')) {
      onChange(`https://${value}`);
    } else if (newType === QRDataType.EMAIL && value.includes('@') && !value.startsWith('mailto:')) {
      onChange(`mailto:${value}`);
    } else if (newType === QRDataType.PHONE && value && !value.startsWith('tel:')) {
      const cleanPhone = value.replace(/[^\d+]/g, '');
      onChange(`tel:${cleanPhone}`);
    }
  };

  // Handle paste event for auto-detection
  const handlePaste = (event: React.ClipboardEvent) => {
    const pastedText = event.clipboardData.getData('text');
    
    // Auto-detect data type based on content
    if (pastedText.startsWith('http://') || pastedText.startsWith('https://')) {
      onDataTypeChange(QRDataType.URL);
    } else if (pastedText.includes('@') && pastedText.includes('.')) {
      onDataTypeChange(QRDataType.EMAIL);
    } else if (/^[\+]?[0-9\(\)\-\s\.]{7,}$/.test(pastedText)) {
      onDataTypeChange(QRDataType.PHONE);
    } else if (pastedText.startsWith('WIFI:')) {
      onDataTypeChange(QRDataType.WIFI);
    } else if (pastedText.startsWith('SMSTO:')) {
      onDataTypeChange(QRDataType.SMS);
    }
  };

  // Insert example data
  const insertExample = () => {
    if (currentDataType?.example) {
      onChange(currentDataType.example);
    }
  };

  return (
    <Card className={cn("w-full", className)} variant="outline">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QR Code Data</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-normal px-2 py-1 rounded",
              charCount > maxLength * 0.9 
                ? "bg-red-100 text-red-700"
                : charCount > maxLength * 0.7
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600"
            )}>
              {charCount}/{maxLength}
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          Enter the data you want to encode in the QR code. Choose the appropriate data type for better validation.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Data Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DATA_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleDataTypeChange(option.value)}
                disabled={disabled || loading}
                className={cn(
                  "p-3 text-left border rounded-lg transition-all duration-200",
                  "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  dataType === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Data Content
            </label>
            <button
              type="button"
              onClick={insertExample}
              disabled={disabled || loading}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
            >
              Insert Example
            </button>
          </div>

          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={currentDataType?.placeholder || 'Enter your data here...'}
            disabled={disabled || loading}
            error={validation.errors.length > 0 ? validation.errors[0] : undefined}
            success={validation.isValid && value.trim().length > 0 ? 'Data is valid' : undefined}
            rows={6}
            maxLength={maxLength}
            fullWidth
            className={cn(
              "font-mono text-sm",
              isFocused && "ring-2 ring-blue-500/20"
            )}
            data-testid="qr-data-input"
          />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled || loading || !value}
              className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              Clear
            </button>
            
            {dataType === QRDataType.URL && (
              <button
                type="button"
                onClick={() => {
                  if (value && !value.startsWith('http')) {
                    onChange(`https://${value}`);
                  }
                }}
                disabled={disabled || loading || !value}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Add HTTPS
              </button>
            )}
            
            {dataType === QRDataType.EMAIL && (
              <button
                type="button"
                onClick={() => {
                  if (value && !value.startsWith('mailto:')) {
                    onChange(`mailto:${value}`);
                  }
                }}
                disabled={disabled || loading || value.startsWith('mailto:')}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Add Mailto
              </button>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {(validation.warnings.length > 0 || validation.suggestions.length > 0) && (
          <div className="space-y-2">
            {validation.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Warnings</h4>
                    <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validation.suggestions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Suggestions</h4>
                    <ul className="mt-1 text-sm text-blue-700 space-y-1">
                      {validation.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Type Examples */}
        {currentDataType && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              {currentDataType.label} Format
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {currentDataType.description}
            </p>
            <div className="bg-white border rounded px-3 py-2">
              <code className="text-xs text-gray-800 font-mono">
                {currentDataType.example}
              </code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};