'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  compareAsc,
  compareDesc,
  differenceInSeconds,
  format,
  isFuture,
  isToday,
  isValid,
  parse,
  parseISO,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Plus, Search, Video, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import WebinarSetupPage from './webinarsetup1';

import { SubscriptionModal } from '@/components/Models/SubscriptionModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Webinar } from '@/types/user';

interface Session {
  user?: {
    name?: string;
    isAdmin?: boolean;
  };
}

// Create empty countdowns object outside component
const initialCountdowns: Record<string, string> = {};

export default function WebinarDashboard({ session }: { session: Session }) {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWebinars, setOpenWebinars] = useState<string[]>([]);
  const [countdowns, setCountdowns] =
    useState<Record<string, string>>(initialCountdowns);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showNewWebinarDialog, setShowNewWebinarDialog] = useState(false);
  const [selectedWebinarType, setSelectedWebinarType] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    // Simulate page load animation
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const res = await fetch('/api/webinar');
        const data = await res.json();
        if (data.success) {
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

  const handleNewWebinar = (type: string) => {
    setSelectedWebinarType(type);
    setShowNewWebinarDialog(true);
  };

  const confirmNewWebinar = () => {
    if (selectedWebinarType) {
      setOpenWebinars((prev) => [...prev, selectedWebinarType]);
      setShowNewWebinarDialog(false);
      setSelectedWebinarType(null);
    }
  };

  // Filter webinars based on search query
  const filterWebinars = useCallback(
    (webinars: Webinar[]) => {
      if (!searchQuery.trim()) return webinars;

      const query = searchQuery.toLowerCase().trim();
      return webinars.filter(
        (webinar) =>
          (webinar.webinarTitle?.toLowerCase() || '').includes(query) ||
          (webinar.webinarDate?.toLowerCase() || '').includes(query) ||
          (webinar.webinarTime?.toLowerCase() || '').includes(query)
      );
    },
    [searchQuery]
  );

  // Sort webinars based on sort order
  const sortWebinars = useCallback(
    (webinars: Webinar[]) => {
      if (sortOrder === 'newest') {
        return [...webinars].sort(
          (a, b) =>
            new Date(b.webinarDate).getTime() -
            new Date(a.webinarDate).getTime()
        );
      } else {
        return [...webinars].sort(
          (a, b) =>
            new Date(a.webinarDate).getTime() -
            new Date(b.webinarDate).getTime()
        );
      }
    },
    [sortOrder]
  );

  // Memoize filtered and sorted webinars
  const filteredAndSortedWebinars = useMemo(() => {
    return sortWebinars(filterWebinars(webinars));
  }, [webinars, filterWebinars, sortWebinars]);

  // Memoize categorized webinars
  const [todaysWebinars, upcomingWebinars, pastWebinars] = useMemo(() => {
    const today: Webinar[] = [];
    const upcoming: Webinar[] = [];
    const past: Webinar[] = [];

    filteredAndSortedWebinars.forEach((webinar) => {
      const date = parseISO(webinar.webinarDate);
      if (isToday(date)) {
        today.push(webinar);
      } else if (isFuture(date)) {
        upcoming.push(webinar);
      } else {
        past.push(webinar);
      }
    });

    today.sort((a, b) =>
      compareAsc(parseISO(a.webinarDate), parseISO(b.webinarDate))
    );
    upcoming.sort((a, b) =>
      compareAsc(parseISO(a.webinarDate), parseISO(b.webinarDate))
    );
    past.sort((a, b) =>
      compareDesc(parseISO(a.webinarDate), parseISO(b.webinarDate))
    );

    return [today, upcoming, past];
  }, [filteredAndSortedWebinars]);

  // Countdown timer logic
  const getCountdown = (webinarDate: string, webinarTime: string) => {
    const parsedDate = parseISO(webinarDate);
    const datePart = format(parsedDate, 'yyyy-MM-dd');
    const combined = `${datePart} ${webinarTime}`;
    const finalDate = parse(combined, 'yyyy-MM-dd HH:mm', new Date());

    if (!isValid(finalDate)) {
      return 'Invalid webinar date/time';
    }

    const now = new Date();
    const diffSeconds = differenceInSeconds(finalDate, now);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    const remainingSeconds = diffSeconds % 60;

    if (diffSeconds <= 0) {
      return 'Already started';
    }

    return `${String(diffHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const newCountdowns = { ...prev };
        todaysWebinars.forEach((webinar) => {
          const count = getCountdown(webinar.webinarDate, webinar.webinarTime);
          if (prev[webinar.id] !== count) {
            newCountdowns[webinar.id] = count;
          }
        });
        return JSON.stringify(newCountdowns) === JSON.stringify(prev)
          ? prev
          : newCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [todaysWebinars]);

  const handleJoinWebinar = (id: string) => {
    // If user is admin, allow direct access without subscription check
    if (session.user?.isAdmin) {
      router.push(`/users/playing-area/${id}`);
      return;
    }

    router.push(`/users/playing-area/${id}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      transition: {
        duration: 0.2,
      },
    },
  };

  if (!isPageLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="container mx-auto px-6 py-10">
        <motion.div
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.h2
            className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Webinars
          </motion.h2>

          <motion.div
            className="flex flex-col items-center gap-3 sm:flex-row"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search webinars..."
                className="w-full rounded-full border border-gray-200 py-2 pl-10 pr-4 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
              )}
            </div>

            <select
              className="rounded-full border border-gray-200 px-4 py-2 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            {session.user?.isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
                      disabled={openWebinars.length > 0}
                    >
                      <Plus className="mr-2 size-4" />
                      New Webinar
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm">
                  <DropdownMenuItem
                    onClick={() => handleNewWebinar('Automated Webinar')}
                    className="cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                    disabled={openWebinars.length > 0}
                  >
                    <Play className="mr-2 size-4 text-blue-500" />
                    New Automated Webinar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleNewWebinar('Webinar Series')}
                    className="cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                    disabled={openWebinars.length > 0}
                  >
                    <Video className="mr-2 size-4 text-purple-500" />
                    New Webinar Series
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
        </motion.div>

        {/* New Webinar Dialog */}
        <AnimatePresence>
          {showNewWebinarDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewWebinarDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="mx-4 w-full overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-sm sm:max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    {selectedWebinarType === 'Automated Webinar' ? (
                      <Play className="size-5 text-blue-500" />
                    ) : (
                      <Video className="size-5 text-purple-500" />
                    )}
                    <h2 className="text-xl font-bold">
                      Create {selectedWebinarType}
                    </h2>
                  </div>

                  <p className="text-gray-500">
                    You&apos;re about to create a new{' '}
                    {selectedWebinarType?.toLowerCase()}. This will open a setup
                    wizard where you can configure all the details for your
                    webinar.
                  </p>

                  <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                    <p className="font-medium">
                      What you&apos;ll be able to do:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>Set webinar title, date, and time</li>
                      <li>Configure attendee settings and access controls</li>
                      <li>Upload content and resources</li>
                      <li>Set up automated reminders and notifications</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewWebinarDialog(false)}
                      className="rounded-full border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmNewWebinar}
                      className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
                    >
                      Create Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditionally show this block if openWebinars > 0 */}
        <AnimatePresence>
          {openWebinars.length > 0 && (
            <motion.div
              className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.ul
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {openWebinars.map((webinar, index) => (
                  <motion.li
                    key={index}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                    variants={itemVariants}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {webinar} Setup
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOpenWebinars(
                            openWebinars.filter((_, i) => i !== index)
                          );
                        }}
                        className="size-8 rounded-full p-0 hover:bg-gray-200"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <WebinarSetupPage />
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show this only if openWebinars is empty */}
        {openWebinars.length === 0 &&
          (!loading && webinars.length === 0 ? (
            <motion.div
              className="rounded-xl border border-gray-100 bg-white py-20 text-center shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-blue-100"
              >
                <Video className="size-10 text-blue-500" />
              </motion.div>
              <motion.p
                className="text-xl font-medium text-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                You haven&apos;t created any awesome webinars yet 😞
              </motion.p>
              <motion.p
                className="mx-auto mt-3 max-w-md text-gray-500"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                All your webinars will appear on this screen. Try creating a new
                webinar by clicking the button below.
              </motion.p>

              {session.user?.isAdmin && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleNewWebinar('General Webinar')}
                      className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
                      disabled={openWebinars.length > 0}
                    >
                      <Plus className="mr-2 size-4" />
                      New Webinar
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {/* Calendar-style date header */}
                <div className="flex w-full flex-col gap-6 md:flex-row">
                  <motion.div
                    className="w-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-md md:w-1/3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="mb-2 text-center">
                      <motion.h2
                        className="text-4xl font-bold"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        {format(new Date(), 'eeee')}
                      </motion.h2>
                      <motion.h3
                        className="text-6xl font-bold"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        {format(new Date(), 'do')}
                      </motion.h3>
                      <motion.p
                        className="text-xl"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        {format(new Date(), 'MMMM yyyy')}
                      </motion.p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="w-full space-y-4 px-4 md:w-2/3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    {/* Today's Webinars */}
                    {todaysWebinars.length > 0 && (
                      <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <motion.h3
                          className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-semibold text-transparent"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          Today&apos;s Webinars
                        </motion.h3>
                        <motion.div
                          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {todaysWebinars.map((webinar) => (
                            <motion.div
                              key={webinar.id}
                              className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-lg"
                              variants={cardVariants}
                              whileHover="hover"
                            >
                              <motion.div
                                className="absolute right-0 top-0 rounded-bl-lg rounded-tr-xl bg-green-500 px-2 py-1 text-xs font-bold text-white"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                LIVE
                              </motion.div>
                              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                                {webinar.webinarTitle}
                              </h3>
                              <div className="mb-4 space-y-2">
                                <p className="flex items-center justify-between">
                                  <span className="font-medium text-gray-600">
                                    Time:
                                  </span>
                                  <span className="font-semibold text-blue-600">
                                    {webinar.webinarTime}
                                  </span>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span className="font-medium text-gray-600">
                                    Starts in:
                                  </span>
                                  <motion.span
                                    className="font-mono font-bold text-blue-500"
                                    animate={{
                                      color: ['#3b82f6', '#8b5cf6', '#3b82f6'],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }}
                                  >
                                    {countdowns[webinar.id] ||
                                      getCountdown(
                                        webinar.webinarDate,
                                        webinar.webinarTime
                                      )}
                                  </motion.span>
                                </p>
                              </div>
                              <SubscriptionModal
                                open={showSubscriptionModal}
                                onOpenChange={setShowSubscriptionModal}
                                webinarId={webinar.id}
                              />
                              {/* Join Now Button */}
                              <motion.button
                                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
                                onClick={() => handleJoinWebinar(webinar.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                Join Now
                              </motion.button>
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.section>
                    )}
                  </motion.div>
                </div>

                {/* Tables */}
                <motion.div
                  className="mt-8 space-y-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  {todaysWebinars.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                        <h3 className="text-xl font-semibold text-white">
                          📅 Today&apos;s Webinars
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Title
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Time
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {todaysWebinars.map((webinar, index) => (
                              <motion.tr
                                key={webinar.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="border-b border-gray-100 transition-colors duration-200 hover:bg-blue-50"
                                whileHover={{
                                  scale: 1.01,
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                }}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                                      <Video className="size-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-800">
                                      {webinar.webinarTitle}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {webinar.webinarDate}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="size-4 text-blue-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-gray-600">
                                      {webinar.webinarTime}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    <span className="mr-1 flex size-2 rounded-full bg-green-500"></span>
                                    Live
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      handleJoinWebinar(webinar.id)
                                    }
                                    className="rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:from-blue-600 hover:to-purple-700"
                                  >
                                    Join Now
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ) : searchQuery ? (
                    <motion.div
                      className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-gray-500">
                        No webinars found matching your search for today.
                      </p>
                    </motion.div>
                  ) : null}

                  {upcomingWebinars.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
                    >
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
                        <h3 className="text-xl font-semibold text-white">
                          🔮 Upcoming Webinars
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Title
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Time
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {upcomingWebinars.map((webinar, index) => (
                              <motion.tr
                                key={webinar.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="border-b border-gray-100 transition-colors duration-200 hover:bg-purple-50"
                                whileHover={{
                                  scale: 1.01,
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                }}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-purple-100">
                                      <Video className="size-4 text-purple-600" />
                                    </div>
                                    <span className="font-medium text-gray-800">
                                      {webinar.webinarTitle}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {webinar.webinarDate}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="size-4 text-purple-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-gray-600">
                                      {webinar.webinarTime}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    <span className="mr-1 flex size-2 rounded-full bg-blue-500"></span>
                                    Upcoming
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      handleJoinWebinar(webinar.id)
                                    }
                                    className="rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:from-purple-600 hover:to-indigo-700"
                                  >
                                    Join Now
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ) : searchQuery ? (
                    <motion.div
                      className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-gray-500">
                        No upcoming webinars found matching your search.
                      </p>
                    </motion.div>
                  ) : null}

                  {pastWebinars.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
                    >
                      <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4">
                        <h3 className="text-xl font-semibold text-white">
                          🕰 Past Webinars
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Title
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Time
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pastWebinars.map((webinar, index) => (
                              <motion.tr
                                key={webinar.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50"
                                whileHover={{
                                  scale: 1.01,
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                }}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                                      <Video className="size-4 text-gray-600" />
                                    </div>
                                    <span className="font-medium text-gray-800">
                                      {webinar.webinarTitle}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {webinar.webinarDate}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="size-4 text-gray-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-gray-600">
                                      {webinar.webinarTime}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                    <span className="mr-1 flex size-2 rounded-full bg-gray-500"></span>
                                    Completed
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      handleJoinWebinar(webinar.id)
                                    }
                                    className="rounded-md bg-gradient-to-r from-gray-600 to-gray-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:from-gray-700 hover:to-gray-800"
                                  >
                                    View Recording
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ) : searchQuery ? (
                    <motion.div
                      className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-gray-500">
                        No past webinars found matching your search.
                      </p>
                    </motion.div>
                  ) : null}

                  {searchQuery &&
                    todaysWebinars.length === 0 &&
                    upcomingWebinars.length === 0 &&
                    pastWebinars.length === 0 && (
                      <motion.div
                        className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4">
                          <svg
                            className="mx-auto size-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                          No results found
                        </h3>
                        <p className="mb-4 text-gray-500">
                          We couldn&apos;t find any webinars matching &quot;
                          {searchQuery}&quot;
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-full bg-blue-100 px-4 py-2 text-blue-600 transition-colors duration-300 hover:bg-blue-200"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </motion.button>
                      </motion.div>
                    )}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
      </main>

      <motion.footer
        className="mt-8 border-t border-gray-100 py-6 text-center text-sm text-gray-500"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="mb-2 flex justify-center space-x-4">
          <motion.a
            href="/Terms&services"
            className="transition-colors duration-300 hover:text-blue-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Terms of Service
          </motion.a>
          <span>|</span>
          <motion.a
            href="/Privacy"
            className="transition-colors duration-300 hover:text-blue-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Privacy Policy
          </motion.a>
          <span>|</span>
          <motion.a
            href="/copyright"
            className="transition-colors duration-300 hover:text-blue-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            DMCA & Copyright Policy
          </motion.a>
        </div>
        <motion.p
          className="mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          &copy; 2024 WebinarKit. All rights reserved.
        </motion.p>
      </motion.footer>
    </motion.div>
  );
}
