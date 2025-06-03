'use client';

import { useEffect, useState } from 'react';
import {
  FaBook,
  FaEdit,
  FaFilter,
  FaPlus,
  FaSearch,
  FaTrash,
} from 'react-icons/fa';
import * as Popover from '@radix-ui/react-popover';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

type EBook = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  downloads: number;
};

export default function EBooksPage() {
  const [ebooks, setEBooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  useEffect(() => {
    fetchEBooks();
  }, []);

  const fetchEBooks = async () => {
    try {
      const response = await fetch('/api/ebooks');
      const data = await response.json();
      setEBooks(data.ebooks);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ebook?')) {
      try {
        const response = await fetch(`/api/ebooks/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEBooks(ebooks.filter((ebook) => ebook.id !== id));
        } else {
          console.error('Failed to delete ebook');
        }
      } catch (error) {
        console.error('Error deleting ebook:', error);
      }
    }
  };

  const filteredEBooks = ebooks.filter((ebook) => {
    const matchesSearch =
      ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && ebook.isActive) ||
      (filterStatus === 'inactive' && !ebook.isActive);
    return matchesSearch && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.h1
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          E-Books Management
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-4"
        >
          <Link
            href="/users/ebooks"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <FaPlus /> Add New E-Book
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search ebooks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              <FaFilter /> Filter
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="w-48 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              sideOffset={5}
            >
              <div className="space-y-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`w-full rounded px-3 py-2 text-left text-sm ${
                    filterStatus === 'all'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All E-Books
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`w-full rounded px-3 py-2 text-left text-sm ${
                    filterStatus === 'active'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`w-full rounded px-3 py-2 text-left text-sm ${
                    filterStatus === 'inactive'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </motion.div>

      {loading ? (
        <motion.div
          className="flex items-center justify-center p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="size-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Loading ebooks...
          </span>
        </motion.div>
      ) : (
        <div className="w-full overflow-auto rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
          <ScrollArea.Root className="w-full">
            <ScrollArea.Viewport className="w-full">
              <motion.table
                className="w-full min-w-[800px] text-xs text-gray-700 dark:text-gray-300"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <thead>
                  <tr>
                    <th className="w-12 p-2 text-center font-medium text-gray-500 dark:text-gray-400">
                      S.No
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Title
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      File Type
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Downloads
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEBooks.map((ebook, index) => (
                    <motion.tr
                      key={ebook.id}
                      variants={itemVariants}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          {ebook.thumbnail ? (
                            <Image
                              src={ebook.thumbnail}
                              alt={ebook.title}
                              width={80}
                              height={80}
                              className="size-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                              <FaBook className="size-5 text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium">{ebook.title}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <p className="line-clamp-2">{ebook.description}</p>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{ebook.fileType}</Badge>
                      </td>
                      <td className="p-2">{ebook.downloads}</td>
                      <td className="p-2">
                        <Badge
                          variant={ebook.isActive ? 'default' : 'outline'}
                          className={
                            ebook.isActive
                              ? 'border-green-300 bg-green-100 text-green-800 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300'
                              : 'border-red-300 bg-red-100 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300'
                          }
                        >
                          {ebook.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/ebooks/${ebook.id}/edit`}
                            className="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(ebook.id)}
                            className="rounded p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="horizontal"
              className="flex h-2.5 touch-none select-none bg-gray-100 p-0.5 dark:bg-gray-700"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      )}
    </div>
  );
}
