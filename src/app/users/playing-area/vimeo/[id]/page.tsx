'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Video } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import VimeoSDKPlayer from '@/components/VimeoSDKPlayer';

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
  files?: Array<{
    quality: string;
    type: string;
    width: number;
    height: number;
    link: string;
    size: number;
  }>;
  download?: Array<{
    quality: string;
    type: string;
    width: number;
    height: number;
    link: string;
    size: number;
  }>;
}

export default function VimeoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const [video, setVideo] = useState<VimeoVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVideoDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/vimeo/public/video/${videoId}`);
      const data = await response.json();

      if (response.ok) {
        setVideo(data.data);
      } else {
        setError(data.error || 'Failed to fetch video details');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to fetch video details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId, fetchVideoDetails]);

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
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center space-x-2">
              <motion.div
                className="size-5 rounded-full border-2 border-blue-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-gray-600">Loading video...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <div className="mb-4 text-red-400">
              <svg
                className="mx-auto size-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-red-800">
              Error Loading Video
            </h3>
            <p className="mb-4 text-red-600">{error}</p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Video Not Found
            </h3>
            <p className="mb-4 text-gray-600">
              The requested video could not be found.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>
            <div>
              <motion.h1
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {video.name}
              </motion.h1>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 size-4" />
                <span>{formatDate(video.created_time)}</span>
                <Clock className="ml-4 mr-2 size-4" />
                <span>{formatDuration(video.duration)}</span>
                <Video className="ml-4 mr-2 size-4" />
                <span className="capitalize">{video.privacy.view}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Video Player - Takes 2/3 of the width */}
          <div className="lg:col-span-2">
            <motion.div
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="aspect-video w-full">
                <VimeoSDKPlayer
                  videoId={videoId}
                  videoName={video.name}
                  className="size-full"
                />
              </div>
            </motion.div>

            {/* Video Details */}
            <motion.div
              className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Video Details
              </h2>

              {video.description && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Description
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-600">
                    {video.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Video Information
                </h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Duration:</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDuration(video.duration)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Created:</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(video.created_time)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Modified:</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(video.modified_time)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Privacy:</dt>
                    <dd className="text-sm capitalize text-gray-900">
                      {video.privacy.view}
                    </dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </div>

          {/* Notes Section - Takes 1/3 of the width */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-6 rounded-xl border border-gray-100 bg-white p-6 shadow-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Notes
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Key Points
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Focus on the main concepts</li>
                    <li>• Take notes on important details</li>
                    <li>• Note any questions that arise</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Your Notes
                  </h3>
                  <textarea
                    className="h-32 w-full resize-none rounded-lg border border-gray-200 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Add your notes here..."
                  />
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Bookmarks
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                      <span className="text-sm text-gray-600">
                        00:15 - Introduction
                      </span>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Jump
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                      <span className="text-sm text-gray-600">
                        05:30 - Main Topic
                      </span>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Jump
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
