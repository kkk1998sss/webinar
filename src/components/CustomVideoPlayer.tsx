'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VideoFile {
  quality: string;
  type: string;
  width: number;
  height: number;
  link: string;
  size: number;
}

interface CustomVideoPlayerProps {
  videoFiles: VideoFile[];
  poster?: string;
  className?: string;
}

export default function CustomVideoPlayer({
  videoFiles,
  poster,
  className = '',
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Auto-select best quality
  useEffect(() => {
    if (videoFiles && videoFiles.length > 0) {
      // Sort by quality (highest first)
      const sortedFiles = [...videoFiles].sort((a, b) => {
        const qualityOrder = { hd: 3, sd: 2, mobile: 1 };
        const aOrder =
          qualityOrder[a.quality as keyof typeof qualityOrder] || 0;
        const bOrder =
          qualityOrder[b.quality as keyof typeof qualityOrder] || 0;
        return bOrder - aOrder;
      });
      setSelectedQuality(sortedFiles[0].quality);
    }
  }, [videoFiles]);

  // Set video source when quality changes
  useEffect(() => {
    if (videoRef.current && selectedQuality && videoFiles) {
      const selectedFile = videoFiles.find(
        (file) => file.quality === selectedQuality
      );
      if (selectedFile) {
        videoRef.current.src = selectedFile.link;
        setIsLoading(true);
      }
    }
  }, [selectedQuality, videoFiles]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleKeyboardSeek = (percentage: number) => {
    if (videoRef.current) {
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleError = () => {
    setError('Failed to load video');
    setIsLoading(false);
  };

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-xl bg-black shadow-2xl ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="size-full object-cover"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onClick={togglePlay}
        preload="metadata"
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
            <p className="text-gray-300">{error}</p>
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
                e.preventDefault();
                handleKeyboardSeek(0.5); // Seek to middle
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
              style={{ width: `${(currentTime / duration) * 100}%` }}
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

            {/* Quality Selector */}
            {videoFiles && videoFiles.length > 1 && (
              <div className="flex items-center space-x-2">
                <Settings className="size-4 text-white" />
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="rounded-lg border border-gray-600 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-gray-600/70"
                >
                  {videoFiles.map((file) => (
                    <option
                      key={file.quality}
                      value={file.quality}
                      className="bg-gray-800"
                    >
                      {file.quality.toUpperCase()} ({file.width}x{file.height})
                    </option>
                  ))}
                </select>
              </div>
            )}

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
