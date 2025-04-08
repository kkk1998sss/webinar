// src/app/admin/layout.tsx
'use client';

import { ReactNode } from 'react';
import { FaUsers, FaVideo } from 'react-icons/fa';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 space-y-8 bg-gray-900 p-6 text-white">
        <h2 className="text-center text-2xl font-bold">Admin Panel</h2>

        <NavigationMenu.Root orientation="vertical" className="space-y-4">
          <NavigationMenu.List className="space-y-2">
            <NavigationMenu.Item>
              <Link
                href="/admin/users"
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition-colors',
                  pathname === '/admin/users' && 'bg-blue-600 text-white'
                )}
              >
                <FaUsers /> Users
              </Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <Link
                href="/admin/webinars"
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition-colors',
                  pathname === '/admin/webinars' && 'bg-blue-600 text-white'
                )}
              >
                <FaVideo /> Webinars
              </Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
