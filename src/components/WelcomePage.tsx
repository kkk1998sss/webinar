'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Lock, Play, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import FourDayPlan from './FourDayPlan/FourDayPlan';

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH' | 'PAID_WEBINAR';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function WelcomePage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showFourDayPlan, setShowFourDayPlan] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();

        if (data.subscriptions?.length > 0) {
          const activeSub = data.subscriptions.find(
            (sub: Subscription) => sub.type === 'FOUR_DAY' && sub.isActive
          );
          setSubscription(activeSub);

          if (activeSub) {
            const endDate = new Date(activeSub.endDate);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysRemaining(diffDays);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    router.push('/#pricing');
    return null;
  }

  if (showFourDayPlan) {
    return <FourDayPlan />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Welcome to Your Meditation Journey!
          </h1>
          <p className="text-gray-600">
            Your 3-day access has been activated. Start exploring the content
            below.
          </p>
        </motion.div>

        {/* Access Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 rounded-lg bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-center gap-4">
            <Clock className="size-6 text-blue-600" />
            <div className="text-center">
              <p className="text-sm text-gray-600">Access ends in</p>
              <p className="text-2xl font-bold text-blue-600">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Unlocked Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Your Unlocked Content
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
                <Play className="size-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    3-4 Days Webinar
                  </h3>
                  <p className="text-sm text-gray-600">
                    Access all webinar recordings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFourDayPlan(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Play className="size-5" />
                Start Watching Videos
              </button>
            </div>
          </motion.div>

          {/* Locked Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Premium Content (Locked)
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Lock className="size-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Full Course Library
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hanuman Chalisa, Swar Vigyan, and more
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Calendar className="size-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Live Sunday Sessions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Join our weekly live events
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/#pricing')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Sparkles className="size-5" />
              Upgrade to Full Access
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
