// src/types/global.d.ts - Updated global types with Google Analytics support
export interface QRAppGlobal {
  markStart: (operation: string) => void;
  markEnd: (operation: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setProgress: (percent: number) => void;
  analytics: {
    track: (event: string, properties?: Record<string, any>) => void;
  };
  reportError: (error: Error | string, context?: Record<string, any>) => void;
}

// Google Analytics 4 (gtag) types
interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  description?: string;
  fatal?: boolean;
  error_id?: string;
  page_title?: string;
  page_location?: string;
  [key: string]: any;
}

interface GtagConfigParams {
  page_title?: string;
  page_location?: string;
  custom_map?: Record<string, string>;
  [key: string]: any;
}

type GtagCommand = 'config' | 'event' | 'js' | 'set';

declare global {
  interface Window {
    QRApp?: QRAppGlobal;
    dataLayer?: any[];
    gtag?: (
      command: GtagCommand,
      targetId: string | Date,
      config?: GtagConfigParams | GtagEventParams
    ) => void;
  }

  // Global gtag function declaration
  var gtag: (
    command: GtagCommand,
    targetId: string | Date,
    config?: GtagConfigParams | GtagEventParams
  ) => void;

  // Service Worker types
  interface Navigator {
    serviceWorker?: ServiceWorkerContainer;
  }

  // Performance API extensions
  interface Performance {
    mark?: (markName: string) => void;
    measure?: (measureName: string, startMark?: string, endMark?: string) => void;
  }
}

export {};