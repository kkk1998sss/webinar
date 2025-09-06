'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface VimeoVideo {
  uri: string;
  name: string;
  description: string;
  duration: number;
  created_time: string;
  modified_time: string;
  link: string;
  player_embed_url: string;
  pictures: {
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
  privacy: {
    view: string;
  };
}

export default function VimeoVideosPage() {
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchVideos = async (page: number = 1) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/vimeo?page=${page}&per_page=20`);
      const data = await response.json();

      if (response.ok) {
        setVideos(data.data.data);
        setPagination({
          page: data.data.page,
          per_page: data.data.per_page,
          total: data.data.total,
          hasNext: !!data.data.paging.next,
          hasPrevious: !!data.data.paging.previous,
        });
      } else {
        setError(data.error || 'Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to fetch videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const extractVideoId = (uri: string): string => {
    return uri.replace('/videos/', '');
  };

  const getThumbnail = (pictures: VimeoVideo['pictures']): string => {
    if (pictures.sizes && pictures.sizes.length > 0) {
      // Get the largest thumbnail
      const sortedSizes = pictures.sizes.sort((a, b) => b.width - a.width);
      return sortedSizes[0].link;
    }
    return '/placeholder-video.jpg';
  };

  return (
    <div className="pb-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.h1
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Vimeo Files
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Manage your Vimeo video content
        </motion.p>
      </div>

      {/* Stats Card */}
      <motion.div
        className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="size-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Videos</p>
            {isLoading ? (
              <div className="mt-1">
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {pagination.total}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {error}
        </motion.div>
      )}

      {/* Videos Grid */}
      <motion.div
        className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Video Library</h2>
          <p className="text-sm text-gray-600">
            Click on any video to open the Vimeo player
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-video rounded-lg bg-gray-200"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <motion.div
                key={video.uri}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/admin/vimeo/player/${extractVideoId(video.uri)}`}>
                  <div className="relative overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={getThumbnail(video.pictures)}
                      alt={video.name}
                      width={400}
                      height={225}
                      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                      <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="flex size-12 items-center justify-center rounded-full bg-white/90">
                          <svg
                            className="size-6 text-gray-800"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                      {video.name}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>{formatDate(video.created_time)}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{video.privacy.view}</span>
                    </div>
                    {video.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {video.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-4 text-gray-400">
              <svg
                className="mx-auto size-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No videos found
            </h3>
            <p className="text-gray-500">
              Upload some videos to your Vimeo account to get started
            </p>
          </div>
        )}

        {/* Pagination */}
        {videos.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.per_page + 1} to{' '}
              {Math.min(
                pagination.page * pagination.per_page,
                pagination.total
              )}{' '}
              of {pagination.total} videos
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => fetchVideos(pagination.page - 1)}
                disabled={!pagination.hasPrevious || isLoading}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => fetchVideos(pagination.page + 1)}
                disabled={!pagination.hasNext || isLoading}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
