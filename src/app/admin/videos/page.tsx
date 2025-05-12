'use client';

import { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaVideo,
} from 'react-icons/fa';
import * as Popover from '@radix-ui/react-popover';
import * as Separator from '@radix-ui/react-separator';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

type Video = {
  id: string;
  title: string;
  url: string;
  publicId: string;
  createdAt: string;
  webinarDetails?: {
    webinarName: string;
    webinarTitle: string;
  };
};

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Simulate page load animation
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/videos');
        const data = await res.json();

        if (data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        } else {
          console.error('Unexpected API response', data);
        }
      } catch (err) {
        console.error('Failed to fetch videos', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  const deleteVideo = async (id: string) => {
    try {
      await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      setVideos(videos.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Failed to delete video', error);
    }
  };

  // Filter videos based on search query and filters
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.webinarDetails?.webinarName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      video.webinarDetails?.webinarTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'all' ||
      (filterType === 'withWebinar' && video.webinarDetails) ||
      (filterType === 'withoutWebinar' && !video.webinarDetails);

    return matchesSearch && matchesType;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

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
          <FaVideo className="mr-2 inline" /> Videos
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href="/admin/videos/create"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
          >
            <FaPlus className="size-4" />
            Upload Video
          </Link>
        </motion.div>
      </div>

      <Separator.Root className="h-px w-full bg-gray-200" />

      {/* Search and Filter Controls */}
      <motion.div
        className="flex flex-col gap-3 md:flex-row"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full rounded-lg border border-gray-200 py-1.5 pl-10 pr-4 text-sm outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Videos</option>
              <option value="withWebinar">With Webinar</option>
              <option value="withoutWebinar">Without Webinar</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setCurrentPage(1);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
          >
            <FaTimes className="size-3 text-gray-500" />
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
          <div className="size-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading videos...</span>
        </motion.div>
      ) : (
        <div className="w-full rounded-xl border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <motion.table
              className="w-full min-w-[800px] text-xs text-gray-700"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 p-2 text-center font-medium text-gray-500">
                    S.No
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500">
                    Title
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500">
                    Webinar
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500">
                    Upload Date
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="p-2 text-left font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentVideos.map((video, index) => (
                    <motion.tr
                      key={video.id}
                      className="border-t transition hover:bg-gray-50"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0 }}
                      whileHover={{
                        backgroundColor: 'rgba(243, 244, 246, 0.5)',
                      }}
                    >
                      <td className="w-12 p-2 text-center">{index + 1}</td>
                      <td className="max-w-[200px] break-words p-2">
                        <span className="font-medium">
                          {video.title || 'Untitled Video'}
                        </span>
                      </td>
                      <td className="max-w-[250px] break-words p-2">
                        {video.webinarDetails ? (
                          <div className="space-y-0.5">
                            <div className="font-medium">
                              {video.webinarDetails.webinarName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {video.webinarDetails.webinarTitle}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <FaCalendarAlt
                            className="mr-1 text-blue-500"
                            size={12}
                          />
                          <span className="text-gray-600">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            video.webinarDetails
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {video.webinarDetails
                            ? 'Linked to Webinar'
                            : 'Standalone'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/videos/${video.id}/edit`}
                            className="rounded-full bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200"
                          >
                            <FaEdit className="size-3" />
                          </Link>

                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <button className="rounded-full bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200">
                                <FaTrash className="size-3" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                side="top"
                                align="center"
                                className="z-50 w-64 rounded-lg border bg-white p-4 text-sm shadow-lg"
                              >
                                <p className="mb-3 text-gray-800">
                                  Are you sure you want to delete this video?
                                </p>
                                <div className="flex justify-end gap-2">
                                  <Popover.Close asChild>
                                    <button className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 transition-colors hover:bg-gray-200">
                                      Cancel
                                    </button>
                                  </Popover.Close>
                                  <button
                                    className="rounded-lg bg-red-600 px-3 py-1 text-white transition-colors hover:bg-red-700"
                                    onClick={() => deleteVideo(video.id)}
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
                {filteredVideos.length === 0 && (
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
                        <p className="text-lg font-medium">No videos found</p>
                        <p className="text-sm text-gray-500">
                          {searchQuery || filterType !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'There are no videos in the system yet'}
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </motion.table>
          </div>

          {/* Pagination Controls */}
          {filteredVideos.length > 0 && (
            <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, filteredVideos.length)} of{' '}
                  {filteredVideos.length} entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
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
