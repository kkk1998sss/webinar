import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

import { Webinar } from '@/types/user';

interface Props {
  webinars: Webinar[];
  handleJoinWebinar: (id: string) => void;
}

export function UpcomingWebinarSection({ webinars, handleJoinWebinar }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 sm:p-4 dark:from-purple-600 dark:to-indigo-700">
        <h3 className="text-lg font-semibold text-white sm:text-xl">
          🔮 Upcoming/Free Webinars
        </h3>
      </div>
      {webinars.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400">
          No upcoming/free webinars available.
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
                  className="dark:hover:bg-slate-750 border-b border-gray-100 transition-colors duration-200 hover:bg-purple-50 dark:border-slate-700"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20">
                        <Video className="size-4 text-purple-600 dark:text-purple-400" />
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
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                      <span className="mr-1 flex size-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                      Upcoming
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinWebinar(webinar.id)}
                      className="w-full rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:from-purple-600 hover:to-indigo-700 sm:w-auto dark:from-purple-600 dark:to-indigo-700 dark:hover:from-purple-700 dark:hover:to-indigo-800"
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
