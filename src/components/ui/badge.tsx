'use client';

import * as React from 'react';

import { cn } from '@/lib/utils'; // Ensure cn utility exists

type BadgeProps = {
  variant?: 'default' | 'outline';
  className?: string;
  children: React.ReactNode;
};

export function Badge({
  variant = 'default',
  className,
  children,
}: BadgeProps) {
  const baseStyles = 'px-2 py-1 text-sm font-medium rounded';
  const variantStyles =
    variant === 'outline'
      ? 'border border-gray-300 bg-white text-gray-700'
      : 'bg-gray-200 text-gray-500';

  return (
    <span className={cn(baseStyles, variantStyles, className)}>{children}</span>
  );
}
