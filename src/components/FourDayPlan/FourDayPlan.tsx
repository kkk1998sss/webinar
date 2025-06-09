'use client';
import { useCallback, useEffect, useRef, useState } from 'react'; // <-- add useCallback
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  Play,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  day: number;
  createdAt: string;
}

interface Subscription {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  unlockedContent: {
    currentDay: number;
    unlockedVideos: number[];
    expiryDates: Record<string, string>;
  };
}

interface VideoCompletionStatus {
  [videoId: string]: {
    completed: boolean;
    timestamp: number;
  };
}

export default function FourDayPlan() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  // Remove unused showSubscriptionModal state
  // const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState<VideoCompletionStatus>({});
  const playerRef = useRef<HTMLIFrameElement | null>(null); // Specify type instead of any
  const videoCheckRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Countdown helper
  function getCountdown(targetDate: Date) {
    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // Load saved video progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('videoProgress');
    if (savedProgress) {
      try {
        setVideoProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Failed to parse video progress:', e);
      }
    }
  }, []);

  // Save video progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('videoProgress', JSON.stringify(videoProgress));
  }, [videoProgress]);

  // Fetch videos and subscription
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [videoRes, subRes] = await Promise.all([
          fetch('/api/four-day'),
          fetch('/api/subscription'),
        ]);
        const videoData = await videoRes.json();
        const subData = await subRes.json();

        if (Array.isArray(videoData.videos)) {
          setVideos(videoData.videos);
        }

        // Find active FOUR_DAY subscription
        if (subData.subscriptions?.length > 0) {
          const activeSub = subData.subscriptions.find(
            (sub: Subscription) => sub.type === 'FOUR_DAY' && sub.isActive
          );
          setSubscription(activeSub || null);

          // Set current video to first unlocked video
          if (activeSub && videoData.videos?.length > 0) {
            const firstUnlockedVideo = videoData.videos.find((v: Video) =>
              activeSub.unlockedContent.unlockedVideos.includes(v.day)
            );
            setCurrentVideo(firstUnlockedVideo || videoData.videos[0]);
          } else {
            setCurrentVideo(videoData.videos[0] || null);
          }
        } else {
          setCurrentVideo(videoData.videos[0] || null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset live mode when video changes
  useEffect(() => {
    if (currentVideo) {
      const videoStatus = videoProgress[currentVideo.id];

      if (videoStatus?.completed) {
        // Video already completed, show in playback mode
        setIsLiveMode(false);
        setVideoCompleted(true);
      } else {
        // First time viewing, start in live mode
        setIsLiveMode(true);
        setVideoCompleted(false);
      }
    }
  }, [currentVideo, videoProgress]);

  // Helper for YouTube/Vimeo embed
  function getEmbedUrl(url: string, isLive: boolean) {
    // Handle pCloud links
    if (url.includes('pcloud.link')) {
      return url; // pCloud links are already in the correct format for embedding
    }

    // Handle YouTube links
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/
    );
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?${isLive ? 'autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0' : 'controls=1&modestbranding=1&rel=0'}`;
    }

    // Handle Vimeo links
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?${isLive ? 'autoplay=1&controls=0' : 'controls=1'}`;
    }

    return url;
  }

  // Handle video completion
  const markVideoCompleted = useCallback(() => {
    if (currentVideo) {
      setVideoProgress((prev) => ({
        ...prev,
        [currentVideo.id]: {
          completed: true,
          timestamp: Date.now(),
        },
      }));
      setVideoCompleted(true);
      setIsLiveMode(false);
    }
  }, [currentVideo]);

  // Check if video is still playing (for persistence across refreshes)
  const checkVideoStatus = useCallback(() => {
    if (playerRef.current && isLiveMode && !videoCompleted) {
      try {
        playerRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"getPlayerState"}',
          '*'
        );
      } catch (e) {
        console.error('Error checking player state:', e);
      }
    }
  }, [isLiveMode, videoCompleted]);

  // Listen for player state messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // YouTube player state responses
      if (
        event.origin === 'https://www.youtube.com' &&
        event.data &&
        event.data.info
      ) {
        const playerState = event.data.info.playerState;

        if (playerState === 0) {
          // 0 = ended
          markVideoCompleted();
        }
      }

      // Vimeo player state responses
      if (
        event.origin === 'https://player.vimeo.com' &&
        event.data &&
        event.data.event === 'ended'
      ) {
        markVideoCompleted();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentVideo, isLiveMode, videoCompleted, markVideoCompleted]); // Add markVideoCompleted

  // Periodically check video status during live mode
  useEffect(() => {
    if (isLiveMode && !videoCompleted) {
      videoCheckRef.current = setInterval(checkVideoStatus, 5000);
    } else if (videoCheckRef.current) {
      clearInterval(videoCheckRef.current);
      videoCheckRef.current = null;
    }

    return () => {
      if (videoCheckRef.current) {
        clearInterval(videoCheckRef.current);
      }
    };
  }, [isLiveMode, videoCompleted, checkVideoStatus]); // Add checkVideoStatus

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading your content...
          </p>
        </div>
      </div>
    );
  }

  // If not subscribed, show upgrade card only
  if (!subscription) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          className="flex w-full max-w-md flex-col items-center rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="mb-4 size-10 text-blue-500 dark:text-blue-400" />
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
            Upgrade to Full Access
          </h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            Get unlimited access to all upcoming webinars and premium content
            with our 6-month subscription.
          </p>
          <Button
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow transition hover:shadow-lg"
            onClick={() => router.push('/')}
          >
            Upgrade to 599
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* E-Books Access Button */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-green-500 to-green-600 p-2 shadow-md">
        <motion.div
          className="mx-auto max-w-7xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            className="w-full rounded-lg bg-white py-3 font-semibold text-green-600 shadow-lg transition-all hover:bg-green-50 hover:shadow-xl"
            onClick={() => router.push('/users/ebook199')}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="size-5" />
              <span>Access Your E-Books Collection</span>
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Day selection bar */}
      <div className="sticky top-14 z-10 bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[1, 2, 3].map((day) => {
              const video = videos.find((v) => v.day === day);
              const startDate = new Date(subscription.startDate);

              // Day 1 unlocks at 9pm on subscription day, others at 9pm on their day
              const unlockDate = new Date(startDate);
              if (day > 1) {
                unlockDate.setDate(startDate.getDate() + (day - 1));
              }
              unlockDate.setHours(21, 0, 0, 0);

              const isUnlocked = now >= unlockDate;
              const isCurrent = currentVideo?.day === day;
              const countdown = !isUnlocked ? getCountdown(unlockDate) : null;

              return (
                <motion.div
                  key={day}
                  className={`relative select-none rounded-lg border p-3 transition-all
                    ${
                      isCurrent
                        ? 'border-blue-300 ring-2 ring-blue-500 dark:border-blue-600 dark:ring-blue-400'
                        : 'border-gray-200 dark:border-gray-700'
                    }
                    ${
                      isUnlocked
                        ? 'cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50'
                        : 'pointer-events-none cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800'
                    }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * day }}
                  onClick={() => {
                    if (video && isUnlocked) setCurrentVideo(video);
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`flex size-6 items-center justify-center rounded-full ${
                        isUnlocked
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      }`}
                    >
                      {isUnlocked ? (
                        <CheckCircle className="size-4" />
                      ) : (
                        <Lock className="size-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Day {day}
                    </span>
                    {isCurrent && (
                      <span className="absolute right-3 top-3 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Playing
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex min-h-[40px] items-center rounded-md bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-3 py-2 shadow-sm dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
                    <span className="w-full truncate text-xs font-semibold text-blue-900 dark:text-blue-200">
                      {video ? (
                        video.title
                      ) : (
                        <span className="italic text-gray-400">No video</span>
                      )}
                    </span>
                  </div>
                  {isUnlocked ? (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="size-3" />
                      <span>Available Now</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="size-3" />
                        <span>
                          Unlocks at 9:00 PM -{' '}
                          <span className="text-orange-600">{countdown}</span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="mt-2 text-xs font-semibold">
                    {isUnlocked ? (
                      <span className="text-green-600">Unlocked Video</span>
                    ) : (
                      <span className="text-orange-600">Locked</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex w-full flex-col p-2 sm:p-4 lg:w-8/12">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-xl">
            {currentVideo ? (
              (() => {
                const day = currentVideo.day;
                const startDate = new Date(subscription.startDate);
                const unlockDate = new Date(startDate);
                if (day > 1) {
                  unlockDate.setDate(startDate.getDate() + (day - 1));
                }
                unlockDate.setHours(21, 0, 0, 0);

                const isUnlocked = now >= unlockDate;
                const countdown = !isUnlocked ? getCountdown(unlockDate) : null;
                const videoStatus = videoProgress[currentVideo.id];
                const isCompleted = videoStatus?.completed || false;

                if (!isUnlocked) {
                  return (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-300 sm:p-8">
                      <Lock className="mb-4 size-12 text-gray-400 sm:size-16" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                        {countdown ? 'Available at 9:00 PM' : 'Content Locked'}
                      </h3>
                      <p className="mb-4 max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-300">
                        {countdown
                          ? 'This video unlocks at 9:00 PM today'
                          : `This video will be available on day ${currentVideo.day} of your challenge`}
                      </p>
                      {countdown && (
                        <div className="flex flex-col items-center">
                          <div className="text-xl font-bold text-blue-600 sm:text-2xl dark:text-blue-400">
                            {countdown}
                          </div>
                          <div className="mt-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                            Until unlock
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Video is unlocked
                return (
                  <div className="flex h-full flex-col">
                    <div className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs text-white shadow sm:px-3 sm:py-1 ${
                          isLiveMode
                            ? 'animate-pulse bg-red-600'
                            : 'bg-green-600'
                        }`}
                      >
                        {isLiveMode
                          ? 'LIVE NOW'
                          : isCompleted
                            ? 'COMPLETED'
                            : 'PLAYBACK MODE'}
                      </span>
                    </div>

                    {isLiveMode ? (
                      <iframe
                        ref={playerRef}
                        src={getEmbedUrl(currentVideo.videoUrl, true)}
                        title={currentVideo.title}
                        className="absolute left-0 top-0 size-full"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(currentVideo.videoUrl, false)}
                        title={currentVideo.title}
                        className="absolute left-0 top-0 size-full"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    )}

                    {isLiveMode && !isCompleted && (
                      <div className="absolute inset-x-0 bottom-2 text-center sm:bottom-4">
                        <div className="inline-block animate-pulse rounded-full bg-red-600 px-2 py-0.5 text-xs text-white sm:px-3 sm:py-1 sm:text-sm">
                          LIVE PLAYBACK: Controls disabled during first viewing
                        </div>
                      </div>
                    )}

                    {isLiveMode && (
                      <div className="absolute bottom-2 right-2 z-10 sm:bottom-4 sm:right-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs sm:text-sm"
                          onClick={() => {
                            if (
                              confirm(
                                'Are you sure you want to mark this video as completed? This action cannot be undone.'
                              )
                            ) {
                              markVideoCompleted();
                            }
                          }}
                        >
                          Mark as Completed
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-300 sm:p-8">
                <Play className="mb-4 size-12 text-gray-400 sm:size-16" />
                <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                  Select a Video
                </h3>
                <p className="max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-300">
                  Choose a day from the menu above to start watching the
                  meditation session
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Upgrade card on the right */}
        <div className="flex w-full items-center p-2 sm:p-4 lg:w-4/12">
          <motion.div
            className="flex w-full flex-col items-center rounded-xl bg-white p-4 shadow-lg sm:p-6 dark:bg-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="mb-4 size-8 text-blue-500 sm:size-10 dark:text-blue-400" />
            <h2 className="mb-2 text-center text-lg font-bold text-gray-800 sm:text-xl dark:text-white">
              Continue Your Journey
            </h2>
            <p className="mb-4 text-center text-xs text-gray-600 sm:text-sm dark:text-gray-300">
              Unlock more premium meditation courses and live sessions with our
              extended subscription.
            </p>
            <ul className="mb-6 w-full space-y-2 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="size-3 text-green-500 sm:size-4" />
                <span>Full access to all meditation programs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-3 text-green-500 sm:size-4" />
                <span>Exclusive live sessions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-3 text-green-500 sm:size-4" />
                <span>Downloadable resources</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-3 text-green-500 sm:size-4" />
                <span>Priority support</span>
              </li>
            </ul>
            <Button
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg sm:py-3 sm:text-base"
              onClick={() => router.push('/')}
            >
              Upgrade to Full Access
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
