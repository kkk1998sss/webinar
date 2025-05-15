'use client';

import * as React from 'react';

import { cn } from '@/lib/utils'; // Ensure this exists

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white p-4 shadow dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 border-b pb-2 dark:border-slate-700">{children}</div>
  );
}
export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold dark:text-slate-100">{children}</h2>
  );
}
