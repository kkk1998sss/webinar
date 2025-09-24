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
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const videoCheckRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Set current time on client side only to avoid hydration issues
  useEffect(() => {
    setCurrentTime(new Date());
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
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
    const videoUrl = webinar?.youtubeLink || webinar?.video?.url;
    if (videoUrl) {
      fetchVideoMetadata(videoUrl).then((metadata) => {
        if (metadata) {
          setVideoMetadata(metadata);
        }
      });
    }
  }, [webinar]);

  // Update session elapsed time every second when in live mode
  useEffect(() => {
    if (isLiveMode && webinarStartTime && currentTime) {
      setSessionElapsed(calculateSessionElapsed(webinarStartTime));

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

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
      const shouldBeLive = shouldBeInLiveMode();
      const shouldMarkCompleted = shouldMarkAsCompleted();

      if (shouldMarkCompleted && !isCompleted) {
        // Auto-mark as completed if enough time has passed
        setVideoProgress((prev) => ({
          ...prev,
          [webinar.id]: {
            completed: true,
            timestamp: currentTime.getTime(),
          },
        }));
        setVideoCompleted(true);
        setIsLiveMode(false);
      } else if (isCompleted) {
        // Webinar already completed, show in playback mode
        setIsLiveMode(false);
        setVideoCompleted(true);
      } else if (shouldBeLive) {
        // Webinar should be in live mode
        setIsLiveMode(true);
        setVideoCompleted(false);
      } else {
        // Webinar not started yet or duration exceeded
        setIsLiveMode(false);
        setVideoCompleted(false);
      }
    }
  }, [webinar, webinarStartTime, currentTime, videoProgress, videoMetadata]);

  // Handle video completion
  const markVideoCompleted = useCallback(() => {
    if (webinar && currentTime) {
      setVideoProgress((prev) => ({
        ...prev,
        [webinar.id]: {
          completed: true,
          timestamp: currentTime.getTime(),
        },
      }));
      setVideoCompleted(true);
      setIsLiveMode(false);
    }
  }, [webinar, currentTime]);

  // Listen for player state messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin === 'https://www.youtube.com' &&
        event.data &&
        event.data.info
      ) {
        const playerState = event.data.info.playerState;
        if (playerState === 0) {
          markVideoCompleted();
        }
      }

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
  }, [markVideoCompleted]);

  // Periodically check video status during live mode
  useEffect(() => {
    if (isLiveMode && !videoCompleted) {
      videoCheckRef.current = setInterval(() => {
        if (shouldMarkAsCompleted()) {
          markVideoCompleted();
        }
      }, 3000);

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
  }, [isLiveMode, videoCompleted, markVideoCompleted]);

  // Video event listeners for progress tracking
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && video.duration > 0) {
        setVideoDuration(video.duration);
        setVideoMetadata({
          duration: video.duration,
          title: video.title || 'Video',
        });
      }
    };

    const handleTimeUpdate = () => {
      setVideoCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setVideoCurrentTime(0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [webinar]);

  // Set video start time for live mode
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video || !webinar || !webinarStartTime || !currentTime) return;

    if (isLiveMode) {
      const videoStartTime = getVideoStartTime();
      if (videoStartTime > 0) {
        video.currentTime = videoStartTime;
      }
    }
  }, [webinar, webinarStartTime, currentTime, isLiveMode]);

  // Helper: Check if webinar should be in live mode
  function shouldBeInLiveMode(): boolean {
    if (!webinarStartTime || !currentTime || !webinar) {
      return false;
    }

    const videoStatus = videoProgress[webinar.id];
    const isCompleted = videoStatus?.completed || false;

    if (isCompleted) {
      return false;
    }

    const now = currentTime;
    const timeSinceStart = differenceInSeconds(now, webinarStartTime);
    const expectedDuration =
      videoMetadata?.duration ||
      (webinar.durationHours * 60 + webinar.durationMinutes) * 60;

    const hasStarted = isAfter(now, webinarStartTime);
    const durationNotExceeded = timeSinceStart < expectedDuration;

    return hasStarted && durationNotExceeded;
  }

  // Helper: Check if video should be marked as completed
  function shouldMarkAsCompleted(): boolean {
    if (!webinarStartTime || !currentTime || !webinar) return false;

    const now = currentTime;
    const timeSinceStart = differenceInSeconds(now, webinarStartTime);
    const expectedDuration =
      videoMetadata?.duration ||
      (webinar.durationHours * 60 + webinar.durationMinutes) * 60;

    return timeSinceStart >= expectedDuration;
  }

  // Helper: Get video start time for live mode
  function getVideoStartTime(): number {
    if (!webinarStartTime || !currentTime) return 0;

    const timeSinceStart = differenceInSeconds(currentTime, webinarStartTime);
    return timeSinceStart > 0 ? timeSinceStart : 0;
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
        return { duration: data.duration, title: data.title };
      }

      return null;
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return null;
    }
  }

  // Helper: Calculate session elapsed time
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

  // Helper: Calculate session elapsed time with specific time
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

  // Fullscreen handler
  const handleFullscreen = () => {
    setIsFullscreen(true);
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

  // Helper: Format seconds to MM:SS format
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            setTimeout(() => window.location.reload(), 500);
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
              <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <span className="mt-1 text-xs font-medium text-blue-900">
                MINUTES
              </span>
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
                <div className="flex gap-2">
                  <Button
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-yellow-600 hover:to-red-600 hover:shadow-xl"
                    onClick={() => router.push('/users/ebook199')}
                  >
                    <BookOpen className="size-6" />
                    <span className="text-sm">E-Books</span>
                  </Button>
                </div>
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
            className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-xl ${
              isFullscreen
                ? 'fixed inset-0 z-[9999] aspect-auto h-screen w-screen rounded-none bg-black'
                : ''
            }`}
          >
            {webinar.video?.url || webinar.youtubeLink ? (
              (() => {
                const videoStatus = videoProgress[webinar.id];
                const isCompleted = videoStatus?.completed || false;
                const isLiveMode = shouldBeInLiveMode();
                // const videoStartTime = getVideoStartTime();
                const videoUrl = webinar.youtubeLink || webinar.video?.url;

                // Check if webinar has started
                const hasStarted =
                  webinarStartTime &&
                  currentTime &&
                  isAfter(currentTime, webinarStartTime);

                if (!hasStarted) {
                  // Show countdown timer
                  return (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-300 sm:p-8">
                      <Clock className="mb-4 size-12 text-gray-400 sm:size-16" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                        Webinar Not Started Yet
                      </h3>
                      <p className="max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-300">
                        This webinar will start at {webinar.webinarTime} on{' '}
                        {format(parseISO(webinar.webinarDate), 'MMM dd, yyyy')}
                      </p>
                      {webinarStartTime && (
                        <WebinarCountdownTimer startTime={webinarStartTime} />
                      )}
                    </div>
                  );
                }

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

                    {/* Video Player - Simple like FourDayPlan with Download Prevention */}
                    <video
                      ref={videoPlayerRef}
                      src={videoUrl}
                      title={webinar.video?.title || webinar.webinarTitle}
                      className={`absolute left-0 top-0 size-full ${isFullscreen ? 'z-10' : ''}`}
                      controls={false}
                      autoPlay={isLiveMode}
                      muted={false}
                      playsInline
                      preload="metadata"
                      onContextMenu={(e) => e.preventDefault()}
                      onError={(e) => {
                        console.error('Video loading error:', e);
                        console.error('Video src:', videoUrl);
                      }}
                      onLoadStart={() => console.log('Video loading started')}
                      onCanPlay={() => console.log('Video can play')}
                      onLoadedData={() => console.log('Video data loaded')}
                      onClick={() => {
                        // Custom click-to-play/pause functionality
                        if (!isLiveMode) {
                          const video = videoPlayerRef.current;
                          if (video) {
                            if (video.paused) {
                              video.play().catch(console.error);
                            } else {
                              video.pause();
                            }
                          }
                        }
                      }}
                      style={{
                        pointerEvents: isLiveMode ? 'none' : 'auto',
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                        cursor: isLiveMode ? 'default' : 'pointer',
                        outline: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                      }}
                    />

                    {/* Custom Play/Pause Button - Only in playback mode (not live mode) and when paused */}
                    {!isLiveMode && !isPlaying && (
                      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const video = videoPlayerRef.current;
                            if (video) {
                              video.play().catch(console.error);
                            }
                          }}
                          className="flex size-16 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:scale-110 hover:bg-black/80"
                          style={{
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <Play className="size-8" />
                        </button>
                      </div>
                    )}

                    {/* Custom Progress Bar - Only in playback mode (not live mode) */}
                    {!isLiveMode && videoDuration > 0 && (
                      <div className="absolute inset-x-4 bottom-4 z-20">
                        <div className="flex items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm">
                          {/* Play/Pause Button - Left Side */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const video = videoPlayerRef.current;
                              if (video) {
                                if (video.paused) {
                                  video.play().catch(console.error);
                                } else {
                                  video.pause();
                                }
                              }
                            }}
                            className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30"
                          >
                            {isPlaying ? (
                              <div className="flex gap-0.5">
                                <div className="h-3 w-1 bg-white"></div>
                                <div className="h-3 w-1 bg-white"></div>
                              </div>
                            ) : (
                              <Play className="ml-0.5 size-4" />
                            )}
                          </button>

                          {/* Time Display */}
                          <div className="font-mono text-xs text-white">
                            {formatTime(videoCurrentTime)} /{' '}
                            {formatTime(videoDuration)}
                          </div>

                          {/* Progress Bar */}
                          <div className="relative flex-1">
                            <input
                              type="range"
                              min="0"
                              max={videoDuration}
                              value={videoCurrentTime}
                              onChange={(e) => {
                                const video = videoPlayerRef.current;
                                if (video) {
                                  video.currentTime = parseFloat(
                                    e.target.value
                                  );
                                }
                              }}
                              className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600"
                              style={{
                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${(videoCurrentTime / videoDuration) * 100}%, #4b5563 ${(videoCurrentTime / videoDuration) * 100}%, #4b5563 100%)`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exit Fullscreen Button - Always visible when in fullscreen */}
                    {isFullscreen && (
                      <div className="absolute right-4 top-4 z-30">
                        <button
                          onClick={() => {
                            setIsFullscreen(false);
                            if (document.fullscreenElement) {
                              document.exitFullscreen();
                            }
                          }}
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
                          <svg
                            className="size-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
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

                    {/* Bottom overlays: playback mode */}
                    {!isLiveMode && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-30 flex items-center justify-between px-6">
                        <div className="pointer-events-auto inline-block rounded-full bg-green-600 px-3 py-1 text-xs text-white">
                          {isCompleted
                            ? '✅ COMPLETED: Full playback available'
                            : '⏸️ WAITING: Webinar will start at scheduled time'}
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
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar with quick notes */}
        <div className="flex w-full flex-col gap-4 p-2 sm:p-4 lg:w-4/12">
          {/* Quick Notes Card */}
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

          {/* Session Progress Card */}
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
