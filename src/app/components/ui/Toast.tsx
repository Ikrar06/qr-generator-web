'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ToastProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ANIMATION_DURATION, Z_INDEX } from '@/lib/constants';

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 5000,
  position = 'top-right',
  onClose,
  action,
  className,
  'data-testid': testId
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const typeStyles = {
    success: {
      bg: "bg-green-50 border-green-200",
      icon: "text-green-500",
      title: "text-green-900",
      message: "text-green-700",
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: "text-red-500",
      title: "text-red-900",
      message: "text-red-700",
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-500",
      title: "text-yellow-900",
      message: "text-yellow-700",
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: "text-blue-500",
      title: "text-blue-900",
      message: "text-blue-700",
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const positionStyles = {
    'top-left': "top-4 left-4",
    'top-center': "top-4 left-1/2 transform -translate-x-1/2",
    'top-right': "top-4 right-4",
    'bottom-left': "bottom-4 left-4",
    'bottom-center': "bottom-4 left-1/2 transform -translate-x-1/2",
    'bottom-right': "bottom-4 right-4"
  };

  const currentStyle = typeStyles[type];

  // Auto dismiss
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, ANIMATION_DURATION.FAST);
  };

  if (!isVisible) return null;

  const toastContent = (
    <div
      className={cn(
        "fixed z-50 w-full max-w-sm",
        positionStyles[position]
      )}
      style={{ zIndex: Z_INDEX.TOAST }}
      data-testid={testId}
    >
      <div
        className={cn(
          "relative rounded-lg border p-4 shadow-lg transition-all duration-200",
          currentStyle.bg,
          isAnimating ? "animate-out fade-out slide-out-to-right-full" : "animate-in fade-in slide-in-from-right-full",
          className
        )}
      >
        <div className="flex items-start">
          {/* Icon */}
          <div className={cn("flex-shrink-0", currentStyle.icon)}>
            {currentStyle.iconSvg}
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            {title && (
              <h4 className={cn("text-sm font-medium", currentStyle.title)}>
                {title}
              </h4>
            )}
            <p className={cn(
              "text-sm",
              title ? "mt-1" : "",
              currentStyle.message
            )}>
              {message}
            </p>
            
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={cn(
                    "text-sm font-medium underline hover:no-underline transition-all duration-200",
                    currentStyle.title
                  )}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={cn(
              "ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200",
              currentStyle.icon
            )}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar for auto-dismiss */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-current opacity-30 transition-all ease-linear"
              style={{
                animation: `toast-progress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Render toast in portal
  if (typeof document !== 'undefined') {
    return createPortal(toastContent, document.body);
  }

  return null;
};

Toast.displayName = 'Toast';

// Toast Hook for easier usage
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Date.now().toString();
    const newToast = {
      ...toast,
      id,
      onClose: () => removeToast(id)
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, type: 'success', message });

  const error = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, type: 'error', message });

  const warning = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, type: 'warning', message });

  const info = (message: string, options?: Partial<ToastProps>) => 
    addToast({ ...options, type: 'info', message });

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };
};

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>
  );
};