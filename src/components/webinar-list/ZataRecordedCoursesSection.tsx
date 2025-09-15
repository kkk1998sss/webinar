'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  HardDrive,
  Play,
} from 'lucide-react';

import { VideoPlayer } from '@/components/VideoPlayer';
import { ZataFolder, ZataVideo } from '@/lib/zata';

interface ZataResponse {
  success: boolean;
  data: ZataVideo[] | ZataFolder[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// Skeleton component for loading states
const VideoSkeleton = () => (
  <div className="group relative animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md">
    <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-200"></div>
    <div className="mb-3 flex items-center justify-between">
      <div className="size-6 rounded bg-gray-200"></div>
      <div className="h-5 w-16 rounded bg-gray-200"></div>
    </div>
    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
    <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>
    <div className="h-8 w-full rounded bg-gray-200"></div>
  </div>
);

// Lazy video thumbnail component
const LazyVideoThumbnail = ({
  video,
  onClick,
  formatDate,
}: {
  video: ZataVideo;
  onClick: () => void;
  formatDate: (dateString: string) => string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Video Thumbnail */}
      <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
        {isInView ? (
          video.thumbnailUrl ? (
            <>
              <video
                src={video.thumbnailUrl}
                className={`size-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                preload="metadata"
                onLoadedData={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.currentTime = 1;
                  setIsLoaded(true);
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
                <div className="mb-2 text-4xl">🎬</div>
                <div className="text-sm text-blue-600">Video Preview</div>
              </div>
            </div>
          )
        ) : (
          <div className="flex size-full items-center justify-center bg-gray-200">
            <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-2xl">🎬</div>
        <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          Video
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
    </div>
  );
};

const ZataRecordedCoursesSection: React.FC = () => {
  const [folders, setFolders] = useState<ZataFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<ZataFolder | null>(null);
  const [videos, setVideos] = useState<ZataVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📁 Fetching Zata AI Cloud folders...');

      const response = await fetch('/api/zata/folders');
      const data: ZataResponse = await response.json();

      if (data.success) {
        console.log('📁 Successfully fetched Zata AI folders:', data.data);
        setFolders(data.data as ZataFolder[]);
      } else {
        setError(data.error || 'Failed to fetch folders');
        console.error('❌ Error fetching Zata AI folders:', data.error);
      }
    } catch (err) {
      console.error('❌ Error fetching Zata AI folders:', err);
      setError('Failed to fetch folders from Zata AI Cloud');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFolderVideos = useCallback(
    async (folderPath: string, page: number = 1) => {
      try {
        setVideosLoading(true);
        setError(null);

        console.log(
          `📁 Fetching videos from folder: ${folderPath}, page: ${page}`
        );

        const response = await fetch(
          `/api/zata/folders/${encodeURIComponent(folderPath)}?page=${page}&per_page=12`
        );
        const data: ZataResponse = await response.json();

        if (data.success) {
          console.log('🎬 Successfully fetched folder videos:', data.data);
          if (page === 1) {
            setVideos(data.data as ZataVideo[]);
          } else {
            setVideos((prev) => [...prev, ...(data.data as ZataVideo[])]);
          }

          if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
            setCurrentPage(data.pagination.page);
          }
        } else {
          setError(data.error || 'Failed to fetch folder videos');
          console.error('❌ Error fetching folder videos:', data.error);
        }
      } catch (err) {
        console.error('❌ Error fetching folder videos:', err);
        setError('Failed to fetch videos from folder');
      } finally {
        setVideosLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleFolderClick = (folder: ZataFolder) => {
    setSelectedFolder(folder);
    setCurrentPage(1);
    fetchFolderVideos(folder.path, 1);
  };

  const handleVideoClick = (videoIndex: number) => {
    setSelectedVideoIndex(videoIndex);
    setShowVideoPlayer(true);
  };

  const loadMoreVideos = () => {
    if (selectedFolder && currentPage < totalPages && !videosLoading) {
      fetchFolderVideos(selectedFolder.path, currentPage + 1);
    }
  };

  const scrollLeft = () => {
    const scrollContainer = document.getElementById('folders-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const scrollContainer = document.getElementById('folders-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading && folders.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
        <div className="flex h-32 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-700">
            Fetching folders from Zata AI Cloud...
          </span>
        </div>
      </div>
    );
  }

  if (error && folders.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-2 text-2xl text-red-600">⚠️</div>
          <h3 className="mb-2 font-semibold text-red-800">
            Error Loading Zata AI Folders
          </h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchFolders}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-4xl text-blue-600">📁</div>
          <h3 className="mb-2 font-semibold text-blue-800">No Folders Found</h3>
          <p className="text-sm text-blue-700">
            No folders found in your Zata AI Cloud storage.
          </p>
          <p className="mt-2 text-xs text-blue-600">
            Upload some videos to your Zata AI Cloud to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center space-x-3">
            <div className="rounded-xl bg-blue-600 p-3 text-white">
              <HardDrive className="size-8" />
            </div>
            <h2 className="text-3xl font-bold text-blue-800">
              Recorded Courses
            </h2>
          </div>
          <p className="text-lg text-blue-600">
            Organized video content for your learning
          </p>
          <p className="mt-2 text-sm text-blue-500">
            {folders.length} folders available
          </p>
        </div>

        {/* Folders Grid */}
        <div className="relative">
          {/* Navigation arrows */}
          {folders.length > 3 && (
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
            id="folders-scroll-container"
            className={`${
              folders.length > 3
                ? 'scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-16 pb-4'
                : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
            }`}
            style={
              folders.length > 3
                ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
                : {}
            }
          >
            {folders.map((folder) => (
              <motion.div
                key={folder.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative cursor-pointer overflow-hidden rounded-lg border border-blue-200 bg-white p-4 shadow-md transition-all duration-200 hover:border-blue-300 hover:shadow-lg ${
                  folders.length > 3 ? 'w-[300px] shrink-0 snap-center' : ''
                } ${
                  selectedFolder?.name === folder.name
                    ? 'border-blue-500 bg-blue-50'
                    : ''
                }`}
                onClick={() => handleFolderClick(folder)}
              >
                {/* Folder Icon */}
                <div className="mb-3 flex items-center justify-center">
                  <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
                    {selectedFolder?.name === folder.name ? (
                      <FolderOpen className="size-12 text-blue-600" />
                    ) : (
                      <Folder className="size-12 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* Folder Info */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-2xl">📁</div>
                  <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    {folder.videoCount} videos
                  </div>
                </div>

                {/* Folder Name */}
                <h4 className="mb-2 line-clamp-2 font-semibold text-gray-800">
                  {folder.name}
                </h4>

                {/* Folder Details */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 size-4" />
                    <span>{folder.videoCount} videos</span>
                  </div>
                </div>

                {/* Open Button */}
                <button className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-white transition-all duration-200 hover:from-blue-600 hover:to-indigo-600">
                  <Play className="size-4" />
                  <span>Open Folder</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Selected Folder Videos */}
        {selectedFolder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-blue-800">
                {selectedFolder.name} ({videos.length} videos)
              </h3>
              <button
                onClick={() => setSelectedFolder(null)}
                className="rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            {videosLoading && videos.length === 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <VideoSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => fetchFolderVideos(selectedFolder.path)}
                  className="mt-2 rounded-lg bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <div className="mb-2 text-4xl">🎬</div>
                <h4 className="mb-2 font-semibold text-gray-800">
                  No Videos Found
                </h4>
                <p className="text-sm text-gray-600">
                  This folder doesn&apos;t contain any videos yet.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video, index) => (
                    <LazyVideoThumbnail
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(index)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {currentPage < totalPages && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMoreVideos}
                      disabled={videosLoading}
                      className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {videosLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="size-4 animate-spin rounded-full border-b-2 border-white"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        `Load More Videos (${totalPages - currentPage} pages remaining)`
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-blue-600">
            🎬 Access your organized video content anytime, anywhere
          </p>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && videos.length > 0 && (
        <VideoPlayer
          videos={videos}
          initialVideoIndex={selectedVideoIndex}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </>
  );
};

export default ZataRecordedCoursesSection;
