'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';

// Import Vimeo types
import type { VimeoPlayer } from '@/types/vimeo';

interface VimeoSDKPlayerProps {
  videoId: string;
  videoName: string;
  className?: string;
}

// Vimeo Player SDK types are imported from vimeo.d.ts

export default function VimeoSDKPlayer({
  videoId,
  className = '',
}: VimeoSDKPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<VimeoPlayer | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);
  const seekingRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerReady, setPlayerReady] = useState(false);

  const initializePlayer = useCallback(() => {
    if (!window.Vimeo || !playerRef.current) return;

    try {
      const player = new window.Vimeo.Player(playerRef.current, {
        id: videoId,
        width: '100%',
        height: '100%',
        responsive: true,
        autoplay: false,
        controls: false, // We'll use custom controls
        keyboard: true,
        pip: true,
        quality: 'auto',
        background: false,
        dnt: false,
        speed: true,
        title: false,
        byline: false,
        portrait: false,
        color: '00adef',
        // Performance optimizations
        preload: 'metadata',
        playsinline: true,
        muted: false,
      });

      playerInstanceRef.current = player;

      // Player events - Optimized for performance
      player.on('ready', () => {
        setIsLoading(false);
        setError('');
      });

      player.on('loadstart', () => {
        setIsLoading(true);
      });

      player.on('loadedmetadata', () => {
        setIsLoading(false);
      });

      player.on('loadeddata', () => {
        setIsLoading(false);
      });

      player.on('playing', () => {
        setIsPlaying(true);
        setIsLoading(false);
      });

      player.on('play', () => {
        setIsPlaying(true);
        setIsLoading(false);
      });

      player.on('pause', () => {
        setIsPlaying(false);
      });

      // Throttled time update for better performance
      player.on('timeupdate', (data: unknown) => {
        const timeData = data as { seconds: number };
        const now = Date.now();
        // Throttle updates to every 100ms for smoother performance
        if (now - lastTimeUpdateRef.current > 100 && !seekingRef.current) {
          if (timeData.seconds >= 0 && timeData.seconds <= duration) {
            setCurrentTime(timeData.seconds);
          }
          lastTimeUpdateRef.current = now;
        }

        // If we're getting time updates, player is ready
        if (isLoading) {
          setIsLoading(false);
        }
      });

      player.on('loaded', (data: unknown) => {
        const loadedData = data as { duration: number };
        if (loadedData.duration > 0) {
          setDuration(loadedData.duration);
        }
        setIsLoading(false);
      });

      player.on('durationchange', (data: unknown) => {
        const durationData = data as { duration: number };
        if (durationData.duration > 0) {
          setDuration(durationData.duration);
        }
      });

      player.on('volumechange', (data: unknown) => {
        const volumeData = data as { volume: number; muted: boolean };
        setVolume(volumeData.volume);
        setIsMuted(volumeData.muted);
      });

      player.on('progress', () => {
        // If we're getting progress updates, player is loading content
        if (isLoading) {
          setIsLoading(false);
        }
      });

      player.on('seeked', () => {
        seekingRef.current = false;
        setIsLoading(false);
      });

      player.on('seeking', () => {
        seekingRef.current = true;
        setIsLoading(true);
      });

      player.on('waiting', () => {
        setIsLoading(true);
      });

      player.on('bufferend', () => {
        setIsLoading(false);
      });

      player.on('error', (error: unknown) => {
        const errorData = error as Error;
        console.error('Vimeo player error:', errorData);
        setError('Failed to load video');
        setIsLoading(false);
      });

      // Additional safety: Set a timeout to hide loading if player seems ready
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 3000); // Reduced to 3 second timeout

      // Check if player is ready by trying to get current time
      const checkPlayerReady = () => {
        if (playerInstanceRef.current && isLoading) {
          playerInstanceRef.current
            .getCurrentTime()
            .then(() => {
              setIsLoading(false);
            })
            .catch(() => {
              // Player not ready yet, will retry
            });
        }
      };

      // Check after a short delay
      const readyCheckTimeout = setTimeout(checkPlayerReady, 1000);

      // Cleanup function
      return () => {
        clearTimeout(loadingTimeout);
        clearTimeout(readyCheckTimeout);
      };
    } catch (error) {
      console.error('Error initializing Vimeo player:', error);
      setError('Failed to initialize video player');
      setIsLoading(false);
    }
  }, [videoId, duration, isLoading]);

  // Load Vimeo Player SDK
  useEffect(() => {
    const loadVimeoSDK = () => {
      if (window.Vimeo) {
        setPlayerReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = () => {
        setPlayerReady(true);
      };
      script.onerror = () => {
        setError('Failed to load Vimeo Player SDK');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadVimeoSDK();
  }, []);

  // Initialize player when SDK is ready
  useEffect(() => {
    if (playerReady && playerRef.current && !playerInstanceRef.current) {
      const cleanup = initializePlayer();
      return cleanup;
    }
  }, [playerReady, videoId, initializePlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (playerInstanceRef.current) {
      if (isPlaying) {
        playerInstanceRef.current.pause();
      } else {
        playerInstanceRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (playerInstanceRef.current && progressRef.current && duration > 0) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width)); // Clamp between 0 and 1
        const newTime = percentage * duration;

        // Ensure newTime is within valid range
        if (newTime >= 0 && newTime <= duration) {
          seekingRef.current = true;
          try {
            // Update UI immediately for responsive feel
            setCurrentTime(newTime);
            // Then seek the actual video
            playerInstanceRef.current.setCurrentTime(newTime);
          } catch (error) {
            console.error('Error seeking video:', error);
          }
        }
      }
    },
    [duration]
  );

  const toggleMute = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.setMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (playerInstanceRef.current) {
      playerInstanceRef.current.setVolume(newVolume);
    }
  };

  const toggleFullscreen = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.requestFullscreen();
    }
  };

  const restart = () => {
    if (playerInstanceRef.current && duration > 0) {
      try {
        playerInstanceRef.current.setCurrentTime(0);
        setCurrentTime(0);
      } catch (error) {
        console.error('Error restarting video:', error);
      }
    }
  };

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const progressRef = useRef<HTMLDivElement>(null);

  // Memoized progress percentage for better performance
  const progressPercentage = useMemo(() => {
    if (duration > 0 && currentTime >= 0) {
      return Math.min(100, Math.max(0, (currentTime / duration) * 100));
    }
    return 0;
  }, [currentTime, duration]);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-black shadow-2xl ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Vimeo Player Container */}
      <div
        ref={playerRef}
        className="size-full"
        style={{ minHeight: '400px' }}
        onClick={() => {
          // Hide loading screen if user clicks on video
          if (isLoading) {
            setIsLoading(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (isLoading) {
              setIsLoading(false);
            }
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Video player"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <motion.div
              className="mx-auto mb-4 size-16 rounded-full border-4 border-white border-t-blue-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-lg font-medium text-white">Loading video...</p>
            <p className="mt-2 text-sm text-gray-300">
              Initializing Vimeo Player
            </p>
            <button
              onClick={() => setIsLoading(false)}
              className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600"
            >
              Skip Loading
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="p-6 text-center text-white">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500">
              <svg
                className="size-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="mb-2 text-xl font-semibold">Error Loading Video</p>
            <p className="mb-4 text-gray-300">{error}</p>
            <button
              onClick={() => {
                setError('');
                setIsLoading(true);
                initializePlayer();
              }}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            onClick={togglePlay}
            className="flex size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="ml-1 size-8 text-white" />
          </motion.button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="px-6 py-3">
          <div
            ref={progressRef}
            className="group/progress h-2 cursor-pointer rounded-full bg-gray-600/50 transition-all duration-200 hover:h-3"
            onClick={handleSeek}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSeek(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }}
            role="slider"
            tabIndex={0}
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          >
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-200"
              style={{
                width: `${progressPercentage}%`,
              }}
            >
              <div className="absolute right-0 top-1/2 size-4 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover/progress:opacity-100" />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center space-x-6">
            {/* Play/Pause */}
            <motion.button
              onClick={togglePlay}
              className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="size-6" />
              ) : (
                <Play className="size-6" />
              )}
            </motion.button>

            {/* Restart */}
            <motion.button
              onClick={restart}
              className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="size-5" />
            </motion.button>

            {/* Time Display */}
            <div className="rounded-full bg-black/30 px-3 py-1 font-mono text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={toggleMute}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? (
                  <VolumeX className="size-5" />
                ) : (
                  <Volume2 className="size-5" />
                )}
              </motion.button>
              <div className="w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600/50 transition-all hover:bg-gray-600/70"
                />
              </div>
            </div>

            {/* Fullscreen */}
            <motion.button
              onClick={toggleFullscreen}
              className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Maximize className="size-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        .slider::-webkit-slider-track {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 8px;
        }
        .slider::-moz-range-track {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 8px;
          height: 8px;
        }
      `}</style>
    </div>
  );
}
