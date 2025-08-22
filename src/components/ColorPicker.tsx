// src/app/components/ColorPicker.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DEFAULT_COLORS, POPULAR_COLOR_COMBINATIONS } from '@/lib/constants';
import { isValidHexColor, toHexColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  foregroundColor: string;
  backgroundColor: string;
  isTransparent?: boolean;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
  onTransparencyChange?: (isTransparent: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  showTransparencyOption?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  foregroundColor,
  backgroundColor,
  isTransparent = false,
  onForegroundChange,
  onBackgroundChange,
  onTransparencyChange,
  disabled = false,
  loading = false,
  className,
  showTransparencyOption = true
}) => {
  const [activeColorType, setActiveColorType] = useState<'foreground' | 'background'>('foreground');
  const [customColor, setCustomColor] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const colorInputRef = useRef<HTMLInputElement>(null);

  // Load recent colors on mount (memory-based for Claude.ai compatibility)
  useEffect(() => {
    // In a real environment, you would load from localStorage
    // For Claude.ai, we'll just initialize with empty array
    setRecentColors([]);
  }, []);

  // Save recent colors (memory-based for Claude.ai compatibility)
  const saveRecentColor = (color: string) => {
    const updated = [color, ...recentColors.filter(c => c !== color)].slice(0, 8);
    setRecentColors(updated);
    // In a real environment, you would save to localStorage here
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    const hexColor = toHexColor(color);
    
    if (activeColorType === 'foreground') {
      onForegroundChange(hexColor);
    } else {
      onBackgroundChange(hexColor);
    }
    
    saveRecentColor(hexColor);
  };

  // Handle custom color input
  const handleCustomColorSubmit = () => {
    if (isValidHexColor(customColor)) {
      handleColorSelect(customColor);
      setCustomColor('');
      setShowCustomPicker(false);
    }
  };

  // Handle combination selection
  const handleCombinationSelect = (combination: typeof POPULAR_COLOR_COMBINATIONS[0]) => {
    onForegroundChange(combination.foreground);
    onBackgroundChange(combination.background);
    saveRecentColor(combination.foreground);
    saveRecentColor(combination.background);
    
    // Reset transparency when selecting a combination
    if (onTransparencyChange && isTransparent) {
      onTransparencyChange(false);
    }
  };

  // Handle transparency toggle - FIXED: Added better error handling and fallback
  const handleTransparencyToggle = () => {
    console.log('Toggle clicked, onTransparencyChange exists:', !!onTransparencyChange);
    console.log('Current isTransparent:', isTransparent);
    
    if (onTransparencyChange) {
      const newTransparent = !isTransparent;
      onTransparencyChange(newTransparent);
      
      // If enabling transparency, switch to foreground color selection
      if (newTransparent) {
        setActiveColorType('foreground');
      }
    } else {
      // Fallback: Log warning if no callback is provided
      console.warn('onTransparencyChange callback is not provided to ColorPicker component');
    }
  };

  // Swap colors
  const swapColors = () => {
    if (!isTransparent) {
      const temp = foregroundColor;
      onForegroundChange(backgroundColor);
      onBackgroundChange(temp);
    }
  };

  // Reset to default colors
  const resetToDefault = () => {
    onForegroundChange('#000000');
    onBackgroundChange('#ffffff');
    if (onTransparencyChange) {
      onTransparencyChange(false);
    }
  };

  // Get effective background color for preview
  const getEffectiveBackgroundColor = () => {
    return isTransparent ? 'transparent' : backgroundColor;
  };

  // Check if transparency toggle should be disabled
  const isTransparencyDisabled = disabled || loading;

  return (
    <Card className={cn("w-full", className)} variant="outline">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Color Customization</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={swapColors}
              disabled={disabled || loading || isTransparent}
              className="px-2"
              title="Swap colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetToDefault}
              disabled={disabled || loading}
              className="px-2"
              title="Reset to default"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Customize the foreground and background colors of your QR code. Select predefined colors or use custom hex values.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transparency Toggle - FIXED: Improved accessibility and debugging */}
        {showTransparencyOption && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Transparent Background</h4>
                <p className="text-xs text-gray-600">Remove background color for transparent QR codes</p>
              </div>
            </div>
            
            {/* FIXED: Added better structure and debugging info */}
            <div className="flex items-center">
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <span className="text-xs text-gray-400 mr-2">
                  {onTransparencyChange ? '✓' : '✗'}
                </span>
              )}
              
              <button
                type="button"
                onClick={handleTransparencyToggle}
                disabled={isTransparencyDisabled}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isTransparent ? "bg-blue-600" : "bg-gray-200",
                  isTransparencyDisabled ? "cursor-not-allowed opacity-50" : "hover:bg-opacity-80"
                )}
                role="switch"
                aria-checked={isTransparent}
                aria-labelledby="transparency-label"
              >
                <span className="sr-only">Toggle transparent background</span>
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out",
                    isTransparent ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* Color Preview */}
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="relative">
            {/* Checkered background pattern for transparency preview */}
            {isTransparent && (
              <div 
                className="absolute inset-0 w-24 h-24 rounded-lg border-2 border-gray-300"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                  `,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                }}
              />
            )}
            <div 
              className="w-24 h-24 rounded-lg border-2 border-gray-300 relative overflow-hidden"
              style={{ backgroundColor: getEffectiveBackgroundColor() }}
            >
              <div className="absolute inset-2 grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{ 
                      backgroundColor: Math.random() > 0.3 ? foregroundColor : 'transparent' 
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color Type Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveColorType('foreground')}
            disabled={disabled || loading}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
              activeColorType === 'foreground'
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: foregroundColor }}
              />
              Foreground
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveColorType('background')}
            disabled={disabled || loading || isTransparent}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
              activeColorType === 'background'
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-600 hover:text-gray-900",
              isTransparent && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded border border-gray-300 relative overflow-hidden">
                {isTransparent ? (
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                      `,
                      backgroundSize: '3px 3px',
                      backgroundPosition: '0 0, 0 1.5px, 1.5px -1.5px, -1.5px 0px'
                    }}
                  />
                ) : (
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: backgroundColor }}
                  />
                )}
              </div>
              Background
            </div>
          </button>
        </div>

        {/* Popular Color Combinations - Hidden when transparent */}
        {!isTransparent && (
          <>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Combinations</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {POPULAR_COLOR_COMBINATIONS.map((combination, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCombinationSelect(combination)}
                    disabled={disabled || loading}
                    className={cn(
                      "p-2 border rounded-lg transition-all duration-200 group",
                      "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                      foregroundColor === combination.foreground && backgroundColor === combination.background
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                    title={combination.name}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded border border-gray-300 overflow-hidden">
                        <div 
                          className="absolute inset-0"
                          style={{ backgroundColor: combination.background }}
                        />
                        <div 
                          className="absolute inset-1 rounded-sm"
                          style={{ backgroundColor: combination.foreground }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                        {combination.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Color Palette */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Color Palette</h4>
              <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                {DEFAULT_COLORS.map((color, index) => {
                  const currentColor = activeColorType === 'foreground' ? foregroundColor : backgroundColor;
                  const isSelected = currentColor === color.hex;
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleColorSelect(color.hex)}
                      disabled={disabled || loading || (activeColorType === 'background' && isTransparent)}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-all duration-200",
                        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                        isSelected 
                          ? "border-blue-500 shadow-lg scale-110" 
                          : "border-gray-300 hover:border-gray-400",
                        (activeColorType === 'background' && isTransparent) && "opacity-50 cursor-not-allowed"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      data-testid={`color-${color.value}`}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Foreground Color Palette for Transparent Mode */}
        {isTransparent && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Foreground Color</h4>
            <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
              {DEFAULT_COLORS.map((color, index) => {
                const isSelected = foregroundColor === color.hex;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorSelect(color.hex)}
                    disabled={disabled || loading}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all duration-200",
                      "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isSelected 
                        ? "border-blue-500 shadow-lg scale-110" 
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    data-testid={`color-${color.value}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Colors */}
        {recentColors.length > 0 && !isTransparent && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Colors</h4>
            <div className="flex gap-2 flex-wrap">
              {recentColors.map((color, index) => {
                const currentColor = activeColorType === 'foreground' ? foregroundColor : backgroundColor;
                const isSelected = currentColor === color;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    disabled={disabled || loading || (activeColorType === 'background' && isTransparent)}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all duration-200",
                      "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isSelected 
                        ? "border-blue-500 shadow-lg scale-110" 
                        : "border-gray-300 hover:border-gray-400",
                      (activeColorType === 'background' && isTransparent) && "opacity-50 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Colors for Transparent Mode */}
        {recentColors.length > 0 && isTransparent && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Colors</h4>
            <div className="flex gap-2 flex-wrap">
              {recentColors.map((color, index) => {
                const isSelected = foregroundColor === color;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    disabled={disabled || loading}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all duration-200",
                      "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isSelected 
                        ? "border-blue-500 shadow-lg scale-110" 
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Color Input */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Custom Color</h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              disabled={disabled || loading || (activeColorType === 'background' && isTransparent)}
            >
              {showCustomPicker ? 'Hide' : 'Show'} Custom
            </Button>
          </div>

          {showCustomPicker && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  ref={colorInputRef}
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  disabled={disabled || loading || (activeColorType === 'background' && isTransparent)}
                  error={customColor && !isValidHexColor(customColor) ? 'Invalid hex color format' : undefined}
                  className="font-mono"
                  leftIcon={
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ 
                        backgroundColor: isValidHexColor(customColor) ? customColor : '#ffffff' 
                      }}
                    />
                  }
                />
                <Button
                  onClick={handleCustomColorSubmit}
                  disabled={disabled || loading || !isValidHexColor(customColor) || (activeColorType === 'background' && isTransparent)}
                  size="md"
                >
                  Apply
                </Button>
              </div>

              {/* HTML5 Color Picker */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700">Or pick a color:</label>
                <input
                  type="color"
                  value={activeColorType === 'foreground' ? foregroundColor : backgroundColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  disabled={disabled || loading || (activeColorType === 'background' && isTransparent)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Current Colors Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Foreground Color
            </label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: foregroundColor }}
              />
              <div>
                <div className="font-mono text-sm text-gray-900">{foregroundColor}</div>
                <div className="text-xs text-gray-500">QR Pattern Color</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Background Color
            </label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded border-2 border-white shadow-sm relative overflow-hidden">
                {isTransparent ? (
                  <>
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                          linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                          linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                        `,
                        backgroundSize: '4px 4px',
                        backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                      }}
                    />
                    <div className="absolute inset-1 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">⌀</span>
                    </div>
                  </>
                ) : (
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: backgroundColor }}
                  />
                )}
              </div>
              <div>
                <div className="font-mono text-sm text-gray-900">
                  {isTransparent ? 'transparent' : backgroundColor}
                </div>
                <div className="text-xs text-gray-500">QR Background Color</div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Contrast Warning - Hidden when transparent */}
        {!isTransparent && foregroundColor && backgroundColor && (
          <ColorContrastChecker 
            foreground={foregroundColor} 
            background={backgroundColor} 
          />
        )}

        {/* Transparency Info */}
        {isTransparent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Transparent Background</h4>
                <p className="text-sm text-blue-700 mt-1">
                  The background will be transparent. This works best with PNG and SVG formats. 
                  Make sure your foreground color has good contrast against the surface where the QR code will be used.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transparent Mode Tips */}
        {isTransparent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Tips</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Choose high-contrast foreground colors (black, dark blue, dark green)</li>
                  <li>• Test your QR code on different colored backgrounds</li>
                  <li>• Avoid light colors that may not scan well on white surfaces</li>
                  <li>• PNG and SVG formats preserve transparency best</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Color contrast checker component
interface ColorContrastCheckerProps {
  foreground: string;
  background: string;
}

const ColorContrastChecker: React.FC<ColorContrastCheckerProps> = ({ 
  foreground, 
  background 
}) => {
  const calculateContrast = (color1: string, color2: string): number => {
    // Convert hex to RGB
    const getRGB = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    // Calculate relative luminance
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const { r, g, b } = rgb;
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const rgb1 = getRGB(color1);
    const rgb2 = getRGB(color2);
    const lum1 = getLuminance(rgb1);
    const lum2 = getLuminance(rgb2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const contrast = calculateContrast(foreground, background);
  
  if (contrast < 2) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-red-800">Poor Contrast</h4>
            <p className="text-sm text-red-700 mt-1">
              The color combination has low contrast (ratio: {contrast.toFixed(1)}:1) and may be difficult to scan.
            </p>
          </div>
        </div>
      </div>
    );
  } else if (contrast < 3) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Fair Contrast</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Contrast ratio: {contrast.toFixed(1)}:1. Consider using colors with higher contrast for better scanning.
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-green-800">Good Contrast</h4>
            <p className="text-sm text-green-700 mt-1">
              Excellent contrast ratio: {contrast.toFixed(1)}:1. This combination will scan well.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default ColorPicker;