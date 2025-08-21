// src/components/ui/Card.tsx
'use client';

import React, { forwardRef } from 'react';
import { CardProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    hover = false,
    clickable = false,
    onClick,
    children,
    'data-testid': testId,
    ...props
  }, ref) => {
    const baseStyles = "rounded-lg transition-all duration-200";

    const variantStyles = {
      default: "bg-white border border-gray-200",
      outline: "bg-transparent border-2 border-gray-300",
      filled: "bg-gray-50 border border-gray-200",
      elevated: "bg-white border border-gray-200 shadow-lg"
    };

    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10"
    };

    const interactionStyles = {
      hover: "hover:shadow-md hover:-translate-y-0.5",
      clickable: "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
    };

    const getInteractionStyle = () => {
      if (clickable || onClick) return interactionStyles.clickable;
      if (hover) return interactionStyles.hover;
      return '';
    };

    const cardClasses = cn(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      getInteractionStyle(),
      className
    );

    const CardComponent = (
      <div
        ref={ref}
        className={cardClasses}
        onClick={onClick}
        data-testid={testId}
        {...props}
      >
        {children}
      </div>
    );

    return CardComponent;
  }
);

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900", className)}
      {...props}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600", className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';