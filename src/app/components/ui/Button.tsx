// src/components/ui/Button.tsx
'use client';

import React, { forwardRef } from 'react';
import { ButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled = false,
    loading = false,
    children,
    href,
    external = false,
    'data-testid': testId,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400",
      outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800"
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2.5 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
      xl: "px-8 py-4 text-xl gap-3"
    };

    const buttonClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      loading && 'cursor-wait',
      (loading || disabled) && 'pointer-events-none',
      className
    );

    const content = (
      <>
        {loading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </>
    );

    // If href is provided, render as a link
    if (href) {
      const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
      return (
        <a
          href={href}
          className={buttonClasses}
          data-testid={testId}
          {...linkProps}
        >
          {content}
        </a>
      );
    }

    // Default button element
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        data-testid={testId}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';