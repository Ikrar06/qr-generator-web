// src/app/components/LoadingSpinner.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'circular' | 'dots' | 'bars' | 'pulse' | 'ring' | 'wave';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: string;
  className?: string;
  label?: string;
  showLabel?: boolean;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const CircularSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-blue-600', 
  className,
  label 
}) => (
  <svg
    className={cn(
      'animate-spin',
      sizeClasses[size],
      color,
      className
    )}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
    {label && <title>{label}</title>}
  </svg>
);

const DotsSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'bg-blue-600', 
  className 
}) => {
  const dotSize = size === 'xs' ? 'w-1 h-1' : 
                 size === 'sm' ? 'w-1.5 h-1.5' :
                 size === 'md' ? 'w-2 h-2' :
                 size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            dotSize,
            color
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

const BarsSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'bg-blue-600', 
  className 
}) => {
  const barWidth = size === 'xs' ? 'w-0.5' : 
                  size === 'sm' ? 'w-1' :
                  size === 'md' ? 'w-1' :
                  size === 'lg' ? 'w-1.5' : 'w-2';
  
  const barHeight = size === 'xs' ? 'h-3' : 
                   size === 'sm' ? 'h-4' :
                   size === 'md' ? 'h-6' :
                   size === 'lg' ? 'h-8' : 'h-12';
  
  return (
    <div className={cn('flex items-end space-x-0.5', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse',
            barWidth,
            barHeight,
            color
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );
};

const PulseSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'bg-blue-600', 
  className 
}) => (
  <div
    className={cn(
      'rounded-full animate-ping',
      sizeClasses[size],
      color,
      'opacity-75',
      className
    )}
  />
);

const RingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-blue-600', 
  className 
}) => (
  <div
    className={cn(
      'animate-spin rounded-full border-2 border-gray-200',
      sizeClasses[size],
      `${color} border-t-transparent`,
      className
    )}
  />
);

const WaveSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'bg-blue-600', 
  className 
}) => {
  const waveHeight = size === 'xs' ? 'h-2' : 
                    size === 'sm' ? 'h-3' :
                    size === 'md' ? 'h-4' :
                    size === 'lg' ? 'h-6' : 'h-8';
  
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'w-1 animate-pulse',
            waveHeight,
            color
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'circular',
  showLabel = false,
  label = 'Loading...',
  ...props
}) => {
  const SpinnerComponent = {
    circular: CircularSpinner,
    dots: DotsSpinner,
    bars: BarsSpinner,
    pulse: PulseSpinner,
    ring: RingSpinner,
    wave: WaveSpinner
  }[variant];

  return (
    <div className="flex flex-col items-center justify-center">
      <SpinnerComponent {...props} label={label} />
      {showLabel && (
        <span className="mt-2 text-sm text-gray-600 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

// Skeleton Loading Components
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width = '100%',
  height = '1rem',
  rounded = false
}) => (
  <div
    className={cn(
      'animate-pulse bg-gray-200',
      rounded ? 'rounded-full' : 'rounded',
      className
    )}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }}
  />
);

// QR Preview Skeleton
export const QRPreviewSkeleton: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="flex justify-center">
      <Skeleton width={256} height={256} className="rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton height="1rem" width="60%" className="mx-auto" />
      <Skeleton height="0.75rem" width="40%" className="mx-auto" />
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton height="1rem" width="25%" />
      <Skeleton height="2.5rem" />
    </div>
    <div className="space-y-2">
      <Skeleton height="1rem" width="30%" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height="3rem" />
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton height="1rem" width="20%" />
      <div className="flex space-x-4">
        <Skeleton height="2rem" width="4rem" rounded />
        <Skeleton height="2rem" width="4rem" rounded />
      </div>
    </div>
    <Skeleton height="3rem" />
  </div>
);

// Card List Skeleton
export const CardListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton width={40} height={40} rounded />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="60%" />
            <Skeleton height="0.75rem" width="40%" />
          </div>
        </div>
        <Skeleton height="0.75rem" />
        <div className="flex space-x-2">
          <Skeleton height="2rem" width="5rem" />
          <Skeleton height="2rem" width="4rem" />
        </div>
      </div>
    ))}
  </div>
);

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  label,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showValue && (
            <span className="text-sm text-gray-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Loading states for different components
export const LoadingStates = {
  // Button loading state
  ButtonLoading: ({ size = 'md' }: { size?: SpinnerSize }) => (
    <LoadingSpinner variant="circular" size={size} color="text-white" />
  ),

  // Page loading state
  PageLoading: ({ message = 'Loading...' }: { message?: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner variant="circular" size="lg" showLabel label={message} />
      </div>
    </div>
  ),

  // Section loading state
  SectionLoading: ({ message = 'Loading content...' }: { message?: string }) => (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner variant="dots" size="md" showLabel label={message} />
    </div>
  ),

  // Inline loading state
  InlineLoading: ({ size = 'sm' }: { size?: SpinnerSize }) => (
    <LoadingSpinner variant="circular" size={size} className="inline-block" />
  ),

  // QR Generation loading state
  QRGenerationLoading: () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <LoadingSpinner variant="ring" size="lg" color="border-blue-600" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-900">Generating QR Code</p>
        <p className="text-xs text-gray-600">This may take a moment...</p>
      </div>
    </div>
  ),

  // Download loading state
  DownloadLoading: () => (
    <div className="flex items-center space-x-2">
      <LoadingSpinner variant="circular" size="sm" />
      <span className="text-sm text-gray-600">Preparing download...</span>
    </div>
  )
};

export default LoadingSpinner