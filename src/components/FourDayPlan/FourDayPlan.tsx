'use client';
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  Clock,
  Clock as ClockIcon,
  Loader2,
  Lock,
  Play,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

import webinarImage from '../../../public/assets/native_webinar.png';

import { SubscriptionModal } from '@/components/Models/SubscriptionModal';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  title: string;
  url: string;
  publicId: string;
  createdAt: string;
  duration?: string;
  thumbnailUrl?: string;
  webinarDetails?: {
    webinarName: string;
    webinarTitle: string;
  };
  day?: number;
}

interface Subscription {
  id: string;
  type: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface Webinar {
  id: string;
  webinarName: string;
  webinarTitle: string;
  webinarDate: string;
  webinarTime: string;
  video: {
    id: string;
    title: string;
    url: string;
  };
  imageUrl: string;
}

export default function VideoPlayerPage() {
  const { status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedWebinarId, setSelectedWebinarId] = useState<string | null>(
    null
  );
  const [hasActiveSixMonthPlan, setHasActiveSixMonthPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'upgrade'>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoMetadata, setVideoMetadata] = useState<{ [key: string]: string }>(
    {}
  );
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch videos
        const videoRes = await fetch('/api/videos');
        const videoData = await videoRes.json();
        if (videoData.success) {
          // Define the desired order of video titles
          const desiredOrder = [
            'Basics of Shree Suktam Sadhana',
            'Shree Yantra Pooja',
            'Learn Shree Suktam Sadhana',
          ];

          // First, find the Basics of Shree Suktam Sadhana video
          const basicsSuktamVideo = videoData.videos.find(
            (v: Video) => v.title === 'Basics of Shree Suktam Sadhana'
          );

          // Get remaining videos
          const remainingVideos = videoData.videos.filter(
            (v: Video) => v.title !== 'Basics of Shree Suktam Sadhana'
          );

          // Sort remaining videos according to the desired title order
          const sortedRemainingVideos = remainingVideos.sort(
            (a: Video, b: Video) => {
              const aIndex = desiredOrder.indexOf(a.title);
              const bIndex = desiredOrder.indexOf(b.title);
              // If video title not in desired order, put it at the end
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            }
          );

          // Combine videos with Basics of Shree Suktam Sadhana first
          const finalVideos = basicsSuktamVideo
            ? [basicsSuktamVideo, ...sortedRemainingVideos]
            : sortedRemainingVideos;

          // Assign days based on sorted order
          const videosWithDays = finalVideos
            .slice(0, 3)
            .map((video: Video, index: number) => ({
              ...video,
              day: index + 1,
            }));

          setVideos(videosWithDays);

          // Set the Basics of Shree Suktam Sadhana video as current if available
          if (basicsSuktamVideo) {
            setCurrentVideo({ ...basicsSuktamVideo, day: 1 });
          } else if (videosWithDays.length > 0) {
            setCurrentVideo(videosWithDays[0]);
          }
        }

        // Fetch subscription
        const subRes = await fetch('/api/subscription');
        const subData = await subRes.json();

        if (subData.subscriptions?.length > 0) {
          const activeSub = subData.subscriptions.find(
            (sub: Subscription) =>
              sub.type === 'FOUR_DAY' &&
              sub.isActive &&
              new Date(sub.endDate) > new Date()
          );

          // Calculate current day based on subscription start date
          if (activeSub) {
            const startDate = new Date(activeSub.startDate);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const currentDay = Math.min(diffDays, 4); // Cap at 4 days
            setCurrentDay(currentDay);
          }

          // Check if user has an active 6-Month plan
          const hasSixMonthPlan = subData.subscriptions.some(
            (sub: Subscription) =>
              sub.type === 'SIX_MONTH' &&
              sub.isActive &&
              new Date(sub.endDate) > new Date()
          );

          setHasActiveSixMonthPlan(hasSixMonthPlan);

          if (activeSub) {
            setSubscription(activeSub);
          }
        }

        // Fetch webinars for the upgrade section
        const webRes = await fetch('/api/webinar');
        const webData = await webRes.json();
        if (webData.success) {
          setWebinars(webData.webinars);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    } else if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  const extractVideoMetadata = async (video: Video) => {
    try {
      // Create a video element to get metadata
      const videoElement = document.createElement('video');
      videoElement.src = video.url;

      return new Promise((resolve) => {
        videoElement.addEventListener('loadedmetadata', () => {
          const duration = videoElement.duration;

          // Check if duration is valid
          if (isFinite(duration) && !isNaN(duration)) {
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            setVideoMetadata((prev) => ({
              ...prev,
              [video.id]: formattedDuration,
            }));

            resolve(formattedDuration);
          } else {
            // Set "Not Available" for invalid duration
            setVideoMetadata((prev) => ({
              ...prev,
              [video.id]: 'Not Available',
            }));
            resolve('Not Available');
          }
        });

        videoElement.addEventListener('error', () => {
          console.error('Error loading video metadata');
          setVideoMetadata((prev) => ({
            ...prev,
            [video.id]: 'Not Available',
          }));
          resolve('Not Available');
        });
      });
    } catch (error) {
      console.error('Error extracting video metadata:', error);
      setVideoMetadata((prev) => ({
        ...prev,
        [video.id]: 'Not Available',
      }));
      return 'Not Available';
    }
  };

  const handleVideoSelect = async (video: Video) => {
    setCurrentVideo(video);

    // Extract metadata if not already available
    if (!videoMetadata[video.id]) {
      await extractVideoMetadata(video);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="size-16 animate-spin text-blue-600" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading your content...
          </p>
        </motion.div>
      </div>
    );
  }

  if (
    !subscription ||
    subscription.type !== 'FOUR_DAY' ||
    !subscription.isActive
  ) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <motion.div
          className="rounded-full bg-red-100 p-4 text-red-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Lock className="size-12" />
        </motion.div>
        <motion.h2
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Subscription Required
        </motion.h2>
        <motion.p
          className="max-w-md text-center text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          You need an active 4-Day plan to access this content. Upgrade now to
          unlock all videos and features.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => redirect('/pricing')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl hover:shadow-blue-500/30"
          >
            Purchase Plan
          </Button>
        </motion.div>
      </div>
    );
  }

  const upcomingWebinars = webinars
    .filter((w) => new Date(w.webinarDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.webinarDate).getTime() - new Date(b.webinarDate).getTime()
    )
    .slice(0, 4); // Show 4 latest upcoming webinars

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with tabs */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <motion.h1
            className="text-xl font-bold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            4-Day Meditation Challenge
          </motion.h1>

          <div className="flex rounded-lg bg-gray-100 p-1">
            <motion.button
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('videos')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="size-4" />
              <span>Videos</span>
            </motion.button>

            <motion.button
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'upgrade'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('upgrade')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="size-4" />
              <span>Upgrade to 599</span>
            </motion.button>
          </div>
        </div>

        {/* Day Progress Indicator */}
        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((day) => {
              const video = videos.find((v) => v.day === day);
              const isUnlocked = day <= currentDay;

              return (
                <motion.div
                  key={day}
                  className={`rounded-lg border p-3 ${
                    isUnlocked
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * day }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex size-6 items-center justify-center rounded-full ${
                          isUnlocked
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isUnlocked ? (
                          <CheckCircle className="size-4" />
                        ) : (
                          <Lock className="size-4" />
                        )}
                      </div>
                      <span className="text-sm font-medium">Day {day}</span>
                    </div>
                    {isUnlocked ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Unlocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Locked
                      </span>
                    )}
                  </div>
                  {video && (
                    <>
                      <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                        {day === 1
                          ? 'Basics of Shree Suktam Sadhana'
                          : day === 2
                            ? 'Shree Yantra Pooja'
                            : 'Learn Shree Suktam Sadhana'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="size-3" />
                        <span>
                          {isUnlocked
                            ? 'Available Now'
                            : day === currentDay + 1
                              ? 'Unlocks at 9:00 PM'
                              : 'Coming Soon'}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'videos' ? (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col lg:flex-row"
          >
            {/* Video Player Section */}
            <div className="w-full p-4 lg:w-7/12">
              <motion.div
                className="relative h-full overflow-hidden rounded-xl bg-black shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {currentVideo ? (
                  <>
                    <video
                      key={currentVideo.id}
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      className="size-full rounded-xl [&::-webkit-media-controls-current-time-display]:hidden [&::-webkit-media-controls-panel]:!bg-black/70 [&::-webkit-media-controls-play-button]:hidden [&::-webkit-media-controls-time-remaining-display]:hidden [&::-webkit-media-controls-timeline]:hidden"
                      poster={
                        currentVideo.webinarDetails?.webinarTitle
                          ? `/assets/webinar-thumbnail.jpg`
                          : undefined
                      }
                      autoPlay
                      loop
                      controls
                      playsInline
                      style={
                        {
                          '--webkit-media-controls-play-button': 'none',
                          '--webkit-media-controls-timeline': 'none',
                          '--webkit-media-controls-current-time-display':
                            'none',
                          '--webkit-media-controls-time-remaining-display':
                            'none',
                        } as React.CSSProperties
                      }
                    >
                      <source src={currentVideo.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Live Indicator */}
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                      <div className="size-2 animate-pulse rounded-full bg-white"></div>
                      LIVE
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <div className="text-center">
                      <Play className="mx-auto size-12 text-gray-400" />
                      <p className="mt-2">Select a video to start playing</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Side Section - Description and Video List */}
            <div className="w-full p-4 lg:w-5/12">
              <motion.div
                className="h-full overflow-hidden rounded-xl bg-white shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Video Description */}
                <div className="border-b p-4">
                  <motion.h1
                    className="mb-2 text-xl font-bold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentVideo?.title || 'Select a Video'}
                  </motion.h1>
                  {currentVideo?.webinarDetails && (
                    <motion.p
                      className="mb-2 text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {currentVideo.webinarDetails.webinarTitle}
                    </motion.p>
                  )}
                  <motion.div
                    className="flex flex-wrap items-center gap-4 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="size-4 text-blue-500" />
                      <span>
                        {currentVideo
                          ? new Date(
                              currentVideo.createdAt
                            ).toLocaleDateString()
                          : 'No date'}
                      </span>
                    </div>
                    {currentVideo && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="size-4 text-red-500" />
                        <span className="flex items-center gap-2">
                          <span className="size-2 animate-pulse rounded-full bg-red-500"></span>
                          LIVE
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Video List */}
                <div className="h-[calc(100%-180px)] overflow-y-auto p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">
                    Course Videos
                  </h3>
                  <div className="space-y-3">
                    {videos.map((video, index) => {
                      const isCurrent = video.id === currentVideo?.id;
                      const isLocked = (video.day || 0) > currentDay;

                      return (
                        <motion.div
                          key={video.id}
                          onClick={() => !isLocked && handleVideoSelect(video)}
                          className={`group relative cursor-pointer overflow-hidden rounded-lg border p-3 transition-all duration-300
                            ${
                              isCurrent
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : isLocked
                                  ? 'border-gray-200 bg-gray-50 opacity-60'
                                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                            }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={!isLocked ? { y: -2 } : {}}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                                isCurrent
                                  ? 'bg-blue-100 text-blue-600'
                                  : isLocked
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {isLocked ? (
                                <Lock className="size-5" />
                              ) : (
                                <Play className="size-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span
                                  className={`font-medium ${
                                    isCurrent
                                      ? 'text-blue-700'
                                      : isLocked
                                        ? 'text-gray-400'
                                        : 'text-gray-800'
                                  }`}
                                >
                                  {video.title}
                                </span>
                                {isCurrent && (
                                  <motion.span
                                    className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 200,
                                    }}
                                  >
                                    Playing
                                  </motion.span>
                                )}
                                {isLocked && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                    Day {video.day}
                                  </span>
                                )}
                              </div>
                              {video.webinarDetails && (
                                <p className="mb-1 line-clamp-1 text-sm text-gray-600">
                                  {video.webinarDetails.webinarTitle}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {videoMetadata[video.id] && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="size-3 text-red-500" />
                                    <span className="flex items-center gap-1">
                                      <span className="size-1.5 animate-pulse rounded-full bg-red-500"></span>
                                      LIVE
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {!isLocked && (
                            <motion.div
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
                              initial={{ x: 10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <ChevronRight className="size-5" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upgrade"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-4"
          >
            <div className="mx-auto max-w-7xl">
              <motion.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="mb-2 text-2xl font-bold text-gray-800">
                  Upgrade to Full Access
                </h2>
                <p className="mx-auto mb-4 max-w-2xl text-gray-600">
                  Get unlimited access to all upcoming webinars with our 6-month
                  subscription. Join our exclusive community and never miss out
                  on valuable learning opportunities.
                </p>

                <motion.div
                  className="mx-auto mb-6 flex max-w-md flex-wrap items-center justify-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
                    <Users className="size-4" />
                    <span>Access to all webinars</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
                    <Star className="size-4" />
                    <span>Premium content</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm text-purple-700">
                    <Zap className="size-4" />
                    <span>No expiration</span>
                  </div>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {upcomingWebinars.map((webinar, index) => (
                  <motion.div
                    key={webinar.id}
                    className="group relative h-full overflow-hidden rounded-xl border bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                    onClick={() => {
                      setSelectedWebinarId(webinar.id);
                      setShowSubscriptionModal(true);
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                  >
                    {/* Image with overlay */}
                    <div className="relative aspect-video w-full">
                      {webinar.imageUrl ? (
                        <Image
                          src={webinarImage.src}
                          alt={webinar.webinarTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-800">
                          <Lock className="size-8 text-gray-400" />
                        </div>
                      )}

                      {/* Gradient overlay for better text readability - only show when image is available */}
                      {(webinar.imageUrl || index % 2 !== 0) && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold">
                          {webinar.webinarTitle}
                        </h3>
                        <p className="mb-2 line-clamp-1 text-xs text-gray-200">
                          {webinar.webinarName}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <Calendar className="size-3" />
                            <span>
                              {format(
                                parseISO(webinar.webinarDate),
                                'MMM dd, yyyy'
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <Clock className="size-3" />
                            <span>{webinar.webinarTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover overlay with Join Now button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <motion.button
                        className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Join Now
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {hasActiveSixMonthPlan ? (
                  <motion.div
                    className="mx-auto inline-flex items-center gap-2 rounded-full bg-green-50 px-6 py-3 text-green-700"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle className="size-5" />
                    <span>You already have an active 6-Month plan</span>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => {
                      setSelectedWebinarId(null);
                      setShowSubscriptionModal(true);
                    }}
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:shadow-blue-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Upgrade to 6-Month Plan
                  </motion.button>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Get access to all webinars and exclusive content
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubscriptionModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
        webinarId={selectedWebinarId || undefined}
      />
    </div>
  );
}
