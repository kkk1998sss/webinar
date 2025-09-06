'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VideoSource {
  src: string;
  type: string;
  quality: string;
  label: string;
}

interface CustomVideoStreamPlayerProps {
  videoId: string;
  videoName: string;
  poster?: string;
  className?: string;
  fallbackToEmbed?: boolean;
}

export default function CustomVideoStreamPlayer({
  videoId,
  videoName,
  poster,
  className = '',
  fallbackToEmbed = true,
}: CustomVideoStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [useEmbed, setUseEmbed] = useState(false);

  const tryAlternativeSources = useCallback(async () => {
    try {
      // Try different Vimeo video URL patterns
      const alternativeUrls = [
        `https://player.vimeo.com/external/${videoId}.hd.mp4?s=hash&profile_id=174`,
        `https://player.vimeo.com/external/${videoId}.sd.mp4?s=hash&profile_id=174`,
        `https://vimeo.com/${videoId}`,
        `https://player.vimeo.com/video/${videoId}`,
      ];

      const sources: VideoSource[] = alternativeUrls.map((url, index) => ({
        src: url,
        type: 'video/mp4',
        quality: index === 0 ? 'hd' : index === 1 ? 'sd' : 'auto',
        label: index === 0 ? 'HD' : index === 1 ? 'SD' : 'Auto',
      }));

      setVideoSources(sources);
      setSelectedSource(sources[0].src);

      if (videoRef.current) {
        videoRef.current.src = sources[0].src;
      }
    } catch (error) {
      console.error('Error with alternative sources:', error);
      if (fallbackToEmbed) {
        setUseEmbed(true);
      } else {
        setError('Unable to load video. Please try again later.');
      }
    }
  }, [videoId, fallbackToEmbed]);

  const fetchVideoSources = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Try to get video files from our API
      const response = await fetch(`/api/vimeo/public/files/${videoId}`);
      const data = await response.json();

      if (response.ok && data.data.files && data.data.files.length > 0) {
        const sources: VideoSource[] = data.data.files.map(
          (file: {
            link: string;
            type?: string;
            quality: string;
            width: number;
            height: number;
          }) => ({
            src: file.link,
            type: file.type || 'video/mp4',
            quality: file.quality,
            label: `${file.quality.toUpperCase()} (${file.width}x${file.height})`,
          })
        );

        setVideoSources(sources);
        setSelectedSource(sources[0].src);

        // Set video source
        if (videoRef.current) {
          videoRef.current.src = sources[0].src;
        }
      } else {
        // If no direct files available, try alternative methods
        await tryAlternativeSources();
      }
    } catch (error) {
      console.error('Error fetching video sources:', error);
      await tryAlternativeSources();
    }
  }, [videoId, tryAlternativeSources]);

  // Try to get video sources from Vimeo
  useEffect(() => {
    fetchVideoSources();
  }, [videoId, fetchVideoSources]);

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

  const changeSource = (src: string) => {
    setSelectedSource(src);
    if (videoRef.current) {
      videoRef.current.src = src;
      setIsLoading(true);
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

  // If using embed fallback
  if (useEmbed) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-black shadow-2xl ${className}`}
      >
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=0&controls=1&loop=0&muted=0&responsive=1&show_title=1&show_byline=1&show_portrait=0&transparent=0`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="rounded-xl"
          title={videoName}
        />
      </div>
    );
  }

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
        controls={false}
      >
        {videoSources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
        Your browser does not support the video tag.
      </video>

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
              Attempting to stream from Vimeo
            </p>
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
            <div className="space-y-2">
              <button
                onClick={() => {
                  setError('');
                  fetchVideoSources();
                }}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Retry
              </button>
              {fallbackToEmbed && (
                <button
                  onClick={() => setUseEmbed(true)}
                  className="ml-2 rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                >
                  Use Vimeo Player
                </button>
              )}
            </div>
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
            {videoSources.length > 1 && (
              <div className="flex items-center space-x-2">
                <Settings className="size-4 text-white" />
                <select
                  value={selectedSource}
                  onChange={(e) => changeSource(e.target.value)}
                  className="rounded-lg border border-gray-600 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-gray-600/70"
                >
                  {videoSources.map((source) => (
                    <option
                      key={source.src}
                      value={source.src}
                      className="bg-gray-800"
                    >
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fallback to Embed */}
            {fallbackToEmbed && (
              <motion.button
                onClick={() => setUseEmbed(true)}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Switch to Vimeo Player"
              >
                <Download className="size-5" />
              </motion.button>
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
