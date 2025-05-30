'use client';

import { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import * as Popover from '@radix-ui/react-popover';
import * as Separator from '@radix-ui/react-separator';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

type ScheduledDate = {
  date: string;
  time: string;
  period: string;
  timeZone: string;
};

type Webinar = {
  id: string;
  webinarName: string;
  webinarTitle: string;
  webinarDate: string;
  selectedLanguage?: string;
  scheduledDates?: ScheduledDate[];
  createdAt: string;
};

export default function WebinarList() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page

  useEffect(() => {
    // Simulate page load animation
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchWebinars() {
      try {
        const res = await fetch('/api/webinar');
        const data = await res.json();

        if (data.success && Array.isArray(data.webinars)) {
          setWebinars(data.webinars);
        } else {
          console.error('Unexpected API response', data);
        }
      } catch (err) {
        console.error('Failed to fetch webinars', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWebinars();
  }, []);

  const deleteWebinar = async (id: string) => {
    try {
      await fetch(`/api/webinar/${id}`, { method: 'DELETE' });
      setWebinars(webinars.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Failed to delete webinar', error);
    }
  };

  // Filter webinars based on search query and filters
  const filteredWebinars = webinars.filter((webinar) => {
    const matchesSearch =
      webinar.webinarTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webinar.webinarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webinar.webinarDate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'upcoming' &&
        new Date(webinar.webinarDate) > new Date()) ||
      (filterStatus === 'past' && new Date(webinar.webinarDate) < new Date()) ||
      (filterStatus === 'ongoing' &&
        new Date(webinar.webinarDate) <= new Date() &&
        new Date(webinar.webinarDate) >=
          new Date(new Date().setDate(new Date().getDate() - 1)));

    const matchesDateRange =
      (!startDate || new Date(webinar.webinarDate) >= new Date(startDate)) &&
      (!endDate || new Date(webinar.webinarDate) <= new Date(endDate));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredWebinars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWebinars = filteredWebinars.slice(startIndex, endIndex);

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
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
          Loading...
        </div>
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
          <FaCalendarAlt className="mr-2 inline" /> Webinars
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

      <Separator.Root className="h-px w-full bg-gray-200 dark:bg-gray-700" />

      {/* Search and Filter Controls */}
      <motion.div
        className="flex flex-col gap-3 md:flex-row"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search webinars..."
            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-800/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-800/50"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-800/50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
            <input
              type="date"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-800/50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setStartDate('');
              setEndDate('');
              setCurrentPage(1);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <FaTimes className="size-3 text-gray-500 dark:text-gray-400" />
            Reset
          </button>
        </div>
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
            Loading webinars...
          </span>
        </motion.div>
      ) : (
        <div className="w-full rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
          <div className="overflow-x-auto">
            <motion.table
              className="w-full min-w-[800px] text-xs text-gray-700 dark:text-gray-300"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="w-12 p-2 text-center font-medium text-gray-500 dark:text-gray-400">
                    S.No
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                    Title
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                    Time
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
                <AnimatePresence>
                  {currentWebinars.map((webinar, index) => (
                    <motion.tr
                      key={webinar.id}
                      className="border-t border-gray-200 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-700"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0 }}
                    >
                      <td className="w-12 p-2 text-center">{index + 1}</td>
                      <td className="max-w-[200px] break-words p-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {webinar.webinarTitle}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <FaCalendarAlt
                            className="mr-1 text-blue-500 dark:text-blue-400"
                            size={12}
                          />
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(webinar.webinarDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <FaClock
                            className="mr-1 text-blue-500 dark:text-blue-400"
                            size={12}
                          />
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(
                              `2000-01-01T${webinar.scheduledDates?.[0]?.time}`
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            new Date(webinar.webinarDate) > new Date()
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {new Date(webinar.webinarDate) > new Date()
                            ? 'Upcoming'
                            : 'Past'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/webinars/${webinar.id}/edit`}
                            className="rounded-full bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800"
                          >
                            <FaEdit className="size-3" />
                          </Link>

                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <button className="rounded-full bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800">
                                <FaTrash className="size-3" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                side="top"
                                align="center"
                                className="z-50 w-64 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-slate-800"
                              >
                                <p className="mb-3 text-gray-800 dark:text-gray-200">
                                  Are you sure you want to delete this webinar?
                                </p>
                                <div className="flex justify-end gap-2">
                                  <Popover.Close asChild>
                                    <button className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                      Cancel
                                    </button>
                                  </Popover.Close>
                                  <button
                                    className="rounded-lg bg-red-600 px-3 py-1 text-white transition-colors hover:bg-red-700"
                                    onClick={() => deleteWebinar(webinar.id)}
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
                {filteredWebinars.length === 0 && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                          <FaSearch className="size-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          No webinars found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery || filterStatus !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'There are no webinars in the system yet'}
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </motion.table>
          </div>

          {/* Pagination Controls */}
          {filteredWebinars.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, filteredWebinars.length)} of{' '}
                  {filteredWebinars.length} entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
