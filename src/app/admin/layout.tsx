// src/app/admin/layout.tsx
'use client';

import { ReactNode, useState } from 'react';
import {
  FaBars,
  FaBook,
  FaChartLine,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
  FaVideo as FaLiveVideo,
  FaVideo,
} from 'react-icons/fa';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // const handleLogout = async () => {
  //   try {
  //     const response = await fetch('/api/auth/signout', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.ok) {
  //       router.push('/login');
  //     } else {
  //       console.error('Logout failed');
  //     }
  //   } catch (error) {
  //     console.error('Error during logout:', error);
  //   }
  // };

  return (
    <div className="flex h-[90.8vh] overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-full bg-blue-600 p-2 text-white shadow-lg md:hidden dark:bg-blue-500"
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-40 flex h-[91vh] w-64 flex-col bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-white shadow-xl md:relative md:translate-x-0"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <span className="text-xl font-bold">A</span>
                </div>
                <div className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-gray-900 bg-green-500"></div>
              </div>
              <h2 className="ml-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                Admin Panel
              </h2>
            </motion.div>

            <NavigationMenu.Root className="mt-8 flex-1">
              <NavigationMenu.List className="space-y-2">
                <NavigationMenu.Item>
                  <Link
                    href="/admin"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaChartLine className="size-5" /> Dashboard
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/users"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/users' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaUsers className="size-5" /> Users
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/webinars"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/webinars' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaVideo className="size-5" /> Webinars
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/videos"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/videos' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaVideo className="size-5" /> Videos
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/ebooks"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/ebooks' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaBook className="size-5" /> E-Books
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/four-day-plan-videos"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/four-day-plan-videos' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaVideo className="size-5" /> Four-Day
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/webinar-manager"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/webinar-manager' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaLiveVideo className="size-5" /> Webinar Manager
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/create-user"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/create-user' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaUsers className="size-5" /> Create User
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/vimeo"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname.startsWith('/admin/vimeo') &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
                    </svg>
                    Vimeo Files
                  </Link>
                </NavigationMenu.Item>
                {/* <NavigationMenu.Item>
                  <Link
                    href="/admin/settings"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/settings' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md dark:from-blue-500 dark:to-purple-500'
                    )}
                  >
                    <FaCog className="size-5" /> Settings
                  </Link>
                </NavigationMenu.Item> */}
              </NavigationMenu.List>
            </NavigationMenu.Root>

            <div className="mt-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-3 rounded-lg bg-red-500/20 px-4 py-3 text-red-300 transition-colors hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-400 dark:hover:bg-red-600/40"
              >
                <FaSignOutAlt className="size-5" /> Logout
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-auto p-4 transition-all duration-300 md:p-8"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full overflow-x-auto rounded-xl bg-white p-4 shadow-lg md:p-6 dark:bg-slate-800 dark:shadow-slate-700/50"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
