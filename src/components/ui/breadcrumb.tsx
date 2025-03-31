'use client';

import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils'; // Utility function for conditional classNames

type BreadcrumbLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};
export function Breadcrumb({ children }: { children: React.ReactNode }) {
  return <nav className="text-sm text-gray-600">{children}</nav>;
}

export function BreadcrumbItem({ children }: { children: React.ReactNode }) {
  return <span className="inline-block">{children}</span>;
}
export function BreadcrumbLink({
  href,
  className,
  children,
}: BreadcrumbLinkProps) {
  return (
    <Link
      href={href}
      className={cn('text-blue-600 hover:text-blue-800', className)}
    >
      {children}
    </Link>
  );
}
