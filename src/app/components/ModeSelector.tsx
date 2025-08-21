// src/app/components/ModeSelector.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { QRMode } from '@/types/qr-types';
import { QR_MODE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  selectedMode: QRMode;
  onModeChange: (mode: QRMode) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const MODE_ICONS = {
  [QRMode.BASIC]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  [QRMode.COLORED]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
    </svg>
  ),
  [QRMode.SVG]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
    </svg>
  ),
  [QRMode.HIGH_QUALITY]: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
};

const MODE_COLORS = {
  [QRMode.BASIC]: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    selectedBg: 'bg-gray-100',
    selectedBorder: 'border-gray-400',
    icon: 'text-gray-600',
    selectedIcon: 'text-gray-800'
  },
  [QRMode.COLORED]: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    selectedBg: 'bg-blue-100',
    selectedBorder: 'border-blue-500',
    icon: 'text-blue-600',
    selectedIcon: 'text-blue-800'
  },
  [QRMode.SVG]: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    selectedBg: 'bg-purple-100',
    selectedBorder: 'border-purple-500',
    icon: 'text-purple-600',
    selectedIcon: 'text-purple-800'
  },
  [QRMode.HIGH_QUALITY]: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    selectedBg: 'bg-green-100',
    selectedBorder: 'border-green-500',
    icon: 'text-green-600',
    selectedIcon: 'text-green-800'
  }
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  disabled = false,
  loading = false,
  className
}) => {
  const modes = Object.entries(QR_MODE_CONFIG) as [QRMode, typeof QR_MODE_CONFIG[QRMode]][];

  return (
    <Card className={cn("w-full", className)} variant="outline">
      <CardHeader>
        <CardTitle>Generation Mode</CardTitle>
        <CardDescription>
          Choose how you want your QR code to be generated. Each mode offers different features and quality levels.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map(([mode, config]) => {
            const isSelected = selectedMode === mode;
            const colors = MODE_COLORS[mode];
            
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onModeChange(mode)}
                disabled={disabled || loading}
                className={cn(
                  "p-4 border-2 rounded-lg transition-all duration-200 text-left group",
                  "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  isSelected
                    ? `${colors.selectedBg} ${colors.selectedBorder} shadow-md`
                    : `${colors.bg} ${colors.border} hover:${colors.selectedBorder}`,
                  disabled && "opacity-50 cursor-not-allowed hover:shadow-none"
                )}
                data-testid={`mode-${mode}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "flex-shrink-0 p-2 rounded-md",
                    isSelected 
                      ? `${colors.selectedIcon} bg-white` 
                      : `${colors.icon} ${colors.selectedBg}`
                  )}>
                    {MODE_ICONS[mode]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-gray-900" : "text-gray-700"
                      )}>
                        {config.name}
                      </h3>
                      
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <p className={cn(
                      "text-xs mt-1",
                      isSelected ? "text-gray-700" : "text-gray-600"
                    )}>
                      {config.description}
                    </p>
                    
                    <div className="mt-2 space-y-1">
                      {config.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-500">
                          <svg className="w-3 h-3 text-green-500 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Mode Details */}
        {selectedMode && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              {QR_MODE_CONFIG[selectedMode].name} Mode Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {QR_MODE_CONFIG[selectedMode].features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};