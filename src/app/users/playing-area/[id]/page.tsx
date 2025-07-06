'use client';
import { useEffect, useRef, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Globe,
  Loader2,
  Maximize,
  MessageSquare,
  Pause,
  Play,
  Settings,
  Share2,
  SkipBack,
  SkipForward,
  ThumbsUp,
  Users,
  Video,
  VideoIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Webinar } from '@/types/user';

// Add this helper function at the top level
const isLiveMeeting = (url: string) => {
  return url.includes('meet.google.com') || url.includes('zoom.us');
};

// Define YouTube Player types
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getDuration: () => number;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: number;
}

// TypeScript global declaration for YouTube API callback
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: unknown
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
      };
    };
  }
}

// Custom Video Player Component
const CustomVideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add new state for live meeting
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    setIsLive(isLiveMeeting(videoUrl));
  }, [videoUrl]);

  // Load YouTube API
  useEffect(() => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        const videoId = videoUrl.includes('youtube.com/watch')
          ? new URL(videoUrl).searchParams.get('v')
          : videoUrl.split('/').pop();

        if (playerRef.current) {
          new window.YT.Player(playerRef.current, {
            videoId,
            playerVars: {
              controls: 0,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              fs: 0,
              iv_load_policy: 3,
              playsinline: 1,
              cc_load_policy: 0,
              widget_referrer: window.location.href,
              origin: window.location.origin,
              enablejsapi: 1,
              autohide: 2,
              wmode: 'transparent',
            },
            events: {
              onReady: (event: YouTubePlayerEvent) => {
                setPlayer(event.target);
                setDuration(event.target.getDuration());
                setIsLoading(false);
              },
              onStateChange: (event: YouTubePlayerEvent) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
            },
          });
        }
      };
    }
  }, [videoUrl]);

  // Handle controls visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Video controls
  const togglePlay = () => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      if (player) {
        if (isPlaying) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      if (player) {
        if (isMuted) {
          player.unMute();
          setVolume(1);
        } else {
          player.mute();
          setVolume(0);
        }
      }
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      if (player) {
        player.setVolume(newVolume * 100);
        if (newVolume === 0) {
          player.mute();
          setIsMuted(true);
        } else if (isMuted) {
          player.unMute();
          setIsMuted(false);
        }
      }
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      if (player) {
        player.seekTo(time, true);
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    const newTime = currentTime + seconds;
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      if (player) {
        player.seekTo(newTime, true);
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((error: Error) => {
          console.error('Error attempting to enable fullscreen:', error);
        });
      } else {
        document.exitFullscreen().catch((error: Error) => {
          console.error('Error attempting to exit fullscreen:', error);
        });
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video overflow-hidden rounded-lg bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {isLive ? (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900 p-6 text-center text-white">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-blue-500/20">
            <VideoIcon className="size-10 text-blue-400" />
          </div>
          <h2 className="mb-4 text-2xl font-bold">Live Meeting</h2>
          <p className="mb-8 max-w-md text-gray-300">
            {videoUrl.includes('meet.google.com')
              ? 'This is a Google Meet session. Click the button below to join the meeting.'
              : 'This is a Zoom session. Click the button below to join the meeting.'}
          </p>
          <motion.a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-all hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VideoIcon className="size-5" />
            Join Now
          </motion.a>
        </div>
      ) : (
        <>
          {/* Video Container */}
          <div ref={playerRef} className="size-full">
            {!(
              videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
            ) && (
              <video
                ref={videoRef}
                className="size-full"
                src={videoUrl}
                onTimeUpdate={() =>
                  setCurrentTime(videoRef.current?.currentTime || 0)
                }
                onDurationChange={() =>
                  setDuration(videoRef.current?.duration || 0)
                }
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedData={() => setIsLoading(false)}
                playsInline
              />
            )}
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="size-12 animate-spin text-white" />
            </div>
          )}

          {/* Custom Controls */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-2">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-600"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Skip Back */}
                <button
                  onClick={() => handleSkip(-10)}
                  className="text-white hover:text-blue-400"
                >
                  <SkipBack className="size-5" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400"
                >
                  {isPlaying ? (
                    <Pause className="size-6" />
                  ) : (
                    <Play className="size-6" />
                  )}
                </button>

                {/* Skip Forward */}
                <button
                  onClick={() => handleSkip(10)}
                  className="text-white hover:text-blue-400"
                >
                  <SkipForward className="size-5" />
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400"
                  >
                    {isMuted ? (
                      <VolumeX className="size-5" />
                    ) : (
                      <Volume2 className="size-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-gray-600"
                  />
                </div>

                {/* Time Display */}
                <div className="text-sm text-white">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Settings */}
                <button className="text-white hover:text-blue-400">
                  <Settings className="size-5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400"
                >
                  <Maximize className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function WebinarViewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  // State hooks
  const [webinars, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'resources' | 'chat'>(
    'video'
  );
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isWebinarStarted, setIsWebinarStarted] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  const safeTimeSplit = (timeString?: string) => {
    if (!timeString) return { hours: '00', minutes: '00' };

    // Handle numeric time formats (e.g., 1430 -> "14:30")
    const sanitized = String(timeString).padStart(4, '0');
    const hasColon = sanitized.includes(':');

    return {
      hours: hasColon ? sanitized.split(':')[0] : sanitized.slice(0, 2),
      minutes: hasColon ? sanitized.split(':')[1] : sanitized.slice(2, 4),
    };
  };

  // Effect hooks
  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const response = await fetch(`/api/webinar/${id}`);
        if (!response.ok) throw new Error('Failed to fetch webinar');
        const data = await response.json();
        setWebinar(data.webinar);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load webinar');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWebinar();
  }, [id]);

  useEffect(() => {
    // Set initial time on client side to avoid hydration issues
    setCurrentTime(new Date());

    const timeCheckInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeCheckInterval);
  }, []);

  useEffect(() => {
    if (!webinars || !currentTime) return;

    const { hours, minutes } = safeTimeSplit(webinars.webinarTime);
    const webinarStartDate = parseISO(webinars.webinarDate);
    const webinarStartTime = new Date(
      webinarStartDate.getFullYear(),
      webinarStartDate.getMonth(),
      webinarStartDate.getDate(),
      parseInt(hours),
      parseInt(minutes)
    );

    const timeDifference = webinarStartTime.getTime() - currentTime.getTime();
    const isBeforeWebinar = timeDifference > 0;

    if (!isBeforeWebinar && !isWebinarStarted) {
      setIsWebinarStarted(true);
    }
  }, [currentTime, webinars, isWebinarStarted]);

  const handleNoteSave = () => {
    // Implement note saving logic
    console.log('Notes Saved:', notes);
    // Show a success message
    const noteElement = document.getElementById('notes-textarea');
    if (noteElement) {
      noteElement.classList.add('border-green-500');
      setTimeout(() => {
        noteElement.classList.remove('border-green-500');
      }, 2000);
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  // Lock screen logic
  const webinarStartDate = parseISO(webinars?.webinarDate || '');
  const { hours, minutes } = safeTimeSplit(webinars?.webinarTime);
  const webinarStartTime = new Date(
    webinarStartDate.getFullYear(),
    webinarStartDate.getMonth(),
    webinarStartDate.getDate(),
    parseInt(hours),
    parseInt(minutes)
  );
  const timeDifference = currentTime
    ? webinarStartTime.getTime() - currentTime.getTime()
    : 0;
  const isBeforeWebinar = timeDifference > 0;

  // Add null checks for video
  const videoUrl = webinars?.video?.url || '/fallback-video.mp4';

  // Conditional returns
  if (loading || !currentTime) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center"
        >
          <ClipLoader size={60} color="#3B82F6" />
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading webinar...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-red-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="rounded-lg bg-white p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-700">{error}</p>
          <Button
            onClick={() => router.push('/users/live-webinar')}
            className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!webinars) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="rounded-lg bg-white p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            Webinar Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            The webinar you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button
            onClick={() => router.push('/users/live-webinar')}
            className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isBeforeWebinar && !session?.user?.isAdmin) {
    const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesLeft = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900 text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <div className="flex size-20 items-center justify-center rounded-full bg-blue-500/20">
              <Clock className="size-10 text-blue-400" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-3xl font-bold"
          >
            Webinar Starts In
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-mono text-6xl font-bold text-blue-400"
          >
            {String(hoursLeft).padStart(2, '0')}:
            {String(minutesLeft).padStart(2, '0')}:
            {String(secondsLeft).padStart(2, '0')}
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-lg text-gray-300"
          >
            Please come back when the webinar starts
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Button
              onClick={() => router.push('/users/live-webinar')}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main content return
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl p-6">
        {/* Header Section */}
        <motion.div
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {webinars?.webinarName || 'Untitled Webinar'}
              </h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4 text-blue-500" />
                  <span>
                    {webinars?.webinarDate
                      ? format(parseISO(webinars.webinarDate), 'MMM dd, yyyy')
                      : 'Date not set'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4 text-blue-500" />
                  <span>
                    {webinars?.webinarTime
                      ? `${safeTimeSplit(webinars.webinarTime).hours}:${safeTimeSplit(webinars.webinarTime).minutes}`
                      : 'Time not set'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-4 text-blue-500" />
                  <span>
                    {`${webinars?.durationHours || 0}h 
                      ${webinars?.durationMinutes || 0}m 
                      ${webinars?.durationSeconds || 0}s`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="size-4 text-blue-500" />
                  <span>{webinars?.selectedLanguage || 'Not specified'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center gap-1 rounded-full px-4 py-2 ${
                  hasLiked
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <ThumbsUp className="size-4" />
                <span>{likes}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-gray-600"
              >
                <Share2 className="size-4" />
                <span>Share</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          className="mb-6 border-b border-gray-200"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex space-x-8">
            {(['video', 'resources', 'chat'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-1 py-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab === 'video' && <Video className="size-4" />}
                {tab === 'resources' && <FileText className="size-4" />}
                {tab === 'chat' && <MessageSquare className="size-4" />}
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Section - Always rendered but hidden when inactive */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: activeTab === 'video' ? 'block' : 'none' }}
          >
            <CustomVideoPlayer videoUrl={videoUrl} />
          </motion.div>

          {/* Notes Section - Always rendered but hidden when inactive */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: activeTab === 'video' ? 'block' : 'none' }}
          >
            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="size-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Session Notes</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-gray-500"
                >
                  {showNotes ? (
                    <ChevronUp className="size-5" />
                  ) : (
                    <ChevronDown className="size-5" />
                  )}
                </motion.button>
              </div>

              <AnimatePresence>
                {showNotes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <textarea
                        id="notes-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-48 w-full rounded-lg border border-gray-200 p-3 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Write your notes here..."
                      />
                      <motion.div
                        className="absolute bottom-2 right-2 text-xs text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {notes.length} characters
                      </motion.div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setNotes('')}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        Clear
                      </motion.button>

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (notes.trim() === '') return;

                            // Create a blob with the notes content
                            const blob = new Blob([notes], {
                              type: 'text/plain',
                            });
                            const url = URL.createObjectURL(blob);

                            // Create a temporary link element
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `webinar-notes-${new Date().toISOString().split('T')[0]}.txt`;

                            // Trigger the download
                            document.body.appendChild(a);
                            a.click();

                            // Clean up
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Export</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNoteSave}
                          className="flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1.5 text-white shadow-sm hover:from-blue-600 hover:to-blue-700"
                        >
                          <span>Save Notes</span>
                          <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            initial={{ x: 0 }}
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              repeat: Infinity,
                              repeatType: 'reverse',
                              duration: 1.5,
                              ease: 'easeInOut',
                            }}
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </motion.svg>
                        </motion.button>
                      </div>
                    </div>

                    <motion.div
                      className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-blue-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-3 text-blue-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p>
                          Your notes are saved locally in your browser. Use the
                          Export button to download your notes as a text file.
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Resources Section */}
          {activeTab === 'resources' && (
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-6 text-xl font-semibold">Resources</h2>
                {webinars.resources?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {webinars.resources.map((resource, index) => (
                      <motion.a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg border p-4 transition-all hover:border-blue-500 hover:bg-blue-50"
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-blue-100">
                          <FileText className="size-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {resource.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Click to download
                          </p>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <FileText className="mb-2 size-12 text-gray-400" />
                    <p className="text-gray-500">
                      No resources available for this webinar
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Chat Section */}
          {activeTab === 'chat' && (
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Live Chat</h2>
                  <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Coming Soon</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
                    <MessageSquare className="size-8 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    Live Chat Coming Soon
                  </h3>
                  <p className="mb-6 max-w-md text-gray-600">
                    We&apos;re working on bringing you a real-time chat
                    experience during webinars. Stay tuned for updates!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => setActiveTab('video')}
                  >
                    Return to Video
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Webinar Stats */}
        <motion.div
          className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="size-4 text-blue-500" />
              <span>Attendees</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {webinars?.webinarSettings?.attendees || 0}
            </div>
          </motion.div>

          <motion.div
            className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="size-4 text-blue-500" />
              <span>Registrants</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {webinars?.webinarSettings?.registrants || 0}
            </div>
          </motion.div>

          <motion.div
            className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video className="size-4 text-blue-500" />
              <span>Status</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {webinars?.webinarSettings?.status || 'Live'}
            </div>
          </motion.div>

          <motion.div
            className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="size-4 text-blue-500" />
              <span>Duration</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {`${webinars?.durationHours || 0}h ${webinars?.durationMinutes || 0}m`}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
