// src/app/admin/layout.tsx
'use client';

import { ReactNode, useState } from 'react';
import {
  FaBars,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-full bg-blue-600 p-2 text-white shadow-lg md:hidden"
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
            className="fixed inset-y-0 left-0 z-40 w-64 space-y-6 bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-white shadow-xl md:relative md:translate-x-0"
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

            <NavigationMenu.Root orientation="vertical" className="space-y-4">
              <NavigationMenu.List className="space-y-2">
                <NavigationMenu.Item>
                  <Link
                    href="/admin"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
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
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
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
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
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
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    )}
                  >
                    <FaVideo className="size-5" /> Videos
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href="/admin/settings"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700/50',
                      pathname === '/admin/settings' &&
                        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    )}
                  >
                    <FaCog className="size-5" /> Settings
                  </Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>

            <div className="absolute inset-x-0 bottom-6 px-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-3 rounded-lg bg-red-500/20 px-4 py-3 text-red-300 transition-colors hover:bg-red-500/30"
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
        className={`flex-1 p-4 transition-all duration-300 md:p-8`}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full overflow-x-auto rounded-xl bg-white p-4 shadow-lg md:p-6"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
