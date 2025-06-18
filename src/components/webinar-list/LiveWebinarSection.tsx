import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

import { Webinar } from '@/types/user';

interface Props {
  webinars: Webinar[];
  countdowns: Record<string, string>;
  getCountdown: (date: string, time: string) => string;
  handleJoinWebinar: (id: string) => void;
  theme: string;
}

export function LiveWebinarSection({ webinars, handleJoinWebinar }: Props) {
  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 dark:from-blue-600 dark:to-purple-700">
        <h3 className="text-lg font-semibold text-white sm:text-xl">
          📅 Live Webinars
        </h3>
      </div>
      {webinars.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400">
          No live webinars available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-slate-400">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-500 sm:table-cell dark:text-slate-400">
                  Date
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-500 sm:table-cell dark:text-slate-400">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {webinars.map((webinar, index) => (
                <motion.tr
                  key={webinar.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="dark:hover:bg-slate-750 border-b border-gray-100 transition-colors duration-200 hover:bg-blue-50 dark:border-slate-700"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                        <Video className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 dark:text-slate-200">
                          {webinar.webinarTitle}
                        </span>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 sm:hidden dark:text-slate-400">
                          <span>{webinar.webinarDate}</span>
                          <span>•</span>
                          <span>{webinar.webinarTime}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 sm:table-cell dark:text-slate-400">
                    {webinar.webinarDate}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {webinar.webinarTime}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-500/20 dark:text-green-300">
                      <span className="mr-1 flex size-2 rounded-full bg-green-500 dark:bg-green-400"></span>
                      Live
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinWebinar(webinar.id)}
                      className="w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:from-blue-600 hover:to-purple-700 sm:w-auto dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800"
                    >
                      Join Now
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
