'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ZataVideo {
  id: string;
  name: string;
  size: number;
  contentType: string;
  lastModified: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  description?: string;
}

interface ZataResponse {
  success: boolean;
  data: ZataVideo[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

const ZataRecordedCoursesSection: React.FC = () => {
  const [videos, setVideos] = useState<ZataVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchZataVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎬 Fetching Zata AI Cloud videos...');

      const response = await fetch(
        `/api/zata/public?page=${currentPage}&per_page=12`
      );
      const data: ZataResponse = await response.json();

      if (data.success) {
        console.log('🎬 Successfully fetched Zata AI videos:', data.data);
        setVideos(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      } else {
        setError(data.error || 'Failed to fetch videos');
        console.error('❌ Error fetching Zata AI videos:', data.error);
      }
    } catch (err) {
      console.error('❌ Error fetching Zata AI videos:', err);
      setError('Failed to fetch videos from Zata AI Cloud');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchZataVideos();
  }, [fetchZataVideos]);

  const handleVideoClick = (video: ZataVideo) => {
    console.log('🎬 Opening Zata AI video:', video.name);
    router.push(`/users/playing-area/zata/${video.id}`);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const getVideoIcon = (contentType: string) => {
    if (contentType?.startsWith('video/')) {
      return '🎬';
    }
    return '📁';
  };

  const getVideoType = (contentType: string): string => {
    if (contentType?.startsWith('video/')) {
      return 'Video';
    }
    return 'File';
  };

  const scrollLeft = () => {
    const scrollContainer = document.getElementById('zata-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const scrollContainer = document.getElementById('zata-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
        <div className="flex h-32 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-700">
            Fetching videos from Zata AI Cloud...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-2 text-2xl text-red-600">⚠️</div>
          <h3 className="mb-2 font-semibold text-red-800">
            Error Loading Zata AI Videos
          </h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchZataVideos}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-4xl text-blue-600">🎬</div>
          <h3 className="mb-2 font-semibold text-blue-800">No Videos Found</h3>
          <p className="text-sm text-blue-700">
            No videos found in your Zata AI Cloud storage.
          </p>
          <p className="mt-2 text-xs text-blue-600">
            Upload some videos to your Zata AI Cloud to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center space-x-3">
          <div className="rounded-xl bg-blue-600 p-3 text-white">
            <HardDrive className="size-8" />
          </div>
          <h2 className="text-3xl font-bold text-blue-800">Recorded Videos</h2>
        </div>
        <p className="text-lg text-blue-600">
          High-quality video content for your learning
        </p>
        <p className="mt-2 text-sm text-blue-500">
          {videos.length} videos available
        </p>
      </div>

      {/* Video Grid */}
      <div className="relative">
        {/* Navigation arrows */}
        {videos.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-blue-600/90">
                <ChevronLeft className="size-5 animate-pulse" />
              </div>
            </button>

            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-blue-600/90">
                <ChevronRight className="size-5 animate-pulse" />
              </div>
            </button>
          </>
        )}

        <div
          id="zata-scroll-container"
          className={`${
            videos.length > 3
              ? 'scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-16 pb-4'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          }`}
          style={
            videos.length > 3
              ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
              : {}
          }
        >
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative cursor-pointer overflow-hidden rounded-lg border border-blue-200 bg-white p-4 shadow-md transition-all duration-200 hover:border-blue-300 hover:shadow-lg ${
                videos.length > 3 ? 'w-[300px] shrink-0 snap-center' : ''
              }`}
              onClick={() => handleVideoClick(video)}
            >
              {/* Video Thumbnail */}
              <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                {video.thumbnailUrl ? (
                  <>
                    <video
                      src={video.thumbnailUrl}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      muted
                      preload="metadata"
                      onLoadedData={(e) => {
                        // Seek to 1 second to show a frame instead of black screen
                        const video = e.target as HTMLVideoElement;
                        video.currentTime = 1;
                      }}
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="rounded-full bg-white/90 p-3">
                        <Play className="size-6 text-blue-600" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">
                        {getVideoIcon(video.contentType)}
                      </div>
                      <div className="text-sm text-blue-600">Video Preview</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="mb-3 flex items-center justify-between">
                <div className="text-2xl">
                  {getVideoIcon(video.contentType)}
                </div>
                <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  {getVideoType(video.contentType)}
                </div>
              </div>

              {/* Video Name */}
              <h4 className="mb-2 line-clamp-2 font-semibold text-gray-800">
                {video.name}
              </h4>

              {/* Video Details */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 size-4" />
                  <span>Uploaded: {formatDate(video.lastModified)}</span>
                </div>
              </div>

              {/* Play Button */}
              <button className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-white transition-all duration-200 hover:from-blue-600 hover:to-indigo-600">
                <Play className="size-4" />
                <span>Watch Now</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="flex items-center px-3 py-2 text-blue-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-blue-600">
          🎬 Access your high-quality video content anytime, anywhere
        </p>
      </div>
    </div>
  );
};

export default ZataRecordedCoursesSection;
