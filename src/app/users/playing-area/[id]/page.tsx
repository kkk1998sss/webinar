'use client';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import {
  differenceInSeconds,
  format,
  isAfter,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Globe,
  Maximize2,
  MessageCircle,
  Play,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Webinar } from '@/types/user';

interface VideoCompletionStatus {
  [webinarId: string]: {
    completed: boolean;
    timestamp: number;
    watchTime: number;
  };
}

interface WebinarWithVideo extends Webinar {
  video: {
    id: string;
    title: string;
    url?: string;
    publicId?: string;
  };
}

export default function WebinarPlayingArea({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [webinar, setWebinar] = useState<WebinarWithVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState<VideoCompletionStatus>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [sessionElapsed, setSessionElapsed] = useState<string>('');
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    title: string;
  } | null>(null);
  const [webinarStartTime, setWebinarStartTime] = useState<Date | null>(null);
  // Note: webinarEndTime removed as it was not being used
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const playerRef = useRef<HTMLIFrameElement | null>(null);
  const videoCheckRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Set current time on client side only to avoid hydration issues
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  // Load saved video progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('webinarVideoProgress');
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
    localStorage.setItem('webinarVideoProgress', JSON.stringify(videoProgress));
  }, [videoProgress]);

  // Fetch webinar data
  useEffect(() => {
    const fetchWebinar = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/webinar/${id}`);
        const data = await response.json();

        if (data.success && data.webinar) {
          console.log('Fetched webinar data:', data.webinar);
          console.log('Video data:', data.webinar.video);
          console.log('YouTube link:', data.webinar.youtubeLink);

          setWebinar(data.webinar);

          // Calculate webinar timing
          if (data.webinar.webinarDate && data.webinar.webinarTime) {
            const webinarDate = parseISO(data.webinar.webinarDate);
            const [hours, minutes] = data.webinar.webinarTime
              .split(':')
              .map(Number);
            const startTime = setSeconds(
              setMinutes(setHours(webinarDate, hours), minutes),
              0
            );
            setWebinarStartTime(startTime);
          }
        } else {
          console.error('Failed to fetch webinar:', data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [id]);

  // Fetch video metadata when webinar changes
  useEffect(() => {
    // Use youtubeLink if available, otherwise fall back to video.url
    const videoUrl = webinar?.youtubeLink || webinar?.video?.url;
    console.log('Video metadata effect triggered:', {
      webinarId: webinar?.id,
      youtubeLink: webinar?.youtubeLink,
      videoUrl: webinar?.video?.url,
      finalVideoUrl: videoUrl,
    });

    if (videoUrl) {
      fetchVideoMetadata(videoUrl).then((metadata) => {
        if (metadata) {
          setVideoMetadata(metadata);
          console.log('Video metadata loaded:', metadata);
        }
      });
    } else {
      console.log('No video URL available for metadata fetch');
    }
  }, [webinar]);

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

  // Update session elapsed time every second when in live mode
  useEffect(() => {
    if (isLiveMode && webinarStartTime && currentTime) {
      // Set initial session elapsed
      setSessionElapsed(calculateSessionElapsed(webinarStartTime));

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start new timer that updates the display
      timerRef.current = setInterval(() => {
        const now = new Date();
        setSessionElapsed(
          calculateSessionElapsedWithTime(webinarStartTime, now)
        );
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
  }, [isLiveMode, webinarStartTime, currentTime]);

  // Determine live mode and completion status
  useEffect(() => {
    if (webinar && webinarStartTime && currentTime) {
      const videoStatus = videoProgress[webinar.id];
      const isCompleted = videoStatus?.completed || false;
      const now = currentTime;

      // Check if webinar has started
      const hasStarted = isAfter(now, webinarStartTime);

      // Check if enough time has passed to mark as completed (more precise calculation)
      const timeSinceStart = differenceInSeconds(now, webinarStartTime);
      const expectedDuration =
        videoMetadata?.duration ||
        (webinar.durationHours * 60 + webinar.durationMinutes) * 60;
      const shouldMarkCompleted = timeSinceStart >= expectedDuration;

      console.log('🎯 Webinar Live Mode Check:', {
        webinarId: webinar.id,
        webinarTitle: webinar.webinarTitle,
        hasStarted,
        shouldMarkCompleted,
        isCompleted,
        timeSinceStart,
        timeSinceStartFormatted: `${Math.floor(timeSinceStart / 60)}m ${timeSinceStart % 60}s`,
        expectedDuration,
        expectedDurationFormatted: videoMetadata
          ? `${Math.floor(expectedDuration / 60)}m ${expectedDuration % 60}s`
          : `${webinar.durationHours}h ${webinar.durationMinutes}m`,
        videoMetadataDuration: videoMetadata?.duration,
        videoMetadataFormatted: videoMetadata
          ? `${Math.floor(videoMetadata.duration / 60)}m ${videoMetadata.duration % 60}s`
          : 'Not loaded',
        apiDuration:
          (webinar.durationHours * 60 + webinar.durationMinutes) * 60,
        apiDurationFormatted: `${webinar.durationHours}h ${webinar.durationMinutes}m`,
        timeRemaining: expectedDuration - timeSinceStart,
        timeRemainingFormatted: `${Math.floor((expectedDuration - timeSinceStart) / 60)}m ${(expectedDuration - timeSinceStart) % 60}s`,
        usingVideoMetadata: !!videoMetadata?.duration,
      });

      if (shouldMarkCompleted && !isCompleted) {
        // Auto-mark as completed if enough time has passed
        console.log('Auto-marking webinar as completed due to time elapsed');
        setVideoProgress((prev) => ({
          ...prev,
          [webinar.id]: {
            completed: true,
            timestamp: currentTime.getTime(),
            watchTime: webinar.durationHours * 60 + webinar.durationMinutes,
          },
        }));
        setVideoCompleted(true);
        setIsLiveMode(false);
      } else if (isCompleted) {
        // Webinar already completed, show in playback mode
        console.log('Setting to playback mode (completed)');
        setIsLiveMode(false);
        setVideoCompleted(true);
      } else if (hasStarted && !shouldMarkCompleted) {
        // Webinar has started and duration hasn't exceeded
        console.log('Setting to live mode');
        setIsLiveMode(true);
        setVideoCompleted(false);
      } else {
        // Webinar hasn't started yet or duration exceeded
        console.log(
          'Webinar not started yet or duration exceeded, enabling playback mode'
        );
        setIsLiveMode(false);
        setVideoCompleted(false);
      }
    }
  }, [webinar, webinarStartTime, currentTime, videoProgress, videoMetadata]);

  // Handle video completion
  const markVideoCompleted = useCallback(() => {
    if (webinar && currentTime) {
      console.log('Webinar completed! Switching to playback mode...');
      setVideoProgress((prev) => ({
        ...prev,
        [webinar.id]: {
          completed: true,
          timestamp: currentTime.getTime(),
          watchTime: webinar.durationHours * 60 + webinar.durationMinutes,
        },
      }));
      setVideoCompleted(true);
      setIsLiveMode(false);
    }
  }, [webinar, currentTime]);

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
  }, [webinar, isLiveMode, videoCompleted, markVideoCompleted]);

  // Periodically check video status during live mode
  useEffect(() => {
    if (isLiveMode && !videoCompleted) {
      videoCheckRef.current = setInterval(() => {
        if (webinarStartTime && currentTime && webinar) {
          const timeSinceStart = differenceInSeconds(
            currentTime,
            webinarStartTime
          );
          const expectedDuration =
            (webinar.durationHours * 60 + webinar.durationMinutes) * 60;

          console.log('Video status check:', {
            timeSinceStart,
            expectedDuration,
            timeRemaining: expectedDuration - timeSinceStart,
            shouldComplete: timeSinceStart >= expectedDuration,
          });

          // If we've passed the expected duration, mark as completed immediately
          if (timeSinceStart >= expectedDuration) {
            console.log(
              'Webinar duration exceeded - marking as completed and switching to playback mode'
            );
            markVideoCompleted();
            return; // Exit early since we're marking as completed
          }
        }
      }, 1000); // Check every 1 second for more responsive completion

      return () => {
        if (videoCheckRef.current) {
          clearInterval(videoCheckRef.current);
          videoCheckRef.current = null;
        }
      };
    } else if (videoCheckRef.current) {
      clearInterval(videoCheckRef.current);
      videoCheckRef.current = null;
    }

    return () => {
      if (videoCheckRef.current) {
        clearInterval(videoCheckRef.current);
        videoCheckRef.current = null;
      }
    };
  }, [
    isLiveMode,
    videoCompleted,
    webinarStartTime,
    currentTime,
    webinar,
    markVideoCompleted,
  ]);

  // Helper: Calculate session elapsed time (running timer)
  function calculateSessionElapsed(startTime: Date | null): string {
    if (!startTime || !currentTime) return '';

    const timeSinceStart = currentTime.getTime() - startTime.getTime();

    if (timeSinceStart <= 0) return 'Starting now';

    const hours = Math.floor(timeSinceStart / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeSinceStart % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeSinceStart % (1000 * 60)) / 1000);

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
    startTime: Date | null,
    now: Date
  ): string {
    if (!startTime) return '';

    const timeSinceStart = now.getTime() - startTime.getTime();

    if (timeSinceStart <= 0) return 'Starting now';

    const hours = Math.floor(timeSinceStart / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeSinceStart % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeSinceStart % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Helper: Check if webinar should be in live mode
  function shouldBeInLiveMode(): boolean {
    if (!webinarStartTime || !currentTime || !webinar) {
      return false;
    }

    const now = currentTime;
    const timeSinceStart = differenceInSeconds(now, webinarStartTime);
    const expectedDuration =
      (webinar.durationHours * 60 + webinar.durationMinutes) * 60;

    // Check if webinar has started and duration hasn't exceeded
    const hasStarted = isAfter(now, webinarStartTime);
    const durationNotExceeded = timeSinceStart < expectedDuration;

    console.log('shouldBeInLiveMode check:', {
      hasStarted,
      durationNotExceeded,
      timeSinceStart,
      expectedDuration,
      shouldBeLive: hasStarted && durationNotExceeded,
    });

    return hasStarted && durationNotExceeded;
  }

  // Helper: Get video start time for live mode
  function getVideoStartTime(): number {
    if (!webinarStartTime || !currentTime) return 0;

    const timeSinceStart = differenceInSeconds(currentTime, webinarStartTime);

    // If user comes after start time, start video from the appropriate time
    if (timeSinceStart > 0) {
      return timeSinceStart;
    }

    return 0; // Start from beginning if before start time
  }

  // Helper: Format time to 12-hour format (e.g., "9:00 PM")
  function formatTimeTo12Hour(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  // Fullscreen handler
  const handleFullscreen = () => {
    setIsFullscreen(true);
    // Try to request fullscreen for the player container
    const playerContainer = document.getElementById('video-player-container');
    if (playerContainer && playerContainer.requestFullscreen) {
      playerContainer.requestFullscreen();
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

  // Real-time mode checking - runs every second to ensure immediate mode switching
  useEffect(() => {
    if (webinar && webinarStartTime && currentTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeSinceStart = differenceInSeconds(now, webinarStartTime);
        const expectedDuration =
          (webinar.durationHours * 60 + webinar.durationMinutes) * 60;

        // If we're in live mode but duration has exceeded, switch to playback immediately
        if (isLiveMode && timeSinceStart >= expectedDuration) {
          console.log(
            'Real-time check: Duration exceeded, switching to playback mode'
          );
          markVideoCompleted();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [webinar, webinarStartTime, currentTime, isLiveMode, markVideoCompleted]);

  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`webinarNotes_${id}`);
    if (savedNotes) {
      setSessionNotes(savedNotes);
    }
  }, [id]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (sessionNotes.trim()) {
      localStorage.setItem(`webinarNotes_${id}`, sessionNotes);
    }
  }, [sessionNotes, id]);

  // Function to download notes as a text file
  const downloadNotes = () => {
    if (!sessionNotes.trim()) return;

    const blob = new Blob([sessionNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webinar-notes-${webinar?.webinarTitle || 'session'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to clear notes
  const clearNotes = () => {
    setSessionNotes('');
    localStorage.removeItem(`webinarNotes_${id}`);
  };

  // Helper for YouTube/Vimeo embed
  function getEmbedUrl(url: string, isLive: boolean, startTime: number = 0) {
    console.log('getEmbedUrl called with:', { url, isLive, startTime });

    // Handle pCloud links
    if (url.includes('pcloud.link')) {
      console.log('Detected pCloud link, returning as-is');
      return url; // pCloud links are already in the correct format for embedding
    }

    // Handle YouTube links
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/
    );
    if (ytMatch) {
      console.log('Detected YouTube link, video ID:', ytMatch[1]);
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const baseParams = isLive
        ? 'autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&fs=0&iv_load_policy=3&playsinline=1&cc_load_policy=0&enablejsapi=1&autohide=2&wmode=transparent&origin=' +
          (origin || '')
        : 'autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&playsinline=1&origin=' +
          (origin || '');

      const startTimeParam = startTime > 0 ? `&start=${startTime}` : '';
      const finalUrl = `https://www.youtube.com/embed/${ytMatch[1]}?${baseParams}${startTimeParam}`;
      console.log('Generated YouTube embed URL:', finalUrl);
      return finalUrl;
    }

    // Handle Vimeo links
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      console.log('Detected Vimeo link, video ID:', vimeoMatch[1]);
      const baseParams = isLive
        ? 'autoplay=1&controls=0'
        : 'controls=1&autoplay=0';
      const startTimeParam = startTime > 0 ? `#t=${startTime}s` : '';
      const finalUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?${baseParams}${startTimeParam}`;
      console.log('Generated Vimeo embed URL:', finalUrl);
      return finalUrl;
    }

    console.log('No recognized video platform, returning URL as-is:', url);
    return url;
  }

  // Countdown Timer Component for upcoming webinars
  function WebinarCountdownTimer({ startTime }: { startTime: Date }) {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    const hasRefreshed = useRef(false);

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date();
        const difference = startTime.getTime() - now.getTime();

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
    }, [startTime]);

    return (
      <div className="mt-4 w-full">
        <div className="text-center">
          <div className="mb-2 text-xs font-bold text-blue-900">
            WEBINAR STARTS IN
          </div>
          <div className="flex justify-center gap-2">
            {timeLeft.days > 0 && (
              <div className="flex flex-col items-center">
                <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                  {timeLeft.days}
                </div>
                <span className="mt-1 text-xs font-medium text-blue-900">
                  DAYS
                </span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <span className="mt-1 text-xs font-medium text-blue-900">
                HOURS
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <span className="mt-1 text-xs font-medium text-blue-900">
                  MINUTES
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <span className="mt-1 text-xs font-medium text-blue-900">
                SECONDS
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading webinar...
          </p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          className="flex w-full max-w-md flex-col items-center rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Play className="mb-4 size-10 text-red-500 dark:text-red-400" />
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
            Webinar Not Found
          </h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            The webinar you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow transition hover:shadow-lg"
            onClick={() => router.push('/dashboard-free')}
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  // Don't render the main UI until we have the current time to avoid hydration issues
  if (!currentTime) {
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

  // --- UI ---
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        {/* Notes Toggle Button - Mobile Only */}
        <motion.div
          className="lg:hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Button
            onClick={() => {
              const notesSection = document.getElementById('notes-section');
              if (notesSection) {
                notesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex size-14 items-center justify-center rounded-full bg-blue-500 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:shadow-xl"
            title="Go to Notes"
          >
            <BookOpen className="size-7 text-white" />
          </Button>
        </motion.div>

        {/* WhatsApp Button */}
        <motion.div
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
      </div>

      {/* Header with back button and webinar info */}
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
                  className="rounded-full bg-gradient-to-r from-red-500 to-yellow-500 p-3 font-semibold text-white shadow-lg transition-all hover:from-red-600 hover:to-yellow-600 hover:shadow-xl"
                  onClick={() => router.push('/dashboard-free')}
                >
                  <ArrowLeft className="size-6" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="sm:hidden"
              >
                <Button
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-yellow-600 hover:to-red-600 hover:shadow-xl"
                  onClick={() => router.push('/users/ebook199')}
                >
                  <BookOpen className="size-6" />
                  <span className="text-sm">E-Books</span>
                </Button>
              </motion.div>
            </div>

            {/* Webinar Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2"
              >
                <h1 className="text-lg font-bold text-gray-800 sm:text-xl dark:text-white">
                  {webinar.webinarTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    <span>
                      {format(parseISO(webinar.webinarDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-4" />
                    <span>{webinar.webinarTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="size-4" />
                    <span>
                      {webinar.webinarSettings?.attendees || 0} attendees
                    </span>
                  </div>
                  {webinar.selectedLanguage && (
                    <div className="flex items-center gap-1">
                      <Globe className="size-4" />
                      <span>
                        {webinar.selectedLanguage === 'en'
                          ? 'English'
                          : webinar.selectedLanguage === 'hi'
                            ? 'Hindi'
                            : webinar.selectedLanguage}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="size-4" />
                    <span>
                      {webinar.durationHours}h {webinar.durationMinutes}m
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden sm:block"
            >
              <Button
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-yellow-600 hover:to-red-600 hover:shadow-xl"
                onClick={() => router.push('/users/ebook199')}
              >
                <BookOpen className="size-6" />
                <span className="text-sm">E-Books</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex w-full flex-col p-2 sm:p-4 lg:w-8/12">
          <div
            id="video-player-container"
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-xl"
            style={{ minHeight: '400px' }}
          >
            {webinar.video?.url || webinar.youtubeLink ? (
              (() => {
                // --- ACCESS CHECK LOGIC ---
                // Note: Access control logic removed as it was not being used

                // --- VIDEO PLAYER CODE WITH LIVE MODE LOGIC ---
                const videoStatus = videoProgress[webinar.id];
                const isCompleted = videoStatus?.completed || false;
                const isLiveMode = shouldBeInLiveMode();
                const videoStartTime = getVideoStartTime();

                // Use youtubeLink if available, otherwise fall back to video.url
                const videoUrl = webinar.youtubeLink || webinar.video?.url;

                // Debug logging
                console.log('Video URL resolution:', {
                  youtubeLink: webinar.youtubeLink,
                  videoUrl: webinar.video?.url,
                  finalVideoUrl: videoUrl,
                  hasYoutubeLink: !!webinar.youtubeLink,
                  hasVideoUrl: !!webinar.video?.url,
                  webinarId: webinar.id,
                  webinarTitle: webinar.webinarTitle,
                });

                // Early return if no video URL
                if (!videoUrl) {
                  console.log('No video URL found, showing fallback UI');
                  return (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-300 sm:p-8">
                      <Play className="mb-4 size-12 text-gray-400 sm:size-16" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                        No Video Available
                      </h3>
                      <p className="max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-300">
                        This webinar doesn&apos;t have an associated video or
                        YouTube link yet.
                      </p>
                    </div>
                  );
                }

                console.log('Video player state:', {
                  webinarId: webinar.id,
                  isCompleted,
                  isLiveMode,
                  videoStartTime,
                  webinarStartTime: webinarStartTime?.toISOString(),
                  videoUrl: videoUrl || 'No video URL',
                  youtubeLink: webinar.youtubeLink,
                  videoUrlFallback: webinar.video?.url,
                  embedUrl: getEmbedUrl(
                    videoUrl || '',
                    isLiveMode,
                    videoStartTime
                  ),
                });

                return (
                  <div className="flex h-full flex-col">
                    {/* Overlay: LIVE badge - only show in live mode */}
                    {isLiveMode && (
                      <div className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4">
                        <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs text-white shadow">
                          LIVE
                        </span>
                      </div>
                    )}

                    {/* Video Iframe - Only show when webinar has started */}
                    {webinarStartTime &&
                    currentTime &&
                    isAfter(currentTime, webinarStartTime) ? (
                      <iframe
                        ref={playerRef}
                        src={getEmbedUrl(
                          videoUrl || '',
                          isLiveMode,
                          videoStartTime
                        )}
                        title={webinar.video?.title || webinar.webinarTitle}
                        className="absolute left-0 top-0 size-full"
                        allow="autoplay; encrypted-media; fullscreen; clipboard-write"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                        style={{
                          pointerEvents: isLiveMode ? 'none' : 'auto',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'black',
                        }}
                        onLoad={() => {
                          console.log('Video iframe loaded successfully');
                          console.log(
                            'Iframe src:',
                            getEmbedUrl(
                              videoUrl || '',
                              isLiveMode,
                              videoStartTime
                            )
                          );
                          console.log('Iframe dimensions:', {
                            width: playerRef.current?.offsetWidth,
                            height: playerRef.current?.offsetHeight,
                            containerWidth: document.getElementById(
                              'video-player-container'
                            )?.offsetWidth,
                            containerHeight: document.getElementById(
                              'video-player-container'
                            )?.offsetHeight,
                          });

                          // Check if we should still be in live mode after iframe loads
                          if (webinarStartTime && currentTime && webinar) {
                            const timeSinceStart = differenceInSeconds(
                              currentTime,
                              webinarStartTime
                            );
                            const expectedDuration =
                              (webinar.durationHours * 60 +
                                webinar.durationMinutes) *
                              60;

                            if (
                              timeSinceStart >= expectedDuration &&
                              isLiveMode
                            ) {
                              console.log(
                                'Iframe loaded but webinar duration exceeded - switching to playback mode'
                              );
                              markVideoCompleted();
                            } else if (isLiveMode) {
                              console.log(
                                'Attempting to force autoplay for live mode'
                              );
                              // Try to trigger autoplay by sending a message to the iframe
                              try {
                                const iframe = playerRef.current;
                                if (iframe && iframe.contentWindow) {
                                  iframe.contentWindow.postMessage(
                                    '{"event":"command","func":"playVideo","args":""}',
                                    '*'
                                  );
                                }
                              } catch (e) {
                                console.log('Could not force autoplay:', e);
                              }
                            }
                          }
                        }}
                        onError={(e) => console.error('Video iframe error:', e)}
                      />
                    ) : (
                      // Placeholder when webinar hasn't started yet
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                        <div className="text-center">
                          <Clock className="mx-auto mb-4 size-16 text-blue-400" />
                          <h3 className="mb-2 text-xl font-semibold">
                            Webinar Coming Soon
                          </h3>
                          <p className="mb-4 text-sm opacity-90">
                            Starts at{' '}
                            {webinarStartTime
                              ? formatTimeTo12Hour(webinarStartTime)
                              : 'TBD'}
                          </p>
                          {webinarStartTime && currentTime && (
                            <WebinarCountdownTimer
                              startTime={webinarStartTime}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fallback message if video doesn't load */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-900 text-white opacity-0 transition-opacity duration-300 hover:opacity-100">
                      <div className="text-center">
                        <Play className="mx-auto mb-2 size-8" />
                        <p className="text-sm">Click to play video</p>
                      </div>
                    </div>

                    {/* Overlay layer to block all controls/interactions in live mode */}
                    {isLiveMode && (
                      <div className="z-15 pointer-events-none absolute inset-0 bg-transparent" />
                    )}

                    {/* Bottom overlays: live mode */}
                    {isLiveMode && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                          <div className="pointer-events-auto inline-block animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs text-white">
                            🎥 LIVE SESSION: {sessionElapsed}
                          </div>
                        </div>
                        {!isFullscreen && (
                          <button
                            onClick={handleFullscreen}
                            className="pointer-events-auto rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                            title="Fullscreen"
                            style={{
                              minWidth: 40,
                              minHeight: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Maximize2 className="size-5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Bottom overlays: completed mode - only show when completed and not in live mode */}
                    {!isLiveMode && isCompleted && !shouldBeInLiveMode() && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex items-center justify-between px-6">
                        <div className="pointer-events-auto inline-block rounded-full bg-blue-600 px-3 py-1 text-xs text-white">
                          ✅ COMPLETED: Full playback available
                        </div>
                        {!isFullscreen && (
                          <button
                            onClick={handleFullscreen}
                            className="pointer-events-auto rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                            title="Fullscreen"
                            style={{
                              minWidth: 40,
                              minHeight: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Maximize2 className="size-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-300 sm:p-8">
                <Play className="mb-4 size-12 text-gray-400 sm:size-16" />
                <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                  No Video Available
                </h3>
                <p className="max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-300">
                  This webinar doesn&apos;t have an associated video or YouTube
                  link yet.
                </p>

                {/* Test Video Player for Development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-6 w-full max-w-md">
                    <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      🧪 Test Video Player (Development Only)
                    </h4>
                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          const testUrl =
                            'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                          console.log('Testing with URL:', testUrl);
                          const embedUrl = getEmbedUrl(testUrl, false, 0);
                          console.log('Generated embed URL:', embedUrl);

                          // Create a test iframe
                          const testIframe = document.createElement('iframe');
                          testIframe.src = embedUrl;
                          testIframe.className = 'w-full h-48 rounded border';
                          testIframe.allow =
                            'autoplay; encrypted-media; fullscreen';
                          testIframe.allowFullscreen = true;

                          // Replace the content
                          const container = document.getElementById(
                            'video-player-container'
                          );
                          if (container) {
                            container.innerHTML = '';
                            container.appendChild(testIframe);
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Test YouTube Video Player (Autoplay)
                      </Button>

                      <Button
                        onClick={() => {
                          const testUrl =
                            'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                          console.log('Testing LIVE mode with URL:', testUrl);
                          const embedUrl = getEmbedUrl(testUrl, true, 0);
                          console.log('Generated LIVE embed URL:', embedUrl);

                          // Create a test iframe
                          const testIframe = document.createElement('iframe');
                          testIframe.src = embedUrl;
                          testIframe.className = 'w-full h-48 rounded border';
                          testIframe.allow =
                            'autoplay; encrypted-media; fullscreen';
                          testIframe.allowFullscreen = true;

                          // Replace the content
                          const container = document.getElementById(
                            'video-player-container'
                          );
                          if (container) {
                            container.innerHTML = '';
                            container.appendChild(testIframe);
                          }
                        }}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        Test LIVE Mode Video Player (Autoplay)
                      </Button>

                      <Button
                        onClick={() => {
                          console.log('Current webinar data:', webinar);
                          console.log('YouTube link:', webinar.youtubeLink);
                          console.log('Video object:', webinar.video);
                          console.log('Video URL:', webinar.video?.url);
                        }}
                        className="w-full bg-gray-600 hover:bg-gray-700"
                      >
                        Debug Webinar Data
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar with quick notes */}
        <div className="flex w-full flex-col gap-4 p-2 sm:p-4 lg:w-4/12">
          {/* Quick Notes Card - Moved to right sidebar */}
          <motion.div
            id="notes-section"
            className="flex w-full flex-col rounded-xl bg-white shadow-lg dark:bg-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-t-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-5 text-white" />
                  <div>
                    <h2 className="text-base font-bold">📝 Quick Notes</h2>
                    <p className="text-xs text-blue-100">
                      Write while watching
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={downloadNotes}
                    size="sm"
                    className="h-7 border-0 bg-white/20 px-2 text-xs text-white hover:bg-white/30"
                    disabled={!sessionNotes.trim()}
                  >
                    📥
                  </Button>
                  <Button
                    onClick={clearNotes}
                    size="sm"
                    className="h-7 border-0 bg-white/20 px-2 text-xs text-white hover:bg-white/30"
                    disabled={!sessionNotes.trim()}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3">
              <textarea
                placeholder="✍️ Write your notes here...&#10;💡 Key points, timestamps, questions..."
                className="max-h-[300px] min-h-[200px] w-full resize-y rounded-lg border border-gray-300 p-3 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                style={{ fontFamily: 'monospace' }}
              />

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>💾 Auto-saved</span>
                <span>{sessionNotes.length} chars</span>
              </div>
            </div>
          </motion.div>

          {/* Session Progress Card - Moved to right sidebar */}
          <motion.div
            className="flex w-full flex-col rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-4 text-center text-base font-bold text-gray-800 dark:text-white">
              📊 Session Status
            </h2>

            {/* Status Badge */}
            <div className="mb-4 flex justify-center">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isLiveMode
                    ? 'animate-pulse bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                    : videoCompleted
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                }`}
              >
                {isLiveMode
                  ? '🔴 LIVE NOW'
                  : videoCompleted
                    ? '✅ COMPLETED'
                    : '⏰ UPCOMING'}
              </span>
            </div>

            {/* Time Progress Bar for Live Sessions */}
            {isLiveMode && webinarStartTime && currentTime && (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {sessionElapsed}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(
                        ((currentTime.getTime() - webinarStartTime.getTime()) /
                          ((webinar.durationHours * 60 +
                            webinar.durationMinutes) *
                            60 *
                            1000)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Live Session Info */}
            {isLiveMode && webinarStartTime && currentTime && (
              <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-3 dark:border-red-800 dark:from-red-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <Play className="size-4 animate-pulse text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-red-800 dark:text-red-200">
                      Live Session
                    </div>
                    <div className="text-sm font-bold text-red-900 dark:text-red-100">
                      {sessionElapsed} elapsed
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Info */}
            {videoCompleted && !isLiveMode && (
              <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Play className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Complete
                    </div>
                    <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                      Full playback available
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
