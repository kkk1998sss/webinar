'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { addDays, isAfter, setHours, setMinutes, setSeconds } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Crown,
  Lock,
  Maximize2,
  MessageCircle,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// import { PaidWebinarFourday } from '../webinar-list/PaidWebinarFourday';
import { Button } from '@/components/ui/button';
// import { Webinar } from '@/types/user'; // Commented out - no longer used

interface VideoData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  zataVideoUrl?: string | null;
  day: number;
  createdAt: string;
}

interface Subscription {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isFree?: boolean;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
  name: string;
}

interface VideoCompletionStatus {
  [videoId: string]: {
    completed: boolean;
    timestamp: number;
  };
}

export default function FourDayPlanFree() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // const [webinars, setWebinars] = useState<Webinar[]>([]); // Commented out - no longer used
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState<VideoCompletionStatus>({});
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [sessionElapsed, setSessionElapsed] = useState<string>('');
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    title: string;
  } | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const playerRef = useRef<HTMLIFrameElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const videoCheckRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Dummy session object for handleJoinWebinar (Commented Out)
  // const session = { user: { isAdmin: false } };

  // Set current time on client side only to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());

    // Detect iOS device
    const userAgent =
      navigator.userAgent ||
      navigator.vendor ||
      (window as { opera?: string }).opera ||
      '';
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    console.log('Device detection:', { isIOS: isIOSDevice, userAgent });

    // For iOS devices, try to enable autoplay by triggering a user interaction
    if (isIOSDevice) {
      // Add a one-time click listener to the document to enable autoplay
      const enableIOSAutoplay = () => {
        console.log('iOS autoplay enabled via user interaction');
        document.removeEventListener('click', enableIOSAutoplay);
        document.removeEventListener('touchstart', enableIOSAutoplay);
      };

      document.addEventListener('click', enableIOSAutoplay, { once: true });
      document.addEventListener('touchstart', enableIOSAutoplay, {
        once: true,
      });
    }
  }, []);

  // Update session elapsed time every second when in live mode
  useEffect(() => {
    if (isLiveMode && currentVideo && subscription?.startDate) {
      const unlockTime = getUnlockTime(
        subscription.startDate,
        currentVideo.day
      );

      // Set initial session elapsed
      setSessionElapsed(calculateSessionElapsed(unlockTime));

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start new timer that only updates the display, not the video logic
      timerRef.current = setInterval(() => {
        const now = new Date();
        setSessionElapsed(calculateSessionElapsedWithTime(unlockTime, now));
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      setSessionElapsed('');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isLiveMode, currentVideo, subscription, calculateSessionElapsed]);

  // Load saved video progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('videoProgressFree');
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
    localStorage.setItem('videoProgressFree', JSON.stringify(videoProgress));
  }, [videoProgress]);

  // Fetch videos, subscription, and user data
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Fetching data for FourDayPlanFree...');
        const [videoRes, subRes, userRes] = await Promise.all([
          fetch('/api/four-day'),
          fetch('/api/subscription'), // Changed from /api/subscription/free to /api/subscription
          fetch('/api/register'), // Get user info including registration date
        ]);

        if (!isMounted) return; // Exit if component unmounted

        const videoData = await videoRes.json();
        const subData = await subRes.json();
        const userData = await userRes.json();

        if (Array.isArray(videoData.videos)) {
          setVideos(videoData.videos);
        }

        // Find current user from the user list
        if (Array.isArray(userData)) {
          // In a real app, you'd get this from session/auth
          // For now, we'll take the most recent user (assuming they just registered)
          const currentUser = userData[userData.length - 1];
          setUser(currentUser);
        }

        // Find any subscription (free or paid)
        if (subData.subscriptions?.length > 0) {
          // First try to find a SIX_MONTH (699 plan) subscription
          const sixMonthSub = subData.subscriptions.find(
            (sub: Subscription) => sub.type === 'SIX_MONTH' && sub.isActive
          );

          // If no SIX_MONTH, find a FOUR_DAY subscription (free plan)
          const fourDaySub = subData.subscriptions.find(
            (sub: Subscription) => sub.type === 'FOUR_DAY' && sub.isActive
          );

          // Use SIX_MONTH if available, otherwise use FOUR_DAY
          const selectedSub = sixMonthSub || fourDaySub;
          setSubscription(selectedSub || null);

          console.log('Subscription data:', {
            allSubscriptions: subData.subscriptions,
            sixMonthSubscription: sixMonthSub,
            fourDaySubscription: fourDaySub,
            selectedSubscription: selectedSub,
            startDate: selectedSub?.startDate,
            subscriptionType: selectedSub?.type,
            isActive: selectedSub?.isActive,
          });

          // Set current video to first video if subscription exists
          if (selectedSub && videoData.videos?.length > 0) {
            const firstVideo = videoData.videos[0];
            setCurrentVideo(firstVideo);
          } else {
            setCurrentVideo(videoData.videos[0] || null);
          }
        } else {
          setCurrentVideo(videoData.videos[0] || null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch webinars for paid section (Commented Out)
  // useEffect(() => {
  //   fetch('/api/webinar')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (Array.isArray(data.webinars)) setWebinars(data.webinars);
  //       else if (Array.isArray(data)) setWebinars(data);
  //     })
  //     .catch(() => setWebinars([]));
  // }, []);

  // iOS-specific video player optimization
  const optimizeForIOS = useCallback(() => {
    const currentPlayer = currentVideo?.videoUrl.includes('idr01.zata.ai')
      ? videoPlayerRef.current
      : playerRef.current;

    if (!isIOS || !currentPlayer) return;

    try {
      // For iframe players (YouTube/Vimeo)
      if (currentPlayer === playerRef.current) {
        // Force iframe to be interactive on iOS
        const iframe = playerRef.current;

        // Add touch event listeners for iOS
        iframe.addEventListener(
          'touchstart',
          (e) => {
            e.stopPropagation();
          },
          { passive: true }
        );

        iframe.addEventListener(
          'touchmove',
          (e) => {
            e.stopPropagation();
          },
          { passive: true }
        );

        // iOS Safari specific optimizations
        iframe.style.webkitTransform = 'translateZ(0)';
        iframe.style.transform = 'translateZ(0)';

        console.log('iOS iframe video player optimized');
      }
      // For video elements (Zata AI), no special optimization needed
      else {
        console.log('iOS video element player - no optimization needed');
      }
    } catch (error) {
      console.error('Error optimizing for iOS:', error);
    }
  }, [isIOS, currentVideo?.videoUrl]);

  // Fetch video metadata when current video changes
  useEffect(() => {
    if (currentVideo?.videoUrl) {
      fetchVideoMetadata(currentVideo.videoUrl).then((metadata) => {
        if (metadata) {
          setVideoMetadata(metadata);
          console.log('Video metadata loaded:', metadata);
        }
      });

      // Optimize for iOS if needed
      if (isIOS) {
        setTimeout(optimizeForIOS, 1000); // Delay to ensure iframe is loaded
      }
    }
  }, [currentVideo, isIOS, optimizeForIOS]);

  // Reset live mode when video changes
  useEffect(() => {
    if (currentVideo && subscription?.startDate) {
      const videoStatus = videoProgress[currentVideo.id];
      const unlockTime = getUnlockTime(
        subscription.startDate,
        currentVideo.day
      );
      const isCompleted = videoStatus?.completed || false;
      const shouldBeLive = shouldBeInLiveMode(unlockTime, isCompleted);
      const shouldMarkCompleted = shouldMarkAsCompleted(unlockTime);

      console.log('Live mode state update:', {
        videoId: currentVideo.id,
        isCompleted,
        shouldBeLive,
        shouldMarkCompleted,
        videoDuration: videoMetadata?.duration,
        currentIsLiveMode: isLiveMode,
      });

      // Auto-mark as completed if enough time has passed
      if (shouldMarkCompleted && !isCompleted) {
        console.log('Auto-marking video as completed due to time elapsed');
        setVideoProgress((prev) => ({
          ...prev,
          [currentVideo.id]: {
            completed: true,
            timestamp: currentTime ? currentTime.getTime() : Date.now(),
          },
        }));
        setVideoCompleted(true);
        setIsLiveMode(false);
      } else if (isCompleted) {
        // Video already completed, show in playback mode
        console.log('Setting to playback mode (completed)');
        setIsLiveMode(false);
        setVideoCompleted(true);
      } else if (shouldBeLive) {
        // Video should be in live mode
        console.log('Setting to live mode');
        setIsLiveMode(true);
        setVideoCompleted(false);
      } else {
        // Video is not yet unlocked or past live window
        console.log('Setting to waiting mode');
        setIsLiveMode(false);
        setVideoCompleted(false);
      }
    }
  }, [
    currentVideo,
    videoProgress,
    subscription,
    isLiveMode,
    currentTime,
    videoMetadata,
    shouldBeInLiveMode,
    shouldMarkAsCompleted,
  ]);

  // Memoize paid webinars - same logic as webinar-view.tsx (Commented Out)
  // const paidWebinars = useMemo(() => {
  //   const paid: Webinar[] = [];

  //   webinars.forEach((webinar) => {
  //     // PAID LOGIC - Add to paid section if isPaid is true, regardless of date
  //     if (webinar && webinar.isPaid === true) {
  //       console.log(
  //         'FourDayPlanFree: Adding to paid section:',
  //         webinar.webinarTitle
  //       );
  //       paid.push(webinar);
  //     }
  //   });

  //   // Sort by date (ascending)
  //   paid.sort((a, b) =>
  //     compareAsc(parseISO(a.webinarDate), parseISO(b.webinarDate))
  //   );

  //   console.log('FourDayPlanFree: Paid webinars:', {
  //     total: paid.length,
  //     webinars: paid.map((w) => ({
  //       id: w.id,
  //       title: w.webinarTitle,
  //       isPaid: w.isPaid,
  //       date: w.webinarDate,
  //     })),
  //   });

  //   return paid;
  // }, [webinars]);

  // Helper: Get unlock time for a video (9:00 PM on the correct day based on subscription start date)
  function getUnlockTime(startDate: string, day: number) {
    const base = addDays(new Date(startDate), day - 1);
    return setSeconds(setMinutes(setHours(base, 21), 0), 0); // 21:00:00 (9:00 PM)
  }

  // Helper: Check if video should be in live mode
  function shouldBeInLiveMode(
    unlockTime: Date | null,
    isCompleted: boolean
  ): boolean {
    if (!unlockTime || isCompleted) {
      console.log('Not in live mode:', {
        unlockTime: !!unlockTime,
        isCompleted,
      });
      return false; // If completed or no unlock time, always in playback mode
    }

    const now = currentTime || new Date();
    const timeSinceUnlock = now.getTime() - unlockTime.getTime();

    // If it's been more than 24 hours since unlock, assume it's completed
    if (timeSinceUnlock > 24 * 60 * 60 * 1000) {
      console.log('Live session expired (24h passed)');
      return false;
    }

    // If it's within the first 24 hours after unlock, it's in live mode
    const shouldBeLive = timeSinceUnlock >= 0;
    console.log('Live mode check:', {
      timeSinceUnlock: Math.floor(timeSinceUnlock / 1000),
      shouldBeLive,
    });
    return shouldBeLive;
  }

  // Helper: Get video start time for live mode
  function getVideoStartTime(unlockTime: Date | null): number {
    if (!unlockTime) return 0;

    const now = currentTime || new Date();
    const timeSinceUnlock = now.getTime() - unlockTime.getTime();

    // If user comes after 9:00 PM, start video from the appropriate time
    if (timeSinceUnlock > 0) {
      // Convert milliseconds to seconds for YouTube API
      return Math.floor(timeSinceUnlock / 1000);
    }

    return 0; // Start from beginning if before 9:00 PM
  }

  // Helper: Check if video should be marked as completed based on actual video duration
  function shouldMarkAsCompleted(unlockTime: Date | null): boolean {
    if (!unlockTime) return false;

    const now = currentTime || new Date();
    const timeSinceUnlock = now.getTime() - unlockTime.getTime();

    // Use actual video duration if available, otherwise fallback to 2 hours
    const actualDuration = videoMetadata?.duration || 2 * 60 * 60 * 1000; // 2 hours fallback
    const videoDurationMs = actualDuration * 1000; // Convert seconds to milliseconds

    console.log('Completion check:', {
      timeSinceUnlock: Math.floor(timeSinceUnlock / 1000),
      videoDuration: actualDuration,
      shouldComplete: timeSinceUnlock >= videoDurationMs,
    });

    return timeSinceUnlock >= videoDurationMs;
  }

  // Helper: Format time to 12-hour format (e.g., "9:00 PM")
  function formatTimeTo12Hour(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  // Helper: Get video metadata (duration) from our API
  async function fetchVideoMetadata(
    videoUrl: string
  ): Promise<{ duration: number; title: string } | null> {
    try {
      const response = await fetch('/api/video-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Video metadata:', data);
        return { duration: data.duration, title: data.title };
      }

      return null;
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return null;
    }
  }

  // Helper: Calculate session elapsed time (running timer)
  function calculateSessionElapsed(unlockTime: Date | null): string {
    if (!unlockTime) return '';

    const now = currentTime || new Date();
    const timeSinceUnlock = now.getTime() - unlockTime.getTime();

    if (timeSinceUnlock <= 0) return 'Starting now';

    const hours = Math.floor(timeSinceUnlock / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeSinceUnlock % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeSinceUnlock % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Helper: Calculate session elapsed time with specific time (for timer updates)
  function calculateSessionElapsedWithTime(
    unlockTime: Date | null,
    now: Date
  ): string {
    if (!unlockTime) return '';

    const timeSinceUnlock = now.getTime() - unlockTime.getTime();

    if (timeSinceUnlock <= 0) return 'Starting now';

    const hours = Math.floor(timeSinceUnlock / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeSinceUnlock % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeSinceUnlock % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Handle video completion
  const markVideoCompleted = useCallback(() => {
    if (currentVideo) {
      console.log('Video completed! Switching to playback mode...');
      setVideoProgress((prev) => ({
        ...prev,
        [currentVideo.id]: {
          completed: true,
          timestamp: currentTime ? currentTime.getTime() : Date.now(),
        },
      }));
      setVideoCompleted(true);
      setIsLiveMode(false);
    }
  }, [currentVideo, currentTime]);

  // Check if video is still playing (for persistence across refreshes)
  const checkVideoStatus = useCallback(() => {
    const currentPlayer = currentVideo?.videoUrl.includes('idr01.zata.ai')
      ? videoPlayerRef.current
      : playerRef.current;

    if (
      currentPlayer &&
      isLiveMode &&
      !videoCompleted &&
      videoMetadata?.duration
    ) {
      try {
        // Calculate how much time has passed since unlock
        const unlockTime =
          currentVideo && subscription?.startDate
            ? getUnlockTime(subscription.startDate, currentVideo.day)
            : null;

        if (unlockTime) {
          const now = currentTime || new Date();
          const timeSinceUnlock = now.getTime() - unlockTime.getTime();
          const timeSinceUnlockSeconds = Math.floor(timeSinceUnlock / 1000);

          console.log('Video status check:', {
            timeSinceUnlock: timeSinceUnlockSeconds,
            videoDuration: videoMetadata.duration,
            timeRemaining: videoMetadata.duration - timeSinceUnlockSeconds,
          });

          // If we've passed the video duration, mark as completed
          if (timeSinceUnlockSeconds >= videoMetadata.duration) {
            console.log('Video duration exceeded - marking as completed');
            markVideoCompleted();
          }
        }
      } catch (e) {
        console.error('Error checking video status:', e);
      }
    }
  }, [
    isLiveMode,
    videoCompleted,
    videoMetadata,
    currentVideo,
    user,
    currentTime,
    markVideoCompleted,
    subscription?.startDate,
  ]);

  // Listen for player state messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.origin, event.data);

      // YouTube player state responses
      if (
        event.origin === 'https://www.youtube.com' &&
        event.data &&
        event.data.info
      ) {
        const playerState = event.data.info.playerState;
        const currentTime = event.data.info.currentTime;
        const duration = event.data.info.duration;

        console.log('YouTube player state:', {
          playerState,
          currentTime,
          duration,
        });

        // Update video time tracking (commented out as not used)
        // if (currentTime !== undefined) setCurrentVideoTime(currentTime);
        // if (duration !== undefined) setVideoDuration(duration);

        if (playerState === 0) {
          // 0 = ended
          console.log('YouTube video ended - marking as completed');
          markVideoCompleted();
        }

        // Also check if video is near the end (within 5 seconds of duration)
        if (duration && currentTime && duration - currentTime <= 5) {
          console.log('Video near end - marking as completed');
          markVideoCompleted();
        }
      }

      // Vimeo player state responses
      if (
        event.origin === 'https://player.vimeo.com' &&
        event.data &&
        event.data.event === 'ended'
      ) {
        console.log('Vimeo video ended - marking as completed');
        markVideoCompleted();
      }

      // Handle YouTube API responses
      if (
        event.origin === 'https://www.youtube.com' &&
        event.data &&
        event.data.event === 'onStateChange'
      ) {
        console.log('YouTube state change:', event.data.info);
        if (event.data.info === 0) {
          console.log('YouTube video ended via state change');
          markVideoCompleted();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentVideo, isLiveMode, videoCompleted, markVideoCompleted]);

  // Periodically check video status during live mode
  useEffect(() => {
    if (isLiveMode && !videoCompleted) {
      videoCheckRef.current = setInterval(checkVideoStatus, 3000); // Check every 3 seconds

      // Also set a fallback timeout to mark as completed after a reasonable time
      // This handles cases where video completion events aren't detected
      const fallbackTimeout = setTimeout(
        () => {
          if (isLiveMode && !videoCompleted) {
            console.log('Fallback: Marking video as completed after timeout');
            markVideoCompleted();
          }
        },
        30 * 60 * 1000
      ); // 30 minutes fallback

      return () => {
        if (videoCheckRef.current) {
          clearInterval(videoCheckRef.current);
        }
        clearTimeout(fallbackTimeout);
      };
    } else if (videoCheckRef.current) {
      clearInterval(videoCheckRef.current);
      videoCheckRef.current = null;
    }

    return () => {
      if (videoCheckRef.current) {
        clearInterval(videoCheckRef.current);
      }
    };
  }, [isLiveMode, videoCompleted, checkVideoStatus, markVideoCompleted]);

  // Countdown Timer Component for locked videos
  function VideoCountdownTimer({ unlockTime }: { unlockTime: Date }) {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    const hasRefreshed = useRef(false);

    useEffect(() => {
      const calculateTimeLeft = () => {
        if (!unlockTime) return;

        const now = new Date();
        const difference = unlockTime.getTime() - now.getTime();

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          if (!hasRefreshed.current) {
            hasRefreshed.current = true;
            setTimeout(() => window.location.reload(), 500); // slight delay for UI
          }
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }, [unlockTime]);

    return (
      <div className="mt-4 w-full">
        <div className="text-center">
          <div className="mb-2 text-xs font-bold text-green-900">
            UNLOCKS IN
          </div>
          <div className="flex justify-center gap-2">
            {timeLeft.days > 0 && (
              <div className="flex flex-col items-center">
                <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-blue-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                  {timeLeft.days}
                </div>
                <span className="mt-1 text-xs font-medium text-green-900">
                  DAYS
                </span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-blue-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <span className="mt-1 text-xs font-medium text-green-900">
                HOURS
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-blue-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <span className="mt-1 text-xs font-medium text-green-900">
                MINUTES
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-blue-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <span className="mt-1 text-xs font-medium text-green-900">
                SECONDS
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handler for join button (Commented Out)
  // const handleJoinWebinar = (id: string) => {
  //   if (session.user?.isAdmin) {
  //     router.push(`/users/playing-area/${id}`);
  //     return;
  //   }
  //   router.push(`/users/playing-area/${id}`);
  // };

  // Fullscreen handler
  const handleFullscreen = () => {
    setIsFullscreen(true);
    const playerContainer = document.getElementById('video-player-container');
    if (playerContainer && playerContainer.requestFullscreen) {
      playerContainer.requestFullscreen();
    }
  };

  // Exit fullscreen handler
  const exitFullscreen = () => {
    setIsFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Exit fullscreen on ESC or when fullscreen is closed
  useEffect(() => {
    const exitHandler = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', exitHandler);
    return () => document.removeEventListener('fullscreenchange', exitHandler);
  }, [isFullscreen]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading your free content...
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
          <Sparkles className="mb-4 size-10 text-green-500 dark:text-green-400" />
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
            Access Free Content
          </h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            Get available to basic spiritual content and meditation guides.
          </p>
          <Button
            className="w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 py-3 font-semibold text-white shadow transition hover:shadow-lg"
            onClick={() => router.push('/auth/register-free')}
          >
            Get Available
          </Button>
        </motion.div>
      </div>
    );
  }

  // Don't render the main UI until we have the current time to avoid hydration issues
  if (!currentTime || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading your content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* WhatsApp Community Icon - Fixed Design */}
      <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
        {/* Mobile Version - Always visible */}
        <div className="sm:hidden">
          <a
            href="https://chat.whatsapp.com/F4RlvrkkyBLAz2FzjxBa4b?mode=r_t"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 shadow-2xl"
          >
            <div className="flex items-center justify-center rounded-full bg-white/20 p-2">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div className="ml-2 flex flex-col">
              <span className="text-xs font-bold text-white">
                Join Community
              </span>
              <span className="text-[10px] text-green-100">WhatsApp</span>
            </div>
          </a>
        </div>

        {/* Desktop Version - Hover to expand */}
        <div className="group hidden sm:block">
          <a
            href="https://chat.whatsapp.com/F4RlvrkkyBLAz2FzjxBa4b?mode=r_t"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 py-2 pl-2 pr-0 shadow-2xl transition-all duration-300 hover:shadow-green-500/25 group-hover:px-4 group-hover:pr-6"
          >
            <div className="flex items-center justify-center rounded-full bg-white/20 p-2">
              <MessageCircle className="size-6 text-white" />
            </div>
            <div className="ml-2 max-w-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-w-[240px]">
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-sm font-bold text-white">
                  Join our WhatsApp Community
                </span>
                <span className="text-xs text-green-100">
                  Get daily spiritual updates & guidance
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Day selection bar */}
      <div className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  className="rounded-full bg-gradient-to-r from-green-500 to-blue-500 p-3 font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-blue-600 hover:shadow-xl"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="size-6" />
                </Button>
              </motion.div>
            </div>

            <div className="grid flex-1 grid-cols-3 gap-4">
              {[1, 2, 3].map((day) => {
                const video = videos.find((v) => v.day === day);
                // Only unlock if subscription exists and time has passed
                let isUnlocked = false;
                let unlockTime: Date | null = null;
                if (subscription?.startDate) {
                  unlockTime = getUnlockTime(subscription.startDate, day);
                  isUnlocked = isAfter(currentTime, unlockTime);

                  console.log(`Day ${day} unlock check:`, {
                    startDate: subscription.startDate,
                    unlockTime: unlockTime?.toISOString(),
                    currentTime: currentTime?.toISOString(),
                    isUnlocked,
                  });
                }
                const isCurrent = currentVideo?.day === day;

                return (
                  <motion.div
                    key={day}
                    className={`relative select-none rounded-lg border p-3 transition-all
                      ${
                        isCurrent
                          ? 'border-green-300 ring-2 ring-green-500 dark:border-green-600 dark:ring-green-400'
                          : 'border-gray-200 dark:border-gray-700'
                      }
                      ${
                        isUnlocked
                          ? 'cursor-pointer bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50'
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
                            ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400'
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
                      {isCurrent && isUnlocked && (
                        <span className="absolute right-3 top-3 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Playing
                        </span>
                      )}
                    </div>
                    <div className="mb-2 flex min-h-[40px] items-center rounded-md bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 px-3 py-2 shadow-sm dark:from-green-900 dark:via-blue-900 dark:to-purple-900">
                      <span className="w-full truncate text-xs font-semibold text-green-900 dark:text-green-200">
                        {video ? (
                          video.title
                        ) : (
                          <span className="italic text-gray-400">No video</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="size-3" />
                      {isUnlocked ? (
                        <span>Available Now</span>
                      ) : (
                        <span>
                          Unlocks at{' '}
                          {unlockTime && formatTimeTo12Hour(unlockTime)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs font-semibold">
                      {isUnlocked ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-red-600">Locked</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="hidden sm:flex sm:flex-col sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  className="flex h-16 w-40 animate-pulse items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-green-600 hover:shadow-xl"
                  onClick={() => router.push('/users/ebook199')}
                >
                  <BookOpen className="size-7" />
                  <span className="text-base">E-Books</span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Button
                  className="flex h-16 w-40 animate-pulse items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
                  onClick={() => router.push('/audio/simple')}
                >
                  <Play className="size-7" />
                  <span className="text-base">Audio</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex w-full flex-col p-2 sm:p-4 lg:w-8/12">
          <div
            id="video-player-container"
            className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-xl ${
              isFullscreen
                ? 'fixed inset-0 z-[9999] aspect-auto h-screen w-screen rounded-none bg-black'
                : ''
            }`}
            style={{
              minHeight: '200px',
              maxHeight: '100vh',
            }}
          >
            {currentVideo ? (
              (() => {
                // --- LOCK CHECK LOGIC ---
                let isUnlocked = false;
                let unlockTime: Date | null = null;
                if (subscription?.startDate && currentVideo) {
                  unlockTime = getUnlockTime(
                    subscription.startDate,
                    currentVideo.day
                  );
                  isUnlocked = isAfter(currentTime, unlockTime);
                }

                if (!isUnlocked) {
                  // Show locked message instead of video player
                  return (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-300 sm:p-8">
                      <Lock className="mb-4 size-12 text-gray-400 sm:size-16" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                        Video Locked
                      </h3>
                      <p className="max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-300">
                        Shree Suktam Sadhana session will starts at{' '}
                        {unlockTime && formatTimeTo12Hour(unlockTime)}
                      </p>
                      {unlockTime && (
                        <VideoCountdownTimer unlockTime={unlockTime} />
                      )}
                    </div>
                  );
                }

                // --- NEW VIDEO PLAYER CODE WITH LIVE MODE LOGIC ---
                const videoStatus = videoProgress[currentVideo.id];
                const isCompleted = videoStatus?.completed || false;
                const isLiveMode = shouldBeInLiveMode(unlockTime, isCompleted);
                const videoStartTime = getVideoStartTime(unlockTime);

                console.log('Video player state:', {
                  videoId: currentVideo.id,
                  isCompleted,
                  isLiveMode,
                  videoStartTime,
                  unlockTime: unlockTime?.toISOString(),
                });

                return (
                  <div
                    className="flex h-full flex-col"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {/* Overlay: LIVE badge - only show in live mode */}
                    {isLiveMode && (
                      <div className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4">
                        <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs text-white shadow">
                          LIVE
                        </span>
                      </div>
                    )}

                    {/* Video Player - Only Zata AI videos */}
                    <video
                      ref={videoPlayerRef}
                      src={
                        (currentVideo as VideoData & { zataVideoUrl?: string })
                          .zataVideoUrl || currentVideo.videoUrl
                      }
                      title={currentVideo.title}
                      className={`absolute left-0 top-0 size-full ${isFullscreen ? 'z-10' : ''}`}
                      controls={!isLiveMode}
                      autoPlay={isLiveMode}
                      muted={false}
                      playsInline
                      preload="metadata"
                      onContextMenu={(e) => e.preventDefault()}
                      onError={(e) => {
                        console.error('Video loading error:', e);
                        console.error(
                          'Video src:',
                          (
                            currentVideo as VideoData & {
                              zataVideoUrl?: string;
                            }
                          ).zataVideoUrl || currentVideo.videoUrl
                        );
                      }}
                      onLoadStart={() => console.log('Video loading started')}
                      onCanPlay={() => console.log('Video can play')}
                      onLoadedData={() => console.log('Video data loaded')}
                      style={{
                        pointerEvents: isLiveMode ? 'none' : 'auto',
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                      }}
                    />

                    {/* Simple iOS Play Button - Only for iOS devices in live mode */}
                    {isIOS && isLiveMode && (
                      <div className="absolute left-2 top-12 z-10 sm:left-4 sm:top-16">
                        <button
                          onClick={() => {
                            const currentPlayer =
                              currentVideo?.videoUrl.includes('idr01.zata.ai')
                                ? videoPlayerRef.current
                                : playerRef.current;

                            if (currentPlayer) {
                              // Try multiple strategies to start the video
                              try {
                                // For Zata AI video elements
                                if (currentPlayer === videoPlayerRef.current) {
                                  const video = videoPlayerRef.current;
                                  if (video) {
                                    video.play().catch(console.error);
                                  }
                                }
                                // For iframe players (YouTube/Vimeo)
                                else if (currentPlayer === playerRef.current) {
                                  // Strategy 1: Force iframe reload
                                  const currentSrc = playerRef.current.src;
                                  playerRef.current.src = '';
                                  setTimeout(() => {
                                    if (playerRef.current) {
                                      playerRef.current.src = currentSrc;
                                    }
                                  }, 100);

                                  // Strategy 2: Try to trigger autoplay via postMessage for YouTube
                                  setTimeout(() => {
                                    try {
                                      if (
                                        playerRef.current &&
                                        playerRef.current.contentWindow
                                      ) {
                                        playerRef.current.contentWindow.postMessage(
                                          '{"event":"command","func":"playVideo","args":""}',
                                          '*'
                                        );
                                      }
                                    } catch (e) {
                                      console.log(
                                        'YouTube postMessage failed:',
                                        e
                                      );
                                    }
                                  }, 500);
                                }
                              } catch (e) {
                                console.log('iOS play button failed:', e);
                              }
                            }
                          }}
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                        >
                          ▶️ Play
                        </button>
                      </div>
                    )}

                    {/* Exit Fullscreen Button - Always visible when in fullscreen */}
                    {isFullscreen && (
                      <div className="absolute right-4 top-4 z-30">
                        <button
                          onClick={exitFullscreen}
                          className="rounded-full bg-black/60 p-2 text-white transition-all duration-200 hover:bg-black/80"
                          style={{
                            minWidth: 40,
                            minHeight: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Exit Fullscreen"
                        >
                          <X className="size-5" />
                        </button>
                      </div>
                    )}

                    {/* Overlay layer to block all controls/interactions in live mode */}
                    {isLiveMode && (
                      <div
                        className="z-5 absolute inset-0 bg-transparent"
                        style={{
                          touchAction: 'none',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                        }}
                      />
                    )}

                    {/* Bottom overlays: live mode */}
                    {isLiveMode && (
                      <div className="z-5 pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                          <div className="pointer-events-auto inline-block animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs text-white">
                            🎥 LIVE SESSION: Started at 9:00 PM - Running Live
                            Session {sessionElapsed}
                          </div>
                        </div>
                        <button
                          onClick={
                            isFullscreen ? exitFullscreen : handleFullscreen
                          }
                          className="pointer-events-auto rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                          title={
                            isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'
                          }
                          style={{
                            minWidth: 40,
                            minHeight: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isFullscreen ? (
                            <X className="size-5" />
                          ) : (
                            <Maximize2 className="size-5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Bottom overlays: playback mode */}
                    {!isLiveMode && (
                      <div className="z-5 pointer-events-none absolute inset-x-0 bottom-14 flex items-center justify-between px-6">
                        <div className="pointer-events-auto inline-block rounded-full bg-green-600 px-3 py-1 text-xs text-white">
                          {isCompleted
                            ? '✅ COMPLETED: Full playback available'
                            : '⏸️ WAITING: Video unlocks at 9:00 PM'}
                        </div>
                        <button
                          onClick={
                            isFullscreen ? exitFullscreen : handleFullscreen
                          }
                          className="pointer-events-auto rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                          title={
                            isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'
                          }
                          style={{
                            minWidth: 40,
                            minHeight: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isFullscreen ? (
                            <X className="size-5" />
                          ) : (
                            <Maximize2 className="size-5" />
                          )}
                        </button>
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
                  meditation session for free
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Buttons - After Video Section */}
        <div className="flex w-full justify-center gap-4 p-4 lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              className="flex animate-pulse items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-green-600 hover:shadow-xl"
              onClick={() => router.push('/users/ebook199')}
            >
              <BookOpen className="size-6" />
              <span className="text-sm">E-Books</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              className="flex animate-pulse items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
              onClick={() => router.push('/audio/simple')}
            >
              <Play className="size-6" />
              <span className="text-sm">Audio</span>
            </Button>
          </motion.div>
        </div>

        {/* Upgrade card on the right */}
        <div className="flex w-full items-center p-2 sm:p-4 lg:w-4/12">
          <motion.div
            className="flex w-full flex-col items-center rounded-xl bg-white p-4 shadow-lg sm:p-6 dark:bg-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Check if user has 699 plan (SIX_MONTH subscription) */}
            {subscription &&
            subscription.type === 'SIX_MONTH' &&
            subscription.isActive ? (
              // User has 699 plan - show webinar list access
              <>
                <Crown className="mb-4 size-8 text-green-500 sm:size-10 dark:text-green-400" />
                <h2 className="mb-2 text-center text-lg font-bold text-gray-800 sm:text-xl dark:text-white">
                  Premium Content Access
                </h2>
                <p className="mb-4 text-center text-xs text-gray-600 sm:text-sm dark:text-gray-300">
                  You have access to all premium webinars and content
                </p>
                <Button
                  className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg sm:py-3 sm:text-base"
                  onClick={() => {
                    console.log(
                      'Button clicked - redirecting to /dashboard-free'
                    );
                    console.log('Current subscription:', subscription);
                    router.push('/dashboard-free');
                  }}
                >
                  <Crown className="mr-2 size-4" />
                  View Webinar List
                </Button>
              </>
            ) : (
              // User doesn't have 699 plan - show upgrade card
              <>
                <Crown className="mb-4 size-8 text-orange-500 sm:size-10 dark:text-orange-400" />
                <h2 className="mb-2 text-center text-lg font-bold text-gray-800 sm:text-xl dark:text-white">
                  6-Months Premium Subscription
                </h2>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    ₹699
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    /6 months
                  </span>
                </div>
                <p className="mb-4 text-center text-xs text-gray-600 sm:text-sm dark:text-gray-300">
                  Unlock 70+ premium meditations &amp; courses
                </p>
                <ul className="mb-6 w-full space-y-2 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3 text-orange-500 sm:size-4" />
                    <span>Live session Every Sunday at 10 AM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3 text-orange-500 sm:size-4" />
                    <span>
                      Learn Shree Suktam in detail and unlock the secrets
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3 text-orange-500 sm:size-4" />
                    <span>Swar Vigyan - Ancient breath techniques</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3 text-orange-500 sm:size-4" />
                    <span>
                      Vigyan Bhairav Tantra - 70+ meditation techniques
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3 text-orange-500 sm:size-4" />
                    <span>Hanuman Chalisa with Spiritual meaning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3 text-orange-500 sm:size-4" />
                    <span>E-books and Many more...</span>
                  </li>
                </ul>
                <Button
                  className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-red-600 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg sm:py-3 sm:text-base"
                  onClick={() => router.push('/')}
                >
                  Upgrade to Premium
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Paid Webinar Section - Commented Out */}
      {/* <section className="my-8 w-full">
        <PaidWebinarFourday
          webinars={paidWebinars}
          handleJoinWebinar={handleJoinWebinar}
        />
      </section> */}
    </div>
  );
}
