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
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Series, SeriesVideo } from '@/types/user';

export default function SeriesDetailPage() {
  const [series, setSeries] = useState<Series | null>(null);
  const [currentVideo, setCurrentVideo] = useState<SeriesVideo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const seriesId = params.id as string;

  const fetchSeries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/series/${seriesId}`);
      const data = await response.json();
      if (data.success) {
        setSeries(data.series);
      } else {
        router.push('/users/live-webinar');
      }
    } catch (err) {
      console.error('Error fetching series:', err);
      router.push('/users/live-webinar');
    } finally {
      setLoading(false);
    }
  }, [seriesId, router]);

  useEffect(() => {
    if (seriesId) {
      fetchSeries();
    }
  }, [seriesId, fetchSeries]);

  useEffect(() => {
    if (series && series.videos.length > 0) {
      setCurrentVideo(series.videos[0]);
      setCurrentIndex(0);
    }
  }, [series]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
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

  const playVideo = (index: number) => {
    if (!series || index < 0 || index >= series.videos.length) return;

    setCurrentIndex(index);
    setCurrentVideo(series.videos[index]);
    // Reset player state when changing videos
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const playNext = () => {
    if (!series || currentIndex >= series.videos.length - 1) return;

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentVideo(series.videos[nextIndex]);
  };

  const playPrevious = () => {
    if (!series || currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentVideo(series.videos[prevIndex]);
  };

  const handlePlayAll = () => {
    router.push(`/users/series/${seriesId}/player`);
  };

  const handleGoBack = () => {
    router.push('/users/live-webinar');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded bg-gray-300 dark:bg-slate-700"></div>
            <div className="h-32 rounded bg-gray-300 dark:bg-slate-700"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded bg-gray-300 dark:bg-slate-700"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
              Series not found
            </h1>
            <Button onClick={handleGoBack} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800'}`}
    >
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

        .volume-slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.3);
          height: 4px;
          border-radius: 2px;
          border: none;
        }

        .volume-slider::-moz-range-thumb {
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

        .seek-bar::-moz-range-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }

        .seek-bar::-moz-range-thumb {
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

        .seek-bar:hover::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>

      {/* Header - Hide in fullscreen */}
      {!isFullscreen && (
        <div className="flex items-center justify-between border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-gray-600 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Webinars
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                {series.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {currentVideo
                  ? `${currentIndex + 1} of ${series.videos.length} • `
                  : ''}
                {series.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePlayAll}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <PlayCircle className="mr-2 size-4" />
              Play All in Theater Mode
            </Button>
          </div>
        </div>
      )}

      {/* Main Content - Split Screen */}
      <div className={`${isFullscreen ? 'h-full' : 'flex-1'} flex`}>
        {/* Video Player - Left Side */}
        <div
          className={`${isFullscreen ? 'w-full' : 'w-full lg:w-2/3'} relative flex flex-col`}
        >
          {currentVideo ? (
            <div
              className={`group relative flex items-center justify-center bg-black ${
                isFullscreen ? 'h-screen' : 'flex-1'
              }`}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              <div
                className={`size-full max-w-none ${isFullscreen ? '' : 'aspect-video'}`}
              >
                <iframe
                  src={getYouTubeEmbedUrl(currentVideo.videoUrl)}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  title={currentVideo.title}
                />
              </div>

              {/* Custom Video Controls Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                style={{ zIndex: isFullscreen ? 9999 : 'auto' }}
              >
                {/* Center Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlayPause}
                    className="size-20 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="size-8" />
                    ) : (
                      <Play className="ml-1 size-8" />
                    )}
                  </Button>
                </div>

                {/* Bottom Controls Bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
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
                    <div className="flex items-center gap-3">
                      {/* Play/Pause */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/10"
                      >
                        {isPlaying ? (
                          <Pause className="size-5" />
                        ) : (
                          <Play className="size-5" />
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
                        <SkipBack className="size-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playNext}
                        disabled={currentIndex >= series.videos.length - 1}
                        className="text-white hover:bg-white/10 disabled:opacity-50"
                      >
                        <SkipForward className="size-4" />
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
                            <VolumeX className="size-4" />
                          ) : (
                            <Volume2 className="size-4" />
                          )}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={(e) =>
                            setVolumeLevel(Number(e.target.value))
                          }
                          className="volume-slider h-1 w-16"
                        />
                      </div>

                      {/* Time Display */}
                      <div className="text-sm text-white">
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
                        <Maximize className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-gray-100 dark:bg-slate-800">
              <div className="text-center text-gray-500 dark:text-slate-400">
                <Video className="mx-auto mb-4 size-16 opacity-50" />
                <p>Select a video to start watching</p>
              </div>
            </div>
          )}
        </div>

        {/* Playlist - Right Side */}
        {!isFullscreen && (
          <div className="absolute flex w-full translate-x-full flex-col border-l border-gray-200 bg-white lg:relative lg:w-1/3 lg:translate-x-0 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-slate-100">
                <List className="size-5" />
                Videos ({series.videos.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                <Clock className="size-4" />
                <span>
                  {Math.floor(series.totalDuration / 60)}h{' '}
                  {series.totalDuration % 60}m
                </span>
              </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto">
              {series.videos.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-slate-400">
                  <Video className="mx-auto mb-3 size-12 opacity-50" />
                  <p>No videos in this series yet</p>
                </div>
              ) : (
                series.videos.map((video: SeriesVideo, index: number) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`cursor-pointer border-b border-gray-100 p-4 transition-all duration-200 ${
                      index === currentIndex
                        ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                    } dark:border-slate-600`}
                    onClick={() => playVideo(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                          index === currentIndex
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-300'
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
                          className={`mb-1 text-sm font-medium leading-tight ${
                            index === currentIndex
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-800 dark:text-slate-100'
                          }`}
                        >
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-slate-400">
                            {video.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {video.duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500">
                              <Clock className="size-3" />
                              <span>{formatDuration(video.duration)}</span>
                            </div>
                          )}
                          {index === currentIndex && (
                            <span className="text-xs font-medium text-blue-500">
                              Now Playing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
