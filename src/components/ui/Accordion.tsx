// src/components/ui/Accordion.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  children: React.ReactNode;
  defaultValue?: string | string[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  children,
  defaultValue,
  allowMultiple = false,
  className
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (Array.isArray(defaultValue)) {
      return new Set(defaultValue);
    }
    return defaultValue ? new Set([defaultValue]) : new Set();
  });

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(value);
      }
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function AccordionItem({ children, value, className }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within Accordion');
  }

  const isOpen = context.openItems.has(value);

  return (
    <div
      className={cn(
        'border border-gray-200 rounded-xl overflow-hidden transition-all duration-200',
        isOpen && 'shadow-md border-blue-200',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { ...child.props, value, isOpen } as any);
        }
        return child;
      })}
    </div>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  value?: string;
  isOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function AccordionTrigger({
  children,
  value,
  isOpen,
  className,
  icon
}: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context || !value) {
    throw new Error('AccordionTrigger must be used within AccordionItem');
  }

  return (
    <button
      type="button"
      onClick={() => context.toggleItem(value)}
      className={cn(
        'w-full px-6 py-4 flex items-center justify-between text-left',
        'bg-white hover:bg-gray-50 transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
        isOpen && 'bg-blue-50 border-b border-blue-100',
        className
      )}
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon && (
          <div className={cn(
            'flex-shrink-0 transition-colors duration-200',
            isOpen ? 'text-blue-600' : 'text-gray-400'
          )}>
            {icon}
          </div>
        )}
        <div className={cn(
          'font-medium transition-colors duration-200',
          isOpen ? 'text-blue-900' : 'text-gray-900'
        )}>
          {children}
        </div>
      </div>
      <svg
        className={cn(
          'w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0',
          isOpen && 'transform rotate-180 text-blue-600'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  className?: string;
}

export function AccordionContent({ children, isOpen, className }: AccordionContentProps) {
  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      <div className={cn('px-6 py-4 bg-white', className)}>
        {children}
      </div>
    </div>
  );
}
