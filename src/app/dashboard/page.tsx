'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Book,
  Calendar,
  Crown,
  Heart,
  Play,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import WebinarView from '@/app/users/live-webinar/webinar-view';
import FourDayPlan from '@/components/FourDayPlan/FourDayPlan';

// Add LoadingScreen component
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 backdrop-blur-sm dark:from-gray-900/90 dark:via-purple-900/90 dark:to-pink-900/90">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <div
            className="absolute inset-0 size-16 animate-spin rounded-full border-4 border-transparent border-t-purple-600"
            style={{ animationDelay: '-0.5s' }}
          ></div>
        </div>
        <div className="text-center">
          <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
            Loading Your Dashboard
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Preparing your personalized experience...
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
  shouldShowFourDayPlan: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'video' | 'meditation' | 'ebook' | 'live';
  gradient: string;
  icon: React.ReactNode;
}

type ViewType = 'dashboard' | 'fourDay' | 'webinar';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const premiumContentItems: ContentItem[] = [
    {
      id: '6',
      title: 'Live Sunday Sessions',
      description: 'Join our weekly live events with spiritual guidance',
      type: 'live',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      icon: <Calendar className="size-6" />,
    },
    {
      id: '5',
      title: 'E-books Collection',
      description: 'Downloadable meditation guides and spiritual texts',
      type: 'ebook',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      icon: <Book className="size-6" />,
    },
    {
      id: '7',
      title: 'All Videos Available Here',
      description: 'Access our complete video library of teachings',
      type: 'video',
      gradient: 'from-purple-400 via-pink-500 to-rose-500',
      icon: <Play className="size-6" />,
    },
    {
      id: '3',
      title: 'Live webinars and Past webinars',
      description: 'Complete course with detailed explanations',
      type: 'course',
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      icon: <Star className="size-6" />,
    },
  ];

  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: '3-4 Days Webinar',
      description: 'Access all webinar recordings and teachings',
      type: 'video',
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      icon: <Play className="size-6" />,
    },
    {
      id: '2',
      title: 'E-Books Collection',
      description: 'Access your collection of meditation e-books',
      type: 'ebook',
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      icon: <Book className="size-6" />,
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

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();

        if (data.subscriptions?.length > 0) {
          // Sort subscriptions by startDate to get the latest first
          const sortedSubs = [...data.subscriptions].sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );

          // First try to find an active SIX_MONTH subscription
          const sixMonthSub = sortedSubs.find(
            (sub) => sub.type === 'SIX_MONTH' && sub.isActive
          );

          if (sixMonthSub) {
            setSubscription(sixMonthSub);
            return;
          }

          // If no active SIX_MONTH, find the latest active FOUR_DAY subscription
          const fourDaySub = sortedSubs.find(
            (sub) => sub.type === 'FOUR_DAY' && sub.isActive
          );

          if (fourDaySub) {
            // Add shouldShowFourDayPlan flag based on multiple conditions
            const shouldShowFourDayPlan =
              fourDaySub.unlockedContent?.currentDay === 1 &&
              new Date(fourDaySub.startDate).getTime() >
                Date.now() - 48 * 60 * 60 * 1000;

            console.log('FourDayPlan Debug:', {
              subscriptionType: fourDaySub.type,
              isActive: fourDaySub.isActive,
              currentDay: fourDaySub.unlockedContent?.currentDay,
              startDate: new Date(fourDaySub.startDate),
              timeWindow: new Date(Date.now() - 48 * 60 * 60 * 1000),
              shouldShowFourDayPlan,
            });

            setSubscription({
              ...fourDaySub,
              shouldShowFourDayPlan,
            });
            return;
          }

          // If no active subscriptions found, set the latest subscription
          setSubscription(sortedSubs[0]);
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
  }, [status]);

  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/dashboard') {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Add navigation effects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!loading && !subscription) {
      router.push('/');
    }
  }, [loading, subscription, router]);

  useEffect(() => {
    if (subscription && !subscription.isActive) {
      router.push('/');
    }
  }, [subscription, router]);

  useEffect(() => {
    if (session?.user?.isAdmin) {
      setCurrentView('webinar');
    }
  }, [session]);

  if (status === 'loading' || loading || !isPageLoaded) {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated' || !subscription || !subscription.isActive) {
    return null;
  }

  // Check if user is admin
  if (session?.user?.isAdmin) {
    return <WebinarView session={session} />;
  }

  // For FOUR_DAY subscribers, check if they should see the welcome page
  if (subscription.type === 'FOUR_DAY' && subscription.shouldShowFourDayPlan) {
    return <FourDayPlan />;
  }

  // Function to check if content is accessible based on subscription
  const isContentAccessible = (item: ContentItem) => {
    // Allow access to basic content for all subscribers
    if (item.title === '3-4 Days Webinar' || item.type === 'ebook') {
      return true;
    }

    // For premium content, check subscription type
    if (subscription?.type === 'SIX_MONTH') {
      return true;
    }

    return false;
  };

  const handleStartLearning = (item: ContentItem) => {
    if (subscription.type === 'FOUR_DAY') {
      if (item.title === '3-4 Days Webinar') {
        setCurrentView('fourDay');
        return;
      }
      if (item.type === 'ebook') {
        router.push('/users/ebook199');
        return;
      }
      router.push('/');
      return;
    }

    if (subscription.type === 'SIX_MONTH') {
      if (item.title === '3-4 Days Webinar') {
        setCurrentView('webinar');
        return;
      }
      if (item.type === 'ebook') {
        router.push('/users/ebooks');
        return;
      }
      setCurrentView('webinar');
    }
  };

  // Add this helper function at the top level of the component
  const getLatestActiveSubscription = () => {
    if (!subscription) return null;

    // Sort by startDate in descending order to get latest first
    const sortedSubs = [subscription].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // First try to find an active SIX_MONTH subscription
    const sixMonthSub = sortedSubs.find(
      (sub) => sub.type === 'SIX_MONTH' && sub.isActive
    );

    if (sixMonthSub) return sixMonthSub;

    // If no active SIX_MONTH, return the latest FOUR_DAY subscription
    return sortedSubs.find((sub) => sub.type === 'FOUR_DAY' && sub.isActive);
  };

  // Render different views based on currentView state
  if (currentView === 'fourDay') {
    return <FourDayPlan />;
  }

  if (currentView === 'webinar') {
    return <WebinarView session={session!} />;
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 size-80 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl"></div>
        <div
          className="absolute -bottom-40 -left-40 size-80 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 blur-3xl"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-10 blur-3xl"
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
              className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl"
            >
              <Crown className="size-10 text-white" />
            </motion.div>
            <h1 className="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-5xl font-bold text-transparent">
              Your Spiritual Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {subscription.type === 'FOUR_DAY'
                ? '✨ Access to 3-4 Days Webinar'
                : '🌟 Full access to all spiritual content'}
            </p>
          </div>

          {/* Subscription Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3 text-white shadow-lg"
          >
            <Zap className="size-5" />
            <span className="font-semibold">
              {subscription.type === 'FOUR_DAY'
                ? 'Basic Plan Active'
                : 'Premium Plan Active'}
            </span>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        {getLatestActiveSubscription()?.type === 'FOUR_DAY' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10 flex justify-center gap-4"
          >
            <button
              onClick={() => setActiveTab('unlocked')}
              className={`group relative overflow-hidden rounded-xl px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'unlocked'
                  ? 'scale-105 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl'
                  : 'bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-white hover:shadow-lg'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Heart className="size-5" />
                Unlocked Content
              </span>
              {activeTab === 'unlocked' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('locked')}
              className={`group relative overflow-hidden rounded-xl px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'locked'
                  ? 'scale-105 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-xl'
                  : 'bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-white hover:shadow-lg'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Crown className="size-5" />
                Premium Content
              </span>
              {activeTab === 'locked' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </motion.div>
        )}

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid gap-8 md:grid-cols-2"
        >
          {getLatestActiveSubscription()?.type === 'FOUR_DAY'
            ? activeTab === 'unlocked'
              ? // Show 3-4 Days Webinar in unlocked content for 199 plan
                contentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="hover:shadow-3xl group relative overflow-hidden rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105"
                  >
                    {/* Gradient Background */}
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

                      {isContentAccessible(item) ? (
                        <button
                          onClick={() => handleStartLearning(item)}
                          className={`group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r ${item.gradient} px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            <Play className="size-5" />
                            Start Learning
                          </span>
                          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push('/')}
                          className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            <Sparkles className="size-5" />
                            Upgrade to Unlock
                          </span>
                          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              : // Show premium content for 199 plan
                premiumContentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="hover:shadow-3xl group relative overflow-hidden rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105"
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 transition-opacity duration-500 group-hover:opacity-10`}
                    ></div>

                    <div className="relative z-10">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-gray-200 text-gray-500 shadow-lg">
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
                        onClick={() => router.push('/')}
                        className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <Sparkles className="size-5" />
                          Upgrade to 699
                        </span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                      </button>
                    </div>
                  </motion.div>
                ))
            : // Show all content for 699 plan
              premiumContentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="hover:shadow-3xl group relative overflow-hidden rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105"
                >
                  {/* Gradient Background */}
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

                    {item.title === 'All Videos Available Here' ||
                    item.title === 'Live Sunday Sessions' ? (
                      <a
                        href="https://shreemahavidyashaktipeeth.com/subscription/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group/btn relative inline-block w-full overflow-hidden rounded-xl bg-gradient-to-r ${item.gradient} px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <Play className="size-5" />
                          Start Learning
                        </span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleStartLearning(item)}
                        className={`group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r ${item.gradient} px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <Play className="size-5" />
                          Start Learning
                        </span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
        </motion.div>
      </div>
    </div>
  );
}
