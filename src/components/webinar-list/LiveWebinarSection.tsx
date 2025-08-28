import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';

import { Webinar } from '@/types/user';

interface Props {
  webinars: Webinar[];
  countdowns: Record<string, string>;
  getCountdown: (date: string, time: string) => string;
  handleJoinWebinar: (id: string) => void;
  theme: string;
}

export function LiveWebinarSection({ webinars, handleJoinWebinar }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="w-full"
    >
      <div className="mb-8 flex justify-center">
        <h2 className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-2 text-3xl font-bold text-white shadow-xl">
          📅 Today&apos;s Webinars
        </h2>
      </div>
      {webinars.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="text-center text-gray-500 dark:text-slate-400">
            <div className="mb-4 text-6xl">📅</div>
            <h3 className="mb-2 text-xl font-semibold">
              No live webinars available
            </h3>
            <p className="text-sm">
              Check back later for live session announcements
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Left Arrow Indicator */}
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-blue-600/90">
              <ChevronLeft className="size-6 animate-pulse" />
            </div>
          </button>

          {/* Right Arrow Indicator */}
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-blue-600/90">
              <ChevronRight className="size-6 animate-pulse" />
            </div>
          </button>

          <div
            ref={scrollContainerRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto p-6 px-20"
          >
            {webinars.map((webinar) => (
              <motion.div
                key={webinar.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 6px 24px 0 rgba(59, 130, 246, 0.18)',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="group relative flex w-[90vw] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-blue-100/40 shadow-md transition-all duration-300 hover:border-blue-300 hover:shadow-lg md:w-[400px]"
                style={{ minHeight: 220 }}
              >
                {/* Live Badge at the top */}
                <div className="w-full p-3">
                  <div className="mb-3 w-full">
                    <div className="text-center">
                      <div className="mb-2 text-xs font-bold text-blue-800">
                        LIVE NOW
                      </div>
                      <div className="flex justify-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md">
                          <span className="text-xl">🔴</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-50/60 to-purple-50/60 p-3">
                    <div className="flex size-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-purple-100 object-cover shadow-md transition-all duration-300 group-hover:border-blue-300">
                      <span className="text-3xl">📹</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-3">
                    <div className="grow">
                      <div className="mb-2 flex items-center justify-center">
                        <div className="group relative">
                          <span
                            className="inline-block max-w-[200px] truncate rounded-full bg-gradient-to-r from-blue-300 to-purple-200 px-3 py-1 text-xs font-bold tracking-wide text-blue-800 shadow-sm"
                            title={webinar.webinarTitle}
                          >
                            {webinar.webinarTitle.toUpperCase()}
                          </span>
                          {/* Tooltip for long titles */}
                          {webinar.webinarTitle.length > 25 && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <div className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                                {webinar.webinarTitle}
                                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-1 text-xs text-blue-800">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">📅</span>
                          <span className="font-semibold">Date:</span>
                          <span>{webinar.webinarDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">⏰</span>
                          <span className="font-semibold">Time:</span>
                          <span>{webinar.webinarTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">📍</span>
                          <span className="font-semibold">Venue:</span>
                          <span>Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">📊</span>
                          <span className="font-semibold">Status:</span>
                          <span className="font-medium text-green-600">
                            Live Now
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600">
                            Type:
                          </span>
                          <span className="text-xs font-medium text-blue-500">
                            Live Webinar
                          </span>
                        </div>
                      </div>

                      {/* Live Features */}
                      <div className="mb-3 rounded-lg bg-blue-50/50 p-2 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                          <span className="flex size-2 animate-pulse rounded-full bg-red-500"></span>
                          <span>Live Streaming</span>
                          <span>•</span>
                          <span>Real-time Interaction</span>
                          <span>•</span>
                          <span>Q&A Session</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinWebinar(webinar.id)}
                        className="relative overflow-hidden rounded-lg border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Video className="size-3" />
                          Join Live
                        </span>
                        <span className="absolute left-0 top-0 h-full w-0 bg-blue-200 opacity-20 transition-all duration-500 group-hover:w-full" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
