'use client';

import { useEffect, useState } from 'react';
import { FaEdit, FaFilter, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import * as Popover from '@radix-ui/react-popover';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Simulate page load animation
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/register')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const deleteUser = async (id: string) => {
    await fetch(`/api/register/${id}`, { method: 'DELETE' });
    setUsers(users.filter((u) => u.id !== id));
  };

  // Filter users based on search query and status filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesFilter;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  if (!isPageLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.h1
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-semibold text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          All Users
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href="/users/live-webinar"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
          >
            <FaPlus className="size-4" />
            Create
          </Link>
        </motion.div>
      </div>

      <Separator.Root className="h-px w-full bg-gray-200" />

      {/* Search and Filter Controls */}
      <motion.div
        className="flex flex-col gap-4 md:flex-row"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <select
            className="rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </motion.div>

      {loading ? (
        <motion.div
          className="flex items-center justify-center p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="size-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </motion.div>
      ) : (
        <div className="w-full overflow-auto rounded-xl border border-gray-200 shadow-sm">
          <ScrollArea.Root className="w-full">
            <ScrollArea.Viewport className="w-full">
              <motion.table
                className="w-full min-w-[800px] text-sm text-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left font-medium text-gray-500">
                      S.No
                    </th>
                    <th className="p-4 text-left font-medium text-gray-500">
                      Name
                    </th>
                    <th className="p-4 text-left font-medium text-gray-500">
                      Email
                    </th>
                    <th className="p-4 text-left font-medium text-gray-500">
                      Phone
                    </th>
                    <th className="p-4 text-left font-medium text-gray-500">
                      Status
                    </th>
                    <th className="p-4 text-left font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        className="border-t transition hover:bg-gray-50"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0 }}
                        whileHover={{
                          backgroundColor: 'rgba(243, 244, 246, 0.5)',
                        }}
                      >
                        <td className="p-4">{index + 1}</td>
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.phoneNumber}</td>
                        <td className="p-4">
                          <Badge
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Link
                              href={`/admin/users/${user.id}/edit`}
                              className="rounded-full bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                            >
                              <FaEdit className="size-4" />
                            </Link>

                            <Popover.Root>
                              <Popover.Trigger asChild>
                                <button className="rounded-full bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200">
                                  <FaTrash className="size-4" />
                                </button>
                              </Popover.Trigger>
                              <Popover.Portal>
                                <Popover.Content
                                  side="top"
                                  align="center"
                                  className="z-50 w-64 rounded-lg border bg-white p-4 text-sm shadow-lg"
                                >
                                  <p className="mb-3 text-gray-800">
                                    Are you sure you want to delete this user?
                                  </p>
                                  <div className="flex justify-end gap-2">
                                    <Popover.Close asChild>
                                      <button className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 transition-colors hover:bg-gray-200">
                                        Cancel
                                      </button>
                                    </Popover.Close>
                                    <button
                                      className="rounded-lg bg-red-600 px-3 py-1 text-white transition-colors hover:bg-red-700"
                                      onClick={() => deleteUser(user.id)}
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </Popover.Content>
                              </Popover.Portal>
                            </Popover.Root>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredUsers.length === 0 && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                            <FaSearch className="size-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm text-gray-500">
                            {searchQuery || filterStatus !== 'all'
                              ? 'Try adjusting your search or filter criteria'
                              : 'There are no users in the system yet'}
                          </p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </motion.table>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="w-2 bg-gray-100"
            >
              <ScrollArea.Thumb className="rounded bg-gray-400" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      )}
    </motion.div>
  );
}
