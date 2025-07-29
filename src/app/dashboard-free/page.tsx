'use client';
import { useEffect, useMemo, useState } from 'react';
import { compareAsc, format, isFuture, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Book,
  Calendar,
  Clock,
  Crown,
  ExternalLink,
  Gift,
  Play,
  Star,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import WebinarView from '@/app/users/live-webinar/webinar-view';
import FourDayPlanFree from '@/components/FourDayPlan/FourDayPlanFree';

// Add LoadingScreen component
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 backdrop-blur-sm dark:from-gray-900/90 dark:via-green-900/90 dark:to-blue-900/90">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-16 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
          <div
            className="absolute inset-0 size-16 animate-spin rounded-full border-4 border-transparent border-t-blue-600"
            style={{ animationDelay: '-0.5s' }}
          ></div>
        </div>
        <div className="text-center">
          <p className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
            Loading Your Free Dashboard
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Preparing your free spiritual journey...
          </p>
        </div>
      </div>
    </div>
  );
};

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH' | 'PAID_WEBINAR';
  startDate: string;
  endDate: string;
  isActive: boolean;
  isValid: boolean;
  isFree?: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'video' | 'meditation' | 'ebook' | 'live';
  gradient: string;
  icon: React.ReactNode;
}

interface Webinar {
  id: string;
  webinarName: string;
  webinarTitle: string;
  description?: string;
  webinarDate: string;
  webinarTime?: string;
  durationHours: number;
  durationMinutes: number;
  isPaid: boolean;
  paidAmount?: number;
  discountPercentage?: number;
  discountAmount?: number;
}

type ViewType = 'dashboard' | 'fourDay' | 'webinar';

// Upcoming Paid Webinars Component
function UpcomingPaidWebinars() {
  const router = useRouter();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const response = await fetch('/api/webinar');
        const data = await response.json();
        if (data.success && Array.isArray(data.webinars)) {
          setWebinars(data.webinars);
        }
      } catch (error) {
        console.error('Error fetching webinars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinars();
  }, []);

  const upcomingPaidWebinars = useMemo(() => {
    return webinars
      .filter(
        (webinar) =>
          webinar.isPaid === true && isFuture(parseISO(webinar.webinarDate))
      )
      .sort((a, b) =>
        compareAsc(parseISO(a.webinarDate), parseISO(b.webinarDate))
      )
      .slice(0, 3); // Show only first 3 upcoming paid webinars
  }, [webinars]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (upcomingPaidWebinars.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 p-8 text-center dark:from-orange-900/20 dark:to-red-900/20">
        <Calendar className="mx-auto mb-4 size-12 text-orange-500" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          No Upcoming Paid Webinars
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Check back soon for exclusive spiritual sessions!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {upcomingPaidWebinars.map((webinar, index) => (
        <motion.div
          key={webinar.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800/90"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 transition-opacity duration-300 group-hover:opacity-100"></div>

          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Paid Webinar
                  </span>
                </div>
              </div>
              {webinar.discountPercentage && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {webinar.discountPercentage}% OFF
                </span>
              )}
            </div>

            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {webinar.webinarTitle}
            </h3>

            {webinar.description && (
              <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                {webinar.description}
              </p>
            )}

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="size-4" />
                <span>
                  {format(parseISO(webinar.webinarDate), 'MMM dd, yyyy')}
                  {webinar.webinarTime && ` at ${webinar.webinarTime}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="size-4" />
                <span>
                  Duration: {webinar.durationHours}h {webinar.durationMinutes}m
                </span>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Price
                </span>
                <div className="flex items-center gap-2">
                  {webinar.discountAmount && webinar.paidAmount ? (
                    <>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ₹{webinar.paidAmount - webinar.discountAmount}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{webinar.paidAmount}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      ₹{webinar.paidAmount || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ExternalLink className="size-4" />
                Register Now
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function DashboardFree() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const freeContentItems: ContentItem[] = [
    {
      id: '1',
      title: '3-Day Free Spiritual Content',
      description: 'Access free spiritual teachings and meditation guides',
      type: 'course',
      gradient: 'from-green-400 via-blue-500 to-purple-500',
      icon: <Star className="size-6" />,
    },
    {
      id: '2',
      title: 'Free E-books Collection',
      description: 'Downloadable meditation guides and spiritual texts',
      type: 'ebook',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      icon: <Book className="size-6" />,
    },
    {
      id: '3',
      title: '10 Bonus Audios',
      description: 'Exclusive spiritual audio content and guided sessions',
      type: 'video',
      gradient: 'from-purple-400 via-pink-500 to-rose-500',
      icon: <Play className="size-6" />,
    },
  ];

  const premiumContentItems: ContentItem[] = [
    {
      id: '4',
      title: 'Live Sunday Sessions',
      description: 'Join our weekly live events with spiritual guidance',
      type: 'live',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      icon: <Calendar className="size-6" />,
    },
    {
      id: '5',
      title: 'Premium E-books Collection',
      description: 'Advanced meditation guides and spiritual texts',
      type: 'ebook',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      icon: <Book className="size-6" />,
    },
    {
      id: '6',
      title: 'All Premium Videos',
      description: 'Access our complete video library of teachings',
      type: 'video',
      gradient: 'from-indigo-400 via-purple-500 to-pink-500',
      icon: <Play className="size-6" />,
    },
  ];

  // Add page load effect
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  // Reset currentView to dashboard when component mounts
  useEffect(() => {
    setCurrentView('dashboard');
  }, []);

  // Fetch subscription data or create free subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Try to fetch existing subscription
        const response = await fetch('/api/subscription/free');
        const data = await response.json();

        if (data.subscriptions?.length > 0) {
          setSubscriptions(data.subscriptions);
        } else if (session?.user?.email) {
          // If no subscription exists, create a free one
          try {
            const createResponse = await fetch('/api/subscription/free', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: session.user.email }),
            });

            if (createResponse.ok) {
              // Fetch again after creating free subscription
              const newResponse = await fetch('/api/subscription/free');
              const newData = await newResponse.json();
              if (newData.subscriptions?.length > 0) {
                setSubscriptions(newData.subscriptions);
              }
            }
          } catch (error) {
            console.error('Error creating free subscription:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status, session]);

  // Add navigation effects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login-free');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.isAdmin) {
      setCurrentView('webinar');
    }
  }, [session]);

  if (status === 'loading' || loading || !isPageLoaded) {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const hasFreeAccess = subscriptions.some((sub) => sub.isFree && sub.isValid);

  // Check if user is admin
  if (session?.user?.isAdmin) {
    return <WebinarView session={session} />;
  }

  const handleStartLearning = (item: ContentItem) => {
    if (item.title === '3-Day Free Spiritual Content') {
      setCurrentView('fourDay');
      return;
    }
    if (item.type === 'ebook') {
      router.push('/users/ebook199');
      return;
    }
    if (item.title === '10 Bonus Audios') {
      router.push('/audio/simple');
      return;
    }
    // For now, redirect free users to upgrade
    // router.push('/');
    router.push('/');
  };

  // Render different views based on currentView state
  if (currentView === 'fourDay') {
    return <FourDayPlanFree />;
  }

  if (currentView === 'webinar') {
    return <WebinarView session={session!} />;
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-green-900 dark:to-blue-900">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 size-80 animate-pulse rounded-full bg-gradient-to-r from-green-400 to-blue-400 opacity-20 blur-3xl"></div>
        <div
          className="absolute -bottom-40 -left-40 size-80 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-3xl"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 blur-3xl"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 shadow-2xl"
            >
              <Gift className="size-10 text-white" />
            </motion.div>
            <h1 className="mb-3 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
              Welcome to Shree Mahavidya Shaktipeeth
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {hasFreeAccess
                ? 'Awaken Abundance. Embrace the Divine.'
                : '✨ Welcome to Your Spiritual Journey'}
            </p>
          </div>

          {/* Free Access Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 text-white shadow-lg"
          >
            <Gift className="size-5" />
            <span className="font-semibold">Free Access - 30 Days</span>
          </motion.div>
        </motion.div>

        {/* Switcher Tabs */}
        <div className="mb-10 flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`group relative overflow-hidden rounded-xl px-8 py-4 font-semibold transition-all duration-300 ${
              activeTab === 'unlocked'
                ? 'scale-105 bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-xl'
                : 'bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-white hover:shadow-lg'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Gift className="size-5" />
              Free Content
            </span>
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`group relative overflow-hidden rounded-xl px-8 py-4 font-semibold transition-all duration-300 ${
              activeTab === 'locked'
                ? 'scale-105 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl'
                : 'bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-white hover:shadow-lg'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Crown className="size-5" />
              Premium Content
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'unlocked' && (
          <div className="grid gap-8 md:grid-cols-3">
            {freeContentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="hover:shadow-3xl group relative cursor-pointer overflow-hidden rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105"
                onClick={() => handleStartLearning(item)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 transition-opacity duration-500 group-hover:opacity-10`}
                ></div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={`flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r ${item.gradient} px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <Play className="size-5" />
                      Start Free Learning
                    </span>
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'locked' && (
          <div className="grid gap-8 md:grid-cols-3">
            {premiumContentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500"
              >
                {/* Lock overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                  <div className="text-center text-white">
                    <Crown className="mx-auto mb-4 size-12" />
                    <h4 className="mb-2 text-xl font-bold">Premium Content</h4>
                    <p className="text-sm opacity-80">Upgrade to unlock</p>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5`}
                ></div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={`flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`relative w-full overflow-hidden rounded-xl bg-gradient-to-r ${item.gradient} px-6 py-4 font-semibold text-white shadow-lg`}
                    onClick={() => router.push('/')}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <Crown className="size-5" />
                      Upgrade to Access
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upcoming Paid Webinars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-3xl font-bold text-transparent">
                🎯 Upcoming Paid Webinars
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join exclusive spiritual sessions with advanced teachings
              </p>
            </div>

            <UpcomingPaidWebinars />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
