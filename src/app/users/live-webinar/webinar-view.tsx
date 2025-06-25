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
import { ArrowLeft, Play, Plus, Search, Video, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import WebinarSetupPage from './webinarsetup1';

import { ScheduleModal } from '@/components/Models/ScheduleModal';
import { SubscriptionModal } from '@/components/Models/SubscriptionModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LiveWebinarSection } from '@/components/webinar-list/LiveWebinarSection';
import { PaidWebinarSection } from '@/components/webinar-list/PaidWebinarSection';
import { PastWebinarSection } from '@/components/webinar-list/PastWebinarSection';
import { UpcomingWebinarSection } from '@/components/webinar-list/UpcomingWebinarSection';
import { useMounted } from '@/hooks/use-mounted';
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const mounted = useMounted();

  const fetchWebinars = useCallback(async () => {
    try {
      setLoading(true);
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
  }, []);

  useEffect(() => {
    // Simulate page load animation
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchWebinars();
  }, [fetchWebinars]);

  const handleNewWebinar = (type: string) => {
    setSelectedWebinarType(type);
    if (type === 'Automated Webinar') {
      setShowNewWebinarDialog(true);
    } else {
      setShowScheduleModal(true);
    }
  };

  const confirmNewWebinar = () => {
    if (selectedWebinarType) {
      setOpenWebinars((prev) => [...prev, selectedWebinarType]);
      setShowScheduleModal(false);
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
  const [todaysWebinars, upcomingWebinars, pastWebinars, paidWebinars] =
    useMemo(() => {
      const today: Webinar[] = [];
      const upcoming: Webinar[] = [];
      const past: Webinar[] = [];
      const paid: Webinar[] = [];

      filteredAndSortedWebinars.forEach((webinar) => {
        const date = parseISO(webinar.webinarDate);
        if (isToday(date)) {
          today.push(webinar);
        } else if (isFuture(date)) {
          upcoming.push(webinar);
          // PAID LOGIC BASED ON SCHEMA
          if (
            webinar &&
            webinar.isPaid &&
            typeof webinar.paidAmount === 'number' &&
            webinar.paidAmount > 0
          ) {
            paid.push(webinar);
          }
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
      paid.sort((a, b) =>
        compareAsc(parseISO(a.webinarDate), parseISO(b.webinarDate))
      );

      return [today, upcoming, past, paid];
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

  const cardVariants = useMemo(
    () => ({
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
        boxShadow:
          mounted && theme === 'dark'
            ? '0 10px 25px rgba(0,0,0,0.3)'
            : '0 10px 25px rgba(0,0,0,0.1)',
        transition: {
          duration: 0.2,
        },
      },
    }),
    [mounted, theme]
  );

  if (!isPageLoaded) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-slate-900">
        <div className="text-lg font-semibold text-gray-600 dark:text-slate-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <motion.div
          className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </motion.button>
            <motion.h2
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl dark:from-blue-400 dark:to-purple-400"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Webinars
            </motion.h2>
          </div>

          <motion.div
            className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search webinars..."
                className="w-full rounded-full border border-gray-200 py-2 pl-10 pr-4 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="size-4" />
                </motion.button>
              )}
            </div>

            <select
              className="w-full rounded-full border border-gray-200 px-4 py-2 outline-none transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:w-auto dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:ring-blue-500/30"
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
                    className="w-full sm:w-auto"
                  >
                    <Button
                      className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:text-white dark:hover:from-blue-600 dark:hover:to-purple-600"
                      disabled={openWebinars.length > 0}
                    >
                      <Plus className="mr-2 size-4" />
                      New Webinar
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm sm:w-auto dark:border-slate-700 dark:bg-slate-800/90">
                  <DropdownMenuItem
                    onClick={() => handleNewWebinar('Automated Webinar')}
                    className="cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    disabled={openWebinars.length > 0}
                  >
                    <Play className="mr-2 size-4 text-blue-500 dark:text-blue-400" />
                    New Automated Webinar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleNewWebinar('Paid Webinar')}
                    className="cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    disabled={openWebinars.length > 0}
                  >
                    <Video className="mr-2 size-4 text-purple-500 dark:text-purple-400" />
                    Create Paid Webinar
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm dark:bg-black/70"
              onClick={() => setShowNewWebinarDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="mx-4 w-full overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-sm sm:max-w-md dark:border-slate-700 dark:bg-slate-800/95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    {selectedWebinarType === 'Automated Webinar' ? (
                      <Play className="size-5 text-blue-500 dark:text-blue-400" />
                    ) : (
                      <Video className="size-5 text-purple-500 dark:text-purple-400" />
                    )}
                    <h2 className="text-xl font-bold dark:text-slate-100">
                      Create {selectedWebinarType}
                    </h2>
                  </div>

                  <p className="text-gray-500 dark:text-slate-400">
                    You&apos;re about to create a new{' '}
                    {selectedWebinarType?.toLowerCase()}. This will open a setup
                    wizard where you can configure all the details for your
                    webinar.
                  </p>

                  <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-slate-700 dark:text-blue-300">
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
                      className="rounded-full border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmNewWebinar}
                      className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:text-white dark:hover:from-blue-600 dark:hover:to-purple-600"
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
              className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-600 dark:bg-slate-700"
                    variants={itemVariants}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
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
                        className="size-8 rounded-full p-0 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-600"
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
              className="rounded-xl border border-gray-100 bg-white py-20 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800"
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
                className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20"
              >
                <Video className="size-10 text-blue-500 dark:text-blue-400" />
              </motion.div>
              <motion.p
                className="text-xl font-medium text-gray-700 dark:text-slate-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                You haven&apos;t created any awesome webinars yet 😞
              </motion.p>
              <motion.p
                className="mx-auto mt-3 max-w-md text-gray-500 dark:text-slate-400"
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
                      className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:text-white dark:hover:from-blue-600 dark:hover:to-purple-600"
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
              className="mt-6 space-y-4 sm:mt-8 sm:space-y-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              {/* Calendar-style date header */}
              <div className="flex w-full flex-col gap-4 md:flex-row">
                <motion.div
                  className="w-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white shadow-md md:w-1/3 dark:from-blue-600 dark:to-purple-700 dark:text-slate-100"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="mb-2 text-center">
                    <motion.h2
                      className="text-3xl font-bold sm:text-4xl dark:text-slate-100"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      {mounted && format(new Date(), 'eeee')}
                    </motion.h2>
                    <motion.h3
                      className="text-5xl font-bold sm:text-6xl dark:text-slate-100"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      {mounted && format(new Date(), 'do')}
                    </motion.h3>
                    <motion.p
                      className="text-lg sm:text-xl dark:text-slate-300"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      {mounted && format(new Date(), 'MMMM yyyy')}
                    </motion.p>
                  </div>
                </motion.div>

                <motion.div
                  className="w-full space-y-4 px-2 md:w-2/3 md:px-4"
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
                        className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl dark:from-blue-400 dark:to-purple-400"
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
                            className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg sm:p-5 dark:border-slate-600 dark:bg-slate-700"
                            variants={cardVariants}
                            whileHover="hover"
                          >
                            <motion.div
                              className="absolute right-0 top-0 rounded-bl-lg rounded-tr-xl bg-green-500 px-2 py-1 text-xs font-bold text-white dark:bg-green-600"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              LIVE
                            </motion.div>
                            <h3 className="mb-3 text-lg font-semibold text-gray-800 sm:text-xl dark:text-slate-100">
                              {webinar.webinarTitle}
                            </h3>
                            <div className="mb-4 space-y-2">
                              <p className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 sm:text-base dark:text-slate-400">
                                  Time:
                                </span>
                                <span className="text-sm font-semibold text-blue-600 sm:text-base dark:text-blue-400">
                                  {webinar.webinarTime}
                                </span>
                              </p>
                              <p className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 sm:text-base dark:text-slate-400">
                                  Starts in:
                                </span>
                                <motion.span
                                  className="font-mono text-sm font-bold text-blue-500 sm:text-base dark:text-blue-400"
                                  animate={{
                                    color: [
                                      theme === 'dark' ? '#60a5fa' : '#3b82f6',
                                      theme === 'dark' ? '#a78bfa' : '#8b5cf6',
                                      theme === 'dark' ? '#60a5fa' : '#3b82f6',
                                    ],
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
                            <motion.button
                              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-green-600 hover:to-emerald-600 sm:text-base dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700"
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
            </motion.div>
          ))}
      </main>

      {/* Add ScheduleModal */}
      <ScheduleModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        onSuccess={fetchWebinars}
        webinarType={
          selectedWebinarType as 'Automated Webinar' | 'Paid Webinar'
        }
      />

      {/* New Structure - Sections for different webinar types */}
      <div className="mt-8 space-y-6 px-8 ">
        <LiveWebinarSection
          webinars={todaysWebinars}
          countdowns={countdowns}
          getCountdown={getCountdown}
          handleJoinWebinar={handleJoinWebinar}
          theme={theme ?? 'theme'}
        />

        <UpcomingWebinarSection
          webinars={upcomingWebinars.filter(
            (webinar) =>
              !(
                webinar.isPaid &&
                typeof webinar.paidAmount === 'number' &&
                webinar.paidAmount > 0
              )
          )}
          handleJoinWebinar={handleJoinWebinar}
        />

        <PaidWebinarSection
          webinars={paidWebinars}
          handleJoinWebinar={handleJoinWebinar}
        />

        <PastWebinarSection
          webinars={pastWebinars}
          handleJoinWebinar={handleJoinWebinar}
        />
      </div>
    </motion.div>
  );
}
