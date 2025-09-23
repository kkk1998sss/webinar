'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  List,
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import { ZataVideo } from '@/lib/zata';

interface VideoPlayerProps {
  videos: ZataVideo[];
  initialVideoIndex?: number;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videos,
  initialVideoIndex = 0,
  onClose,
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const currentVideo = videos[currentVideoIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [currentVideoIndex]);

  // Prevent body scroll when video player is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const nextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsPlaying(true);
    }
  };

  const previousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsPlaying(true);
    }
  };

  const selectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentVideo) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎬</div>
          <h3 className="mb-2 text-xl font-semibold">No Video Selected</h3>
          <p className="text-gray-600">Please select a video to play</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex h-screen w-screen overflow-hidden bg-black"
      style={{ margin: 0, padding: 0 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Close Button - Hidden to avoid blocking playlist */}
      {/* {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          <X className="size-6" />
        </button>
      )} */}

      {/* Main Video Player */}
      <div
        ref={playerRef}
        className={`relative flex-1 transition-all duration-300 ${
          showPlaylist ? 'mr-0 sm:mr-96' : ''
        }`}
      >
        <video
          ref={videoRef}
          src={currentVideo.url}
          className="size-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={nextVideo}
          onContextMenu={(e) => e.preventDefault()}
          autoPlay
        />

        {/* Video Controls Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
          {/* Progress Bar */}
          <div className="mb-2 sm:mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/30"
            />
            <div className="mt-1 flex justify-between text-xs text-white sm:text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={previousVideo}
                disabled={currentVideoIndex === 0}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 disabled:opacity-50"
              >
                <ChevronLeft className="size-4 sm:size-5" />
              </button>

              <button
                onClick={togglePlay}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 sm:p-3"
              >
                {isPlaying ? (
                  <Pause className="size-5 sm:size-6" />
                ) : (
                  <Play className="size-5 sm:size-6" />
                )}
              </button>

              <button
                onClick={nextVideo}
                disabled={currentVideoIndex === videos.length - 1}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 disabled:opacity-50"
              >
                <ChevronRight className="size-4 sm:size-5" />
              </button>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <button onClick={toggleMute} className="text-white">
                  {isMuted ? (
                    <VolumeX className="size-4 sm:size-5" />
                  ) : (
                    <Volume2 className="size-4 sm:size-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20"
                />
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                title={showPlaylist ? 'Hide Playlist' : 'Show Playlist'}
              >
                <List className="size-4 sm:size-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                title="Toggle Fullscreen"
              >
                <Maximize className="size-4 sm:size-5" />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                  title="Close Player"
                >
                  <X className="size-4 sm:size-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Video Title Overlay */}
        <div className="absolute left-0 top-0 bg-gradient-to-r from-black/80 to-transparent p-2 sm:p-4">
          <h2 className="text-sm font-semibold text-white sm:text-xl">
            {currentVideo.name}
          </h2>
          <p className="text-xs text-white/80 sm:text-sm">
            {currentVideoIndex + 1} of {videos.length}
          </p>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute right-0 top-0 size-full overflow-y-auto bg-gray-900/95 backdrop-blur-sm sm:w-96"
          >
            <div className="p-2 sm:p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white sm:text-lg">
                  Playlist ({videos.length})
                </h3>
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30 sm:hidden"
                  title="Close Playlist"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectVideo(index)}
                    className={`cursor-pointer rounded-lg p-2 transition-all sm:p-3 ${
                      index === currentVideoIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="shrink-0">
                        {index === currentVideoIndex && isPlaying ? (
                          <div className="flex size-6 items-center justify-center rounded-full bg-white/20 sm:size-8">
                            <div className="size-1.5 animate-pulse rounded-full bg-white sm:size-2"></div>
                          </div>
                        ) : (
                          <div className="flex size-6 items-center justify-center rounded-full bg-gray-600 sm:size-8">
                            <Play className="size-3 sm:size-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium sm:text-base">
                          {video.name}
                        </h4>
                        <p className="text-xs opacity-75">
                          {video.duration
                            ? formatTime(video.duration)
                            : 'Unknown duration'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
