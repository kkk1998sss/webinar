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
  description: string;
  unlockDay: number;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
}

interface Subscription {
  id: string;
  type: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  unlockedContent?: {
    unlockedVideos: number[];
    expiryDates: {
      [key: string]: string;
    };
  };
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

const videos: Video[] = [
  {
    id: '1',
    title: 'Day 1: Introduction',
    description: 'Get started with the basics',
    unlockDay: 1,
    videoUrl: 'https://example.com/video1',
    thumbnailUrl: '/assets/video-thumbnail-1.jpg',
    duration: '45:00',
  },
  // Add more video objects as needed
];

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
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
            // Find the first unlocked video that hasn't expired
            const firstValidVideo = videos.find(
              (v) =>
                activeSub.unlockedContent?.unlockedVideos.includes(
                  v.unlockDay
                ) &&
                new Date() <
                  new Date(
                    activeSub.unlockedContent.expiryDates[
                      `video${v.unlockDay}` as keyof typeof activeSub.unlockedContent.expiryDates
                    ]
                  )
            );
            setCurrentVideo(firstValidVideo || null);
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

  const handleVideoPlay = () => {
    setShowProgress(true);

    // Simulate video progress
    const interval = setInterval(() => {
      setProgress((prev: number) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
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

  const isVideoAccessible = (video: Video) => {
    if (!subscription.unlockedContent) return false;

    const isUnlocked = subscription.unlockedContent.unlockedVideos.includes(
      video.unlockDay
    );
    const expiryDate = new Date(
      subscription.unlockedContent.expiryDates[
        `video${video.unlockDay}` as keyof typeof subscription.unlockedContent.expiryDates
      ]
    );

    return isUnlocked && new Date() < expiryDate;
  };

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
              <span>Upgrade</span>
            </motion.button>
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
                      controls
                      className="size-full rounded-xl"
                      poster={currentVideo.thumbnailUrl}
                      onPlay={handleVideoPlay}
                    >
                      <source src={currentVideo.videoUrl} type="video/mp4" />
                    </video>

                    {showProgress && (
                      <motion.div
                        className="absolute inset-x-0 bottom-0 h-1 bg-gray-200"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </motion.div>
                    )}
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
                  <motion.p
                    className="mb-2 text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentVideo?.description || 'Choose from the list below'}
                  </motion.p>
                  <motion.div
                    className="flex flex-wrap items-center gap-4 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="size-4 text-blue-500" />
                      <span>
                        Day{' '}
                        {subscription.unlockedContent?.unlockedVideos.length}/4
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="size-4 text-indigo-500" />
                      <span>
                        Expires:{' '}
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Video List */}
                <div className="h-[calc(100%-180px)] overflow-y-auto p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">
                    Course Videos
                  </h3>
                  <div className="space-y-3">
                    {videos.map((video, index) => {
                      const isAccessible = isVideoAccessible(video);
                      const isCurrent = video.id === currentVideo?.id;
                      const expiryDate =
                        subscription.unlockedContent?.expiryDates[
                          `video${video.unlockDay}` as keyof typeof subscription.unlockedContent.expiryDates
                        ];

                      return (
                        <motion.div
                          key={video.id}
                          onClick={() => isAccessible && setCurrentVideo(video)}
                          className={`group relative cursor-pointer overflow-hidden rounded-lg border p-3 transition-all duration-300
                            ${isCurrent ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}
                            ${isAccessible ? '' : 'cursor-not-allowed opacity-70'}
                          `}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isAccessible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                            >
                              {isAccessible ? (
                                <Play className="size-5" />
                              ) : (
                                <Lock className="size-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span
                                  className={`font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-800'}`}
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
                              </div>
                              <p className="mb-1 line-clamp-1 text-sm text-gray-600">
                                {video.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  <span>{video.duration}</span>
                                </div>
                                {!isAccessible && expiryDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    <span>
                                      {new Date() > new Date(expiryDate)
                                        ? 'Expired'
                                        : `Available until ${new Date(expiryDate).toLocaleDateString()}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {isAccessible && (
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
