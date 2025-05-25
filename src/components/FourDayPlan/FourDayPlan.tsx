'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Calendar,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  Clock,
  Clock as ClockIcon,
  Lock,
  Play,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { redirect, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import webinarImage from '../../../public/assets/native_webinar.png';

import { SubscriptionModal } from '@/components/Models/SubscriptionModal';
import { Button } from '@/components/ui/button';

// Add YouTube detection helpers
const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// const getYouTubeEmbedUrl = (url: string) => {
//   const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
//   return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
// };

interface Video {
  id: string;
  title: string;
  url: string;
  publicId: string;
  createdAt: string;
  duration?: string;
  thumbnailUrl?: string;
  webinarDetails?: {
    webinarName: string;
    webinarTitle: string;
  };
  day?: number;
}

interface Subscription {
  id: string;
  type: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface Webinar {
  id: string;
  webinarName: string;
  webinarTitle: string;
  webinarDate: string;
  webinarTime: string;
  video: {
    id: string;
    title: string;
    url: string;
  };
  imageUrl: string;
}

// Add YouTube API types
interface YouTubePlayer {
  getCurrentTime: () => number;
  getPlayerState: () => number;
  playVideo: () => void;
  seekTo: (seconds: number) => void;
  destroy: () => void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: number;
}

// Update the global declaration
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height: string;
          width: string;
          videoId: string;
          playerVars: {
            autoplay: number;
            modestbranding: number;
            rel: number;
            showinfo: number;
            controls: number;
            disablekb: number;
            fs: number;
            iv_load_policy: number;
            playsinline: number;
            enablejsapi: number;
            origin: string;
            widget_referrer: string;
            host: string;
          };
          events: {
            onReady: (event: YouTubePlayerEvent) => void;
            onStateChange: (event: YouTubePlayerEvent) => void;
            onError: (event: YouTubePlayerEvent) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayerPage() {
  const router = useRouter();
  const { status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedWebinarId, setSelectedWebinarId] = useState<string | null>(
    null
  );
  const [hasActiveSixMonthPlan, setHasActiveSixMonthPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'upgrade'>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoMetadata, setVideoMetadata] = useState<{ [key: string]: string }>(
    {}
  );
  const [currentDay, setCurrentDay] = useState(1);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [videoStatus, setVideoStatus] = useState<
    'pending' | 'live' | 'completed'
  >('pending');
  const videoStatusRef = useRef(videoStatus);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoize videoStartTime to prevent recreation on every render
  const videoStartTime = useMemo(() => {
    const date = new Date();
    date.setHours(21, 0, 0, 0); // 9:00 PM
    return date;
  }, []); // Empty dependency array ensures this only runs once

  // Add server time synchronization
  useEffect(() => {
    const syncServerTime = async () => {
      try {
        const start = Date.now();
        const response = await fetch('/api/time');
        const data = await response.json();
        const end = Date.now();
        const roundTripTime = end - start;
        const calculatedServerTime =
          data.serverTime + Math.floor(roundTripTime / 2);
        setServerTimeOffset(calculatedServerTime - Date.now());
      } catch (error) {
        console.error('Error syncing server time:', error);
      }
    };

    // Sync immediately and then every 5 minutes
    syncServerTime();
    const interval = setInterval(syncServerTime, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Optimized checkStartTime function
  const checkStartTime = useCallback(() => {
    const currentTime = Date.now() + serverTimeOffset;
    return currentTime >= videoStartTime.getTime();
  }, [serverTimeOffset, videoStartTime]);

  // Update the useEffect for live status checking
  useEffect(() => {
    const checkLiveStatus = () => {
      const shouldBeLive = checkStartTime();
      const status = localStorage.getItem('videoStatus');

      if (status === 'completed') {
        setVideoStatus('completed');
        videoStatusRef.current = 'completed';
        return;
      }

      if (shouldBeLive && videoStatusRef.current !== 'completed') {
        if (videoStatusRef.current !== 'live') {
          localStorage.setItem('videoStatus', 'live');
        }
        setVideoStatus('live');
        videoStatusRef.current = 'live';
      }
    };

    // Load initial status from localStorage
    const savedStatus = localStorage.getItem(
      'videoStatus'
    ) as typeof videoStatus;
    if (savedStatus) {
      setVideoStatus(savedStatus);
      videoStatusRef.current = savedStatus;
    }

    // Check status every second using client time
    const interval = setInterval(checkLiveStatus, 1000);
    return () => clearInterval(interval);
  }, [serverTimeOffset, checkStartTime]); // Add checkStartTime to dependencies

  // Modify the session useEffect
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setIsInitialLoad(false);
    }
  }, [status, router]);

  // Modify the fetchData function to prevent redirect
  const fetchData = async () => {
    try {
      const videoRes = await fetch('/api/videos');
      const videoData = await videoRes.json();
      if (videoData.success) {
        const desiredOrder = [
          'Basics of Shree Suktam Sadhana',
          'Shree Yantra Pooja',
          'Learn Shree Suktam Sadhana',
        ];

        const basicsSuktamVideo = videoData.videos.find(
          (v: Video) => v.title === 'Basics of Shree Suktam Sadhana'
        );

        const remainingVideos = videoData.videos.filter(
          (v: Video) => v.title !== 'Basics of Shree Suktam Sadhana'
        );

        const sortedRemainingVideos = remainingVideos.sort(
          (a: Video, b: Video) => {
            const aIndex = desiredOrder.indexOf(a.title);
            const bIndex = desiredOrder.indexOf(b.title);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          }
        );

        // Override video URLs for specific days
        const finalVideos = [
          {
            ...basicsSuktamVideo,
            url: 'https://youtu.be/ABxWsdLUOmc',
            title: 'Basics of Shree Suktam Sadhana',
            day: 1,
          },
          {
            ...sortedRemainingVideos[0],
            url: 'https://youtu.be/u8c5AMtsmjQ?feature=shared',
            title: 'Shree Yantra Pooja',
            day: 2,
          },
          {
            ...sortedRemainingVideos[1],
            url: 'https://youtu.be/A70TP4eXOyU',
            title: 'Learn Shree Suktam Sadhana',
            day: 3,
          },
        ];

        setVideos(finalVideos);

        if (basicsSuktamVideo) {
          setCurrentVideo({ ...finalVideos[0] });
        } else if (finalVideos.length > 0) {
          setCurrentVideo(finalVideos[0]);
        }
      }

      const subRes = await fetch('/api/subscription');
      const subData = await subRes.json();

      if (subData.subscriptions?.length > 0) {
        const activeSub = subData.subscriptions.find(
          (sub: Subscription) =>
            sub.type === 'FOUR_DAY' &&
            sub.isActive &&
            new Date(sub.endDate) > new Date()
        );

        if (activeSub) {
          setSubscription(activeSub);
          const startDate = new Date(activeSub.startDate);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const currentDay = Math.min(diffDays, 4);
          setCurrentDay(currentDay);
        }

        const hasSixMonthPlan = subData.subscriptions.some(
          (sub: Subscription) =>
            sub.type === 'SIX_MONTH' &&
            sub.isActive &&
            new Date(sub.endDate) > new Date()
        );

        setHasActiveSixMonthPlan(hasSixMonthPlan);
      }

      const webRes = await fetch('/api/webinar');
      const webData = await webRes.json();
      if (webData.success) {
        setWebinars(webData.webinars);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modify the useEffect for data fetching
  useEffect(() => {
    if (!isInitialLoad && status === 'authenticated') {
      fetchData();
    }
  }, [status, isInitialLoad]);

  // Add this function to handle tab change
  const handleTabChange = (tab: 'videos' | 'upgrade') => {
    setActiveTab(tab);
    // Save current video state before switching tabs
    if (playerRef.current && currentVideo) {
      const currentTime = playerRef.current.getCurrentTime();
      localStorage.setItem('playbackTime', currentTime.toString());
    }
  };

  useEffect(() => {
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeApiReady(true);
    };
  }, []);

  // Handle popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const state = history.state;
      if (state && state.videoTime) {
        if (playerRef.current) {
          playerRef.current.seekTo(state.videoTime);
          playerRef.current.playVideo();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update the YouTube player initialization
  useEffect(() => {
    if (isYouTubeApiReady && currentVideo && isYouTubeUrl(currentVideo.url)) {
      const videoId = currentVideo.url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )?.[1];

      if (!videoId) {
        console.error('Invalid YouTube video ID');
        return;
      }

      if (playerRef.current) {
        playerRef.current.destroy();
      }

      let updateTimeInterval: NodeJS.Timeout;

      try {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            controls: videoStatus === 'completed' ? 1 : 0,
            disablekb: videoStatus !== 'completed' ? 1 : 0,
            fs: videoStatus === 'completed' ? 1 : 0,
            iv_load_policy: 3,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            widget_referrer: window.location.origin,
            host: 'https://www.youtube-nocookie.com',
          },
          events: {
            onReady: (event: YouTubePlayerEvent) => {
              try {
                const savedTime = localStorage.getItem('playbackTime');
                if (savedTime) {
                  event.target.seekTo(parseFloat(savedTime));
                }
                if (videoStatusRef.current === 'live') {
                  event.target.playVideo();
                }
              } catch (error) {
                console.error('Error in onReady:', error);
              }
            },
            onStateChange: (event: YouTubePlayerEvent) => {
              try {
                if (event.data === window.YT.PlayerState.ENDED) {
                  localStorage.setItem('videoStatus', 'completed');
                  setVideoStatus('completed');
                  videoStatusRef.current = 'completed';
                  setShowCompletionMessage(true);
                  setTimeout(() => {
                    setShowCompletionMessage(false);
                  }, 5000);
                  if (updateTimeInterval) {
                    clearInterval(updateTimeInterval);
                  }
                } else if (event.data === window.YT.PlayerState.PLAYING) {
                  if (updateTimeInterval) {
                    clearInterval(updateTimeInterval);
                  }

                  updateTimeInterval = setInterval(() => {
                    try {
                      if (
                        playerRef.current &&
                        typeof playerRef.current.getCurrentTime === 'function'
                      ) {
                        const time = playerRef.current.getCurrentTime();
                        localStorage.setItem('playbackTime', time.toString());
                      }
                    } catch (error) {
                      console.error('Error updating time:', error);
                      if (updateTimeInterval) {
                        clearInterval(updateTimeInterval);
                      }
                    }
                  }, 1000);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  if (updateTimeInterval) {
                    clearInterval(updateTimeInterval);
                  }
                }
              } catch (error) {
                console.error('Error in onStateChange:', error);
              }
            },
            onError: (event: YouTubePlayerEvent) => {
              console.error('YouTube Player Error:', event.data);
            },
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }

      return () => {
        if (updateTimeInterval) {
          clearInterval(updateTimeInterval);
        }
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (error) {
            console.error('Error destroying player:', error);
          }
        }
      };
    }
  }, [isYouTubeApiReady, currentVideo, videoStatus]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      try {
        if (
          document.visibilityState === 'visible' &&
          videoStatus === 'live' &&
          playerRef.current &&
          typeof playerRef.current.getPlayerState === 'function' &&
          playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING
        ) {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.error('Error in visibility change handler:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [videoStatus]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        history.replaceState({ ...history.state, videoTime: time }, '');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const extractVideoMetadata = async (video: Video) => {
    if (isYouTubeUrl(video.url)) {
      setVideoMetadata((prev) => ({
        ...prev,
        [video.id]: 'YouTube Video',
      }));
      return 'YouTube Video';
    }

    try {
      const videoElement = document.createElement('video');
      videoElement.src = video.url;

      return new Promise((resolve) => {
        videoElement.addEventListener('loadedmetadata', () => {
          const duration = videoElement.duration;

          if (isFinite(duration) && !isNaN(duration)) {
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            setVideoMetadata((prev) => ({
              ...prev,
              [video.id]: formattedDuration,
            }));

            resolve(formattedDuration);
          } else {
            setVideoMetadata((prev) => ({
              ...prev,
              [video.id]: 'Not Available',
            }));
            resolve('Not Available');
          }
        });

        videoElement.addEventListener('error', () => {
          console.error('Error loading video metadata');
          setVideoMetadata((prev) => ({
            ...prev,
            [video.id]: 'Not Available',
          }));
          resolve('Not Available');
        });
      });
    } catch (error) {
      console.error('Error extracting video metadata:', error);
      setVideoMetadata((prev) => ({
        ...prev,
        [video.id]: 'Not Available',
      }));
      return 'Not Available';
    }
  };

  const handleVideoSelect = async (video: Video) => {
    setCurrentVideo(video);

    if (!videoMetadata[video.id]) {
      await extractVideoMetadata(video);
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-col items-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">
          Loading your content...
        </p>
      </div>
    </div>
  );

  if (loading || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (
    !subscription ||
    subscription.type !== 'FOUR_DAY' ||
    !subscription.isActive
  ) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <motion.div
          className="rounded-full bg-red-100 p-4 text-red-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Lock className="size-12" />
        </motion.div>
        <motion.h2
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Subscription Required
        </motion.h2>
        <motion.p
          className="max-w-md text-center text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          You need an active 4-Day plan to access this content. Upgrade now to
          unlock all videos and features.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => redirect('/pricing')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl hover:shadow-blue-500/30"
          >
            Purchase Plan
          </Button>
        </motion.div>
      </div>
    );
  }

  const upcomingWebinars = webinars
    .filter((w) => new Date(w.webinarDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.webinarDate).getTime() - new Date(b.webinarDate).getTime()
    )
    .slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <motion.h1
            className="text-xl font-bold text-gray-800 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            4-Day Meditation Challenge
          </motion.h1>

          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
            <motion.button
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
              onClick={() => handleTabChange('videos')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="size-4" />
              <span>Videos</span>
            </motion.button>

            <motion.button
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'upgrade'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
              onClick={() => handleTabChange('upgrade')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="size-4" />
              <span>Upgrade to 599</span>
            </motion.button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((day) => {
              const video = videos.find((v) => v.day === day);
              const isUnlocked = day <= currentDay;

              return (
                <motion.div
                  key={day}
                  className={`rounded-lg border p-3 ${
                    isUnlocked
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * day }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    </div>
                    {isUnlocked ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Unlocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Locked
                      </span>
                    )}
                  </div>
                  {video && (
                    <>
                      <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                        {day === 1
                          ? 'Basics of Shree Suktam Sadhana'
                          : day === 2
                            ? 'Shree Yantra Pooja'
                            : 'Learn Shree Suktam Sadhana'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="size-3" />
                        <span>
                          {isUnlocked
                            ? 'Available Now'
                            : day === currentDay + 1
                              ? 'Unlocks at 9:00 PM'
                              : 'Coming Soon'}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div
          className={`flex flex-1 flex-col lg:flex-row ${activeTab !== 'videos' ? 'hidden' : ''}`}
        >
          <div className="w-full p-4 lg:w-7/12">
            <div className="relative h-[calc(100vh-280px)] overflow-hidden rounded-xl bg-black shadow-xl">
              {currentVideo ? (
                <>
                  {isYouTubeUrl(currentVideo.url) ? (
                    <div className="relative size-full overflow-hidden rounded-xl bg-black">
                      <div
                        id="youtube-player"
                        className="size-full"
                        style={{
                          pointerEvents:
                            videoStatus === 'completed' ? 'auto' : 'none',
                        }}
                      />
                      {videoStatus === 'live' && (
                        <div className="pointer-events-none absolute left-4 top-4">
                          <div className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                            <div className="size-2 animate-pulse rounded-full bg-white"></div>
                            LIVE
                          </div>
                        </div>
                      )}
                      {videoStatus === 'pending' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center text-white">
                            <Clock className="mx-auto mb-4 size-12" />
                            <p className="text-lg font-medium">
                              Live stream starts at 9:00 PM
                            </p>
                          </div>
                        </div>
                      )}
                      {showCompletionMessage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center text-white">
                            <CheckCircle className="mx-auto mb-4 size-12" />
                            <p className="text-lg font-medium">
                              Live stream has ended
                            </p>
                            <p className="mt-2 text-sm text-gray-300">
                              You can now replay the video
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <video
                      key={currentVideo.id}
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      className="size-full rounded-xl [&::-webkit-media-controls-current-time-display]:hidden [&::-webkit-media-controls-panel]:!bg-black/70 [&::-webkit-media-controls-play-button]:hidden [&::-webkit-media-controls-time-remaining-display]:hidden [&::-webkit-media-controls-timeline]:hidden"
                      poster={
                        currentVideo.webinarDetails?.webinarTitle
                          ? `/assets/webinar-thumbnail.jpg`
                          : undefined
                      }
                      autoPlay
                      loop
                      controls
                      playsInline
                      style={
                        {
                          '--webkit-media-controls-play-button': 'none',
                          '--webkit-media-controls-timeline': 'none',
                          '--webkit-media-controls-current-time-display':
                            'none',
                          '--webkit-media-controls-time-remaining-display':
                            'none',
                        } as React.CSSProperties
                      }
                    >
                      <source src={currentVideo.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <div className="text-center">
                    <Play className="mx-auto size-12 text-gray-400" />
                    <p className="mt-2">Select a video to start playing</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full p-4 lg:w-5/12">
            <div className="h-[calc(100vh-280px)] overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
              <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                <motion.h1
                  className="mb-2 text-xl font-bold text-gray-800 dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentVideo?.title || 'Select a Video'}
                </motion.h1>
                {currentVideo?.webinarDetails && (
                  <motion.p
                    className="mb-2 text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentVideo.webinarDetails.webinarTitle}
                  </motion.p>
                )}
                <motion.div
                  className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="size-4 text-blue-500 dark:text-blue-400" />
                    <span>
                      {currentVideo
                        ? new Date(currentVideo.createdAt).toLocaleDateString()
                        : 'No date'}
                    </span>
                  </div>
                  {currentVideo && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="size-4 text-red-500 dark:text-red-400" />
                      <span className="flex items-center gap-2">
                        <span className="size-2 animate-pulse rounded-full bg-red-500 dark:bg-red-400"></span>
                        LIVE
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="h-[calc(100%-120px)] overflow-y-auto p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Course Videos
                </h3>
                <div className="space-y-3">
                  {videos.map((video, index) => {
                    const isCurrent = video.id === currentVideo?.id;
                    const isLocked = (video.day || 0) > currentDay;

                    return (
                      <motion.div
                        key={video.id}
                        onClick={() => !isLocked && handleVideoSelect(video)}
                        className={`group relative cursor-pointer overflow-hidden rounded-lg border p-3 transition-all duration-300
                          ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-900/30'
                              : isLocked
                                ? 'border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800/50'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-blue-500'
                          }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={!isLocked ? { y: -2 } : {}}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                              isCurrent
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400'
                                : isLocked
                                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {isLocked ? (
                              <Lock className="size-5" />
                            ) : (
                              <Play className="size-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className={`font-medium ${
                                  isCurrent
                                    ? 'text-blue-700 dark:text-blue-400'
                                    : isLocked
                                      ? 'text-gray-400 dark:text-gray-500'
                                      : 'text-gray-800 dark:text-gray-200'
                                }`}
                              >
                                {video.title}
                              </span>
                              {isCurrent && (
                                <motion.span
                                  className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                  }}
                                >
                                  Playing
                                </motion.span>
                              )}
                              {isLocked && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                  Day {video.day}
                                </span>
                              )}
                            </div>
                            {video.webinarDetails && (
                              <p className="mb-1 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                                {video.webinarDetails.webinarTitle}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              {videoMetadata[video.id] && (
                                <div className="flex items-center gap-1">
                                  <Clock className="size-3 text-red-500 dark:text-red-400" />
                                  <span className="flex items-center gap-1">
                                    <span className="size-1.5 animate-pulse rounded-full bg-red-500 dark:bg-red-400"></span>
                                    LIVE
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isLocked && (
                          <motion.div
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400"
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <ChevronRight className="size-5" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 ${activeTab !== 'upgrade' ? 'hidden' : ''}`}>
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                Upgrade to Full Access
              </h2>
              <p className="mx-auto mb-4 max-w-2xl text-gray-600 dark:text-gray-400">
                Get unlimited access to all upcoming webinars with our 6-month
                subscription. Join our exclusive community and never miss out on
                valuable learning opportunities.
              </p>

              <motion.div
                className="mx-auto mb-6 flex max-w-md flex-wrap items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Users className="size-4" />
                  <span>Access to all webinars</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Star className="size-4" />
                  <span>Premium content</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <Zap className="size-4" />
                  <span>No expiration</span>
                </div>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingWebinars.map((webinar, index) => (
                <motion.div
                  key={webinar.id}
                  className="group relative h-full overflow-hidden rounded-xl border bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800"
                  onClick={() => {
                    setSelectedWebinarId(webinar.id);
                    setShowSubscriptionModal(true);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative aspect-video w-full">
                    {webinar.imageUrl ? (
                      <Image
                        src={webinarImage.src}
                        alt={webinar.webinarTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-800">
                        <Lock className="size-8 text-gray-400" />
                      </div>
                    )}

                    {(webinar.imageUrl || index % 2 !== 0) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <h3 className="mb-1 line-clamp-2 text-sm font-semibold">
                        {webinar.webinarTitle}
                      </h3>
                      <p className="mb-2 line-clamp-1 text-xs text-gray-200">
                        {webinar.webinarName}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <Calendar className="size-3" />
                          <span>
                            {format(
                              parseISO(webinar.webinarDate),
                              'MMM dd, yyyy'
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <Clock className="size-3" />
                          <span>{webinar.webinarTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <motion.button
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Join Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {hasActiveSixMonthPlan ? (
                <motion.div
                  className="mx-auto inline-flex items-center gap-2 rounded-full bg-green-50 px-6 py-3 text-green-700"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle className="size-5" />
                  <span>You already have an active 6-Month plan</span>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => {
                    setSelectedWebinarId(null);
                    setShowSubscriptionModal(true);
                  }}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:shadow-blue-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upgrade to 6-Month Plan
                </motion.button>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Get access to all webinars and exclusive content
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
        webinarId={selectedWebinarId || undefined}
      />
    </div>
  );
}
