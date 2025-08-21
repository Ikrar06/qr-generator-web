// src/components/ui/Input.tsx
'use client';

import React, { forwardRef, useState } from 'react';
import { InputProps, TextareaProps } from '@/lib/types';
import { cn } from '@/lib/utils';

// Input Component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    label,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled = false,
    loading = false,
    'data-testid': testId,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const baseStyles = "relative transition-colors duration-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantStyles = {
      default: "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20",
      filled: "border-transparent bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20",
      outline: "border-2 border-gray-300 bg-transparent focus:border-blue-500 focus:ring-blue-500/20"
    };

    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-4 py-3 text-lg"
    };

    const stateStyles = {
      error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
      disabled: "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200",
      loading: "bg-gray-50 cursor-wait"
    };

    const getStateStyle = () => {
      if (loading) return stateStyles.loading;
      if (disabled) return stateStyles.disabled;
      if (error) return stateStyles.error;
      if (success) return stateStyles.success;
      return '';
    };

    const inputClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      getStateStyle(),
      fullWidth && 'w-full',
      Boolean(leftIcon) && 'pl-10',
      Boolean(rightIcon || loading) && 'pr-10',
      className
    );

    const InputElement = (
      <div className={cn("relative", fullWidth && 'w-full')}>
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled || loading}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-testid={testId}
          {...props}
        />

        {(rightIcon || loading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : rightIcon}
          </div>
        )}
      </div>
    );

    if (!label && !helperText && !error && !success) {
      return InputElement;
    }

    return (
      <div className={cn("space-y-1.5", fullWidth && 'w-full')}>
        {label && (
          <label className={cn(
            "block text-sm font-medium",
            error ? "text-red-700" : success ? "text-green-700" : "text-gray-700",
            disabled && "text-gray-400"
          )}>
            {label}
          </label>
        )}
        
        {InputElement}
        
        {(helperText || error || success) && (
          <p className={cn(
            "text-xs",
            error ? "text-red-600" : success ? "text-green-600" : "text-gray-500"
          )}>
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    label,
    helperText,
    error,
    success,
    fullWidth = false,
    disabled = false,
    loading = false,
    resize = 'vertical',
    rows = 4,
    maxLength,
    'data-testid': testId,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const baseStyles = "relative transition-colors duration-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantStyles = {
      default: "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20",
      filled: "border-transparent bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20",
      outline: "border-2 border-gray-300 bg-transparent focus:border-blue-500 focus:ring-blue-500/20"
    };

    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-4 py-3 text-lg"
    };

    const resizeStyles = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize"
    };

    const stateStyles = {
      error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
      disabled: "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200",
      loading: "bg-gray-50 cursor-wait"
    };

    const getStateStyle = () => {
      if (loading) return stateStyles.loading;
      if (disabled) return stateStyles.disabled;
      if (error) return stateStyles.error;
      if (success) return stateStyles.success;
      return '';
    };

    const textareaClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      resizeStyles[resize],
      getStateStyle(),
      fullWidth && 'w-full',
      className
    );

    const currentLength = props.value?.toString().length || 0;
    const showCounter = maxLength && maxLength > 0;

    const TextareaElement = (
      <div className={cn("relative", fullWidth && 'w-full')}>
        <textarea
          ref={ref}
          className={textareaClasses}
          disabled={disabled || loading}
          rows={rows}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-testid={testId}
          {...props}
        />
        
        {showCounter && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );

    if (!label && !helperText && !error && !success) {
      return TextareaElement;
    }

    return (
      <div className={cn("space-y-1.5", fullWidth && 'w-full')}>
        {label && (
          <label className={cn(
            "block text-sm font-medium",
            error ? "text-red-700" : success ? "text-green-700" : "text-gray-700",
            disabled && "text-gray-400"
          )}>
            {label}
          </label>
        )}
        
        {TextareaElement}
        
        {(helperText || error || success) && (
          <p className={cn(
            "text-xs",
            error ? "text-red-600" : success ? "text-green-600" : "text-gray-500"
          )}>
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';