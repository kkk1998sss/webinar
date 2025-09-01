'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  List,
  Maximize,
  Pause,
  Play,
  PlayCircle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Series, SeriesVideo } from '@/types/user';

export default function SeriesPlayerPage() {
  const [series, setSeries] = useState<Series | null>(null);
  const [currentVideo, setCurrentVideo] = useState<SeriesVideo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(true); // Always show playlist by default
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const seriesId = params.id as string;
  const videoId = searchParams.get('video');

  useEffect(() => {
    if (seriesId) {
      fetchSeries();
    }
  }, [seriesId]);

  useEffect(() => {
    if (series && series.videos.length > 0) {
      let initialIndex = 0;

      if (videoId) {
        const videoIndex = series.videos.findIndex((v) => v.id === videoId);
        if (videoIndex !== -1) {
          initialIndex = videoIndex;
        }
      }

      setCurrentIndex(initialIndex);
      setCurrentVideo(series.videos[initialIndex]);
    }
  }, [series, videoId]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/series/${seriesId}`);
      const data = await response.json();
      if (data.success) {
        setSeries(data.series);
      } else {
        router.push('/users/live-webinar');
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      router.push('/users/live-webinar');
    } finally {
      setLoading(false);
    }
  };

  const playNext = useCallback(() => {
    if (!series || currentIndex >= series.videos.length - 1) return;

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentVideo(series.videos[nextIndex]);
  }, [series, currentIndex]);

  const playPrevious = useCallback(() => {
    if (!series || currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentVideo(series.videos[prevIndex]);
  }, [currentIndex, series]);

  const playVideo = (index: number) => {
    if (!series || index < 0 || index >= series.videos.length) return;

    setCurrentIndex(index);
    setCurrentVideo(series.videos[index]);
    setShowPlaylist(false);
    // Reset player state when changing videos
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?enablejsapi=1&controls=0&rel=0&modestbranding=1&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&origin=${window.location.origin}`;
    }
    return url;
  };

  // Custom player controls
  const togglePlayPause = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      if (isPlaying) {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      } else {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        `{"event":"command","func":"seekTo","args":"[${time}, true]"}`,
        '*'
      );
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    seekTo(time);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        `{"event":"command","func":"${isMuted ? 'unMute' : 'mute'}","args":""}`,
        '*'
      );
    }
  };

  const setVolumeLevel = (newVolume: number) => {
    setVolume(newVolume);
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        `{"event":"command","func":"setVolume","args":"${newVolume * 100}"}`,
        '*'
      );
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowPlaylist(false); // Hide playlist in fullscreen
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setShowPlaylist(true); // Show playlist when exiting fullscreen
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setShowPlaylist(true); // Show playlist when exiting fullscreen via ESC key
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // YouTube Player API integration
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;

      try {
        const data = JSON.parse(event.data);

        if (data.event === 'video-progress') {
          setCurrentTime(data.info.currentTime);
          setDuration(data.info.duration);
        }

        if (data.event === 'onStateChange') {
          const playerState = data.info;
          // 1 = playing, 2 = paused
          setIsPlaying(playerState === 1);
        }
      } catch {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update player time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow && isPlaying) {
        iframe.contentWindow.postMessage(
          '{"event":"listening","id":"player","channel":"widget"}',
          '*'
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoBack = () => {
    router.push(`/users/series/${seriesId}`);
  };

  const handleBackToMainPlayer = () => {
    router.push(`/users/series/${seriesId}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-lg text-white">Loading player...</div>
      </div>
    );
  }

  if (!series || !currentVideo) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h1 className="mb-4 text-2xl font-bold">Video not found</h1>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Volume slider styles */
        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.3);
          height: 4px;
          border-radius: 2px;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }

        /* Special styling for seek bar */
        .seek-bar::-webkit-slider-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
        }

        .seek-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .seek-bar:hover::-webkit-slider-thumb {
          opacity: 1;
        }
      `}</style>
      {/* Header - Hide in fullscreen */}
      {!isFullscreen && (
        <div className="z-10 flex items-center justify-between bg-black/90 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold text-white">{currentVideo.title}</h1>
              <p className="text-sm text-gray-400">
                {currentIndex + 1} of {series.videos.length} • {series.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMainPlayer}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Main Player
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="text-white hover:bg-white/10 lg:hidden"
            >
              <List className="size-4" />
            </Button>
            <span className="hidden text-sm text-gray-400 lg:block">
              {series.videos.length} videos in playlist
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex ${isFullscreen ? 'h-full' : 'flex-1'}`}>
        {/* Video Player */}
        <div
          className={`relative flex items-center justify-center transition-all duration-300 ${
            isFullscreen ? 'w-full' : showPlaylist ? 'lg:w-2/3' : 'w-full'
          }`}
        >
          <div
            className={`group relative w-full max-w-none ${
              isFullscreen ? 'h-screen p-0' : 'aspect-video h-full p-4'
            }`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <iframe
              src={getYouTubeEmbedUrl(currentVideo.videoUrl)}
              className={`size-full shadow-2xl ${isFullscreen ? '' : 'rounded-lg'}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              title={currentVideo.title}
            />

            {/* Custom Video Controls Overlay */}
            <div
              className={`absolute transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} ${
                isFullscreen ? 'inset-8' : 'inset-4'
              }`}
              style={{ zIndex: isFullscreen ? 9999 : 'auto' }}
            >
              {/* Center Play/Pause Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={togglePlayPause}
                  className="size-24 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="size-10" />
                  ) : (
                    <Play className="ml-1 size-10" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls Bar */}
              <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="relative mb-4">
                  <div className="relative mb-2 h-2 w-full rounded-full bg-white/20">
                    <div
                      className="h-2 rounded-full bg-red-500 transition-all duration-300"
                      style={{
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="1"
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="seek-bar absolute top-0 h-2 w-full cursor-pointer appearance-none bg-transparent"
                    style={{ WebkitAppearance: 'none' }}
                  />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/10"
                    >
                      {isPlaying ? (
                        <Pause className="size-6" />
                      ) : (
                        <Play className="size-6" />
                      )}
                    </Button>

                    {/* Previous/Next */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={playPrevious}
                      disabled={currentIndex === 0}
                      className="text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <SkipBack className="size-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={playNext}
                      disabled={currentIndex >= series.videos.length - 1}
                      className="text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <SkipForward className="size-5" />
                    </Button>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/10"
                      >
                        {isMuted ? (
                          <VolumeX className="size-5" />
                        ) : (
                          <Volume2 className="size-5" />
                        )}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolumeLevel(Number(e.target.value))}
                        className="volume-slider h-1 w-20"
                      />
                    </div>

                    {/* Time Display */}
                    <div className="font-mono text-sm text-white">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Fullscreen */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/10"
                    >
                      <Maximize className="size-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        {!isFullscreen && (
          <div
            className={`flex flex-col border-l border-gray-700 bg-gray-900 transition-all duration-300 ${
              showPlaylist
                ? 'absolute z-10 w-full translate-x-0 lg:relative lg:w-1/3 lg:translate-x-0'
                : 'absolute w-full translate-x-full lg:relative lg:w-0 lg:translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4">
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <List className="size-4" />
                Series Playlist
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlaylist(false)}
                className="text-white hover:bg-white/10 lg:hidden"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto">
              {series.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className={`cursor-pointer border-b border-gray-700 p-4 transition-all duration-200 ${
                    index === currentIndex
                      ? 'border-l-4 border-l-blue-500 bg-blue-600/20 shadow-lg'
                      : 'hover:bg-gray-800/50'
                  }`}
                  onClick={() => playVideo(index)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                        index === currentIndex
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {index === currentIndex ? (
                        <PlayCircle className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-sm font-medium leading-tight ${
                          index === currentIndex
                            ? 'text-blue-400'
                            : 'text-white'
                        }`}
                      >
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                          {video.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        {video.duration && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="size-3" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        )}
                        {index === currentIndex && (
                          <span className="text-xs font-medium text-blue-400">
                            Now Playing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auto-play next video notification */}
      {currentIndex < series.videos.length - 1 &&
        !showPlaylist &&
        !isFullscreen && (
          <div className="absolute bottom-20 right-4 z-20 max-w-sm rounded-lg bg-black/90 p-4 text-white backdrop-blur-sm">
            <h3 className="mb-2 font-semibold">Up Next</h3>
            <p className="mb-3 text-sm text-gray-300">
              {series.videos[currentIndex + 1]?.title}
            </p>
            <Button
              size="sm"
              onClick={playNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Play Now
            </Button>
          </div>
        )}
    </div>
  );
}
