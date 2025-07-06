'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        className="flex w-full max-w-2xl flex-col items-center rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="flex size-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-12 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="mb-4 text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white">
            Thank You for Your Purchase!
          </h1>

          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            Your payment has been processed successfully. You now have access to
            the webinar you purchased.
          </p>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
              What&apos;s Next?
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Access to the webinar you purchased
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Join the live session at the scheduled time
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Receive webinar materials and resources
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Get email notifications about the webinar
                </span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
            >
              <ArrowLeft className="size-5" />
              Go to Dashboard
            </Button>

            <Button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-xl"
            >
              <Sparkles className="size-5" />
              View My Webinars
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-sm text-gray-500 dark:text-gray-400"
          >
            You will receive a confirmation email with webinar details shortly.
            If you have any questions, please don&apos;t hesitate to contact our
            support team.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
