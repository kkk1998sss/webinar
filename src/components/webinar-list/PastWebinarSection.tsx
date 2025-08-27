import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Webinar } from '@/types/user';

interface Props {
  webinars: Webinar[];
  handleJoinWebinar: (id: string) => void;
}

export function PastWebinarSection({ webinars, handleJoinWebinar }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -520, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 520, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      className="w-full"
    >
      <div className="mb-8 flex justify-center">
        <h2 className="rounded-lg bg-gradient-to-r from-gray-600 to-blue-600 px-8 py-2 text-3xl font-bold text-white shadow-xl">
          Past Webinars
        </h2>
      </div>
      {webinars.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="text-center text-gray-500 dark:text-slate-400">
            <div className="mb-4 text-6xl">📺</div>
            <h3 className="mb-2 text-xl font-semibold">
              No past webinars available
            </h3>
            <p className="text-sm">
              Check back later for completed session recordings
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
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-gray-600/90">
              <ChevronLeft className="size-6 animate-pulse" />
            </div>
          </button>

          {/* Right Arrow Indicator */}
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-gray-600/90">
              <ChevronRight className="size-6 animate-pulse" />
            </div>
          </button>

          <div
            ref={scrollContainerRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-8 overflow-x-auto p-6 px-20"
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
                className="group relative flex w-[90vw] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50/40 via-blue-50/30 to-gray-100/40 shadow-md transition-all duration-300 hover:border-gray-300 hover:shadow-lg md:w-[520px]"
                style={{ minHeight: 260 }}
              >
                {/* Completion Status at the top */}
                <div className="w-full p-4">
                  <div className="mb-4 w-full">
                    <div className="text-center">
                      <div className="mb-2 text-xs font-bold text-gray-700">
                        COMPLETED
                      </div>
                      <div className="flex justify-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md">
                          <span className="text-2xl">✅</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="flex shrink-0 items-center justify-center bg-gradient-to-br from-gray-50/60 to-blue-50/60 md:w-1/3">
                    <div className="flex size-40 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-gray-100 to-blue-100 object-cover shadow-md transition-all duration-300 group-hover:border-gray-300 md:size-32">
                      <span className="text-4xl">📺</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-4 md:w-2/3">
                    <div className="grow">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="rounded-full bg-gradient-to-r from-gray-300 to-blue-200 px-4 py-1 text-xs font-bold tracking-wide text-gray-800 shadow-sm">
                          {webinar.webinarTitle.toUpperCase()}
                        </span>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📅</span>
                          <span className="font-semibold">Date:</span>
                          <span>{webinar.webinarDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">⏰</span>
                          <span className="font-semibold">Time:</span>
                          <span>{webinar.webinarTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📍</span>
                          <span className="font-semibold">Venue:</span>
                          <span>Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">📊</span>
                          <span className="font-semibold">Status:</span>
                          <span className="font-medium text-green-600">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-600">
                            Type:
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            Past Webinar
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinWebinar(webinar.id)}
                        className="relative overflow-hidden rounded-lg border-2 border-gray-400 bg-gradient-to-r from-gray-500 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:from-gray-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-gray-400/50"
                      >
                        <span className="relative z-10">Watch Recording</span>
                        <span className="absolute left-0 top-0 h-full w-0 bg-gray-200 opacity-20 transition-all duration-500 group-hover:w-full" />
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
