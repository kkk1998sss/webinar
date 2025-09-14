'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  HardDrive,
  MessageCircle,
  SkipBack,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

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

interface ZataVideoResponse {
  success: boolean;
  data: ZataVideo;
  error?: string;
}

export default function ZataVideoPlayer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [video, setVideo] = useState<ZataVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');

  const router = useRouter();

  const fetchVideoData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🎬 Fetching Zata AI video ${id}...`);

      const response = await fetch(`/api/zata/public/video/${id}`);
      const data: ZataVideoResponse = await response.json();

      if (data.success) {
        console.log('🎬 Successfully fetched Zata AI video:', data.data);
        setVideo(data.data);

        // Load saved notes
        const savedNotes = localStorage.getItem(`zata-video-notes-${id}`);
        if (savedNotes) {
          setSessionNotes(savedNotes);
        }
      } else {
        setError(data.error || 'Video not found');
        console.error('❌ Error fetching Zata AI video:', data.error);
      }
    } catch (err) {
      console.error('❌ Error fetching Zata AI video:', err);
      setError('Failed to fetch video from Zata AI Cloud');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideoData();
  }, [fetchVideoData]);

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveNotes = () => {
    if (video) {
      localStorage.setItem(`zata-video-notes-${video.id}`, sessionNotes);
      // You could also save to a database here
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-blue-700">Loading Zata AI video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between p-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft className="size-5" />
              Back to Videos
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Zata AI Cloud
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Video Not Found
              </p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-4 text-6xl text-red-500">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Video Not Found
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">{error}</p>
            <Button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Floating WhatsApp Button */}
      <motion.div
        className="fixed bottom-5 right-5 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <a
          href="https://chat.whatsapp.com/F4RlvrkkyBLAz2FzjxBa4b?mode=r_t"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600 hover:shadow-xl"
          title="Join our WhatsApp group"
        >
          <MessageCircle className="size-7 text-white" />
        </a>
      </motion.div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 shadow-sm backdrop-blur-sm dark:bg-gray-800/90">
        <div className="flex items-center justify-between p-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="size-5" />
            Back to Videos
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <HardDrive className="size-6" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Video Player
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recorded Content
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Video Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
              {video.name}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Video
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {formatDate(video.lastModified)}
              </span>
            </div>
          </motion.div>

          {/* Main Layout - Video Left, Notes Right */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Side - Video Player (2/3 width) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="sticky top-24">
                <div className="group relative overflow-hidden rounded-2xl bg-black shadow-2xl">
                  <video
                    src={video.url}
                    controls
                    className="h-auto min-h-[400px] w-full lg:min-h-[500px]"
                    poster={video.thumbnailUrl}
                    onLoadedMetadata={(e) => {
                      const target = e.target as HTMLVideoElement;
                      setDuration(target.duration);
                    }}
                    onPlay={() => console.log('Video started playing')}
                    onPause={() => console.log('Video paused')}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Controls Overlay */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2">
                      <Button
                        onClick={() => {
                          const videoElement = document.querySelector('video');
                          if (videoElement) {
                            videoElement.currentTime = Math.max(
                              0,
                              videoElement.currentTime - 10
                            );
                          }
                        }}
                        className="flex size-12 items-center justify-center rounded-full border-0 bg-black/70 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90"
                        title="10 seconds back"
                      >
                        <SkipBack className="size-6" />
                      </Button>
                    </div>
                    <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2">
                      <Button
                        onClick={() => {
                          const videoElement = document.querySelector('video');
                          if (videoElement) {
                            videoElement.currentTime = Math.min(
                              duration,
                              videoElement.currentTime + 10
                            );
                          }
                        }}
                        className="flex size-12 items-center justify-center rounded-full border-0 bg-black/70 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/90"
                        title="10 seconds forward"
                      >
                        <SkipForward className="size-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Notes and Quick Info (1/3 width) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Quick Video Info */}
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <Sparkles className="size-5 text-blue-600" />
                  Quick Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Platform:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Video Library
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Duration:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Quality:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      HD
                    </span>
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <BookOpen className="size-5 text-blue-600" />
                  Session Notes
                </h3>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Take notes during your video session..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  rows={8}
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={saveNotes}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
