// src/app/loading.tsx
import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

function LoadingSkeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    primary: 'border-gray-300 border-t-blue-600',
    white: 'border-gray-600 border-t-white',
    gray: 'border-gray-200 border-t-gray-500'
  };

  return (
    <div 
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface PulsingDotsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

function PulsingDots({ className = '', size = 'md', color = 'bg-blue-600' }: PulsingDotsProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2', 
    lg: 'w-3 h-3'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${color} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
}

// Main page loading component
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-4 py-16">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LoadingSkeleton variant="rectangular" width={32} height={32} />
              <LoadingSkeleton variant="text" width={120} height={24} />
            </div>
            
            <div className="hidden md:flex space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <LoadingSkeleton key={i} variant="text" width={80} height={20} />
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <LoadingSkeleton variant="rectangular" width={80} height={32} />
              <LoadingSkeleton variant="circular" width={32} height={32} />
            </div>
          </div>
        </div>

        {/* Hero Section Skeleton */}
        <div className="text-center mb-16">
          <LoadingSkeleton variant="text" width={400} height={48} className="mx-auto mb-4" />
          <LoadingSkeleton variant="text" width={300} height={24} className="mx-auto mb-6" />
          <LoadingSkeleton variant="text" width={600} height={20} className="mx-auto mb-8" />
          
          <div className="flex justify-center space-x-4 mb-8">
            <LoadingSkeleton variant="rectangular" width={120} height={44} />
            <LoadingSkeleton variant="rectangular" width={120} height={44} />
          </div>

          {/* Stats Skeleton */}
          <div className="flex justify-center space-x-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <LoadingSkeleton variant="text" width={40} height={32} className="mx-auto mb-2" />
                <LoadingSkeleton variant="text" width={60} height={16} className="mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Data Input Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton variant="text" width={150} height={24} className="mb-4" />
              <LoadingSkeleton variant="rectangular" width="100%" height={100} />
            </div>

            {/* Mode Selector Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton variant="text" width={200} height={24} className="mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <LoadingSkeleton key={i} variant="rectangular" width="100%" height={80} />
                ))}
              </div>
            </div>

            {/* Color Picker Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton variant="text" width={180} height={24} className="mb-4" />
              <div className="space-y-4">
                <div>
                  <LoadingSkeleton variant="text" width={120} height={16} className="mb-2" />
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <LoadingSkeleton key={i} variant="circular" width={32} height={32} />
                    ))}
                  </div>
                </div>
                <div>
                  <LoadingSkeleton variant="text" width={120} height={16} className="mb-2" />
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <LoadingSkeleton key={i} variant="circular" width={32} height={32} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Options Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton variant="text" width={160} height={24} className="mb-4" />
              <div className="space-y-4">
                <div>
                  <LoadingSkeleton variant="text" width={80} height={16} className="mb-2" />
                  <LoadingSkeleton variant="rectangular" width="100%" height={8} />
                </div>
                <div>
                  <LoadingSkeleton variant="text" width={120} height={16} className="mb-2" />
                  <LoadingSkeleton variant="rectangular" width="100%" height={40} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <LoadingSkeleton variant="rectangular" width="100%" height={48} />
              <LoadingSkeleton variant="rectangular" width={100} height={48} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* QR Preview Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton variant="text" width={100} height={24} className="mb-4" />
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8 min-h-[300px]">
                <div className="text-center">
                  <LoadingSpinner size="xl" className="mx-auto mb-4" />
                  <PulsingDots className="justify-center mb-2" />
                  <LoadingSkeleton variant="text" width={150} height={16} className="mx-auto" />
                </div>
              </div>
            </div>

            {/* Download Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton variant="text" width={100} height={24} className="mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <LoadingSkeleton key={i} variant="rectangular" width="100%" height={40} />
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton variant="text" width={120} height={24} className="mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="text-center">
                    <LoadingSkeleton variant="text" width={40} height={24} className="mx-auto mb-2" />
                    <LoadingSkeleton variant="text" width={60} height={16} className="mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section Skeleton */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <LoadingSkeleton variant="text" width={300} height={36} className="mx-auto mb-4" />
            <LoadingSkeleton variant="text" width={400} height={20} className="mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
                <LoadingSkeleton variant="circular" width={48} height={48} className="mx-auto mb-4" />
                <LoadingSkeleton variant="text" width={120} height={20} className="mx-auto mb-2" />
                <div className="space-y-1">
                  <LoadingSkeleton variant="text" width="100%" height={14} />
                  <LoadingSkeleton variant="text" width="80%" height={14} className="mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Message */}
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
          <LoadingSpinner size="sm" />
          <span className="text-gray-600 text-sm font-medium">Loading QR Generator...</span>
        </div>
      </div>
    </div>
  );
}

// Export skeleton components for reuse
export { LoadingSkeleton, LoadingSpinner, PulsingDots };