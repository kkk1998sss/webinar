// components/subscription/ChoosePlan.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { SubscriptionButton } from './SubscriptionButton';

import { Card } from '@/components/ui/card';

interface ChoosePlanProps {
  webinarId?: string;
}

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export const ChoosePlan = ({ webinarId }: ChoosePlanProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();

        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const hasActiveFourDayPlan = subscriptions.some(
    (sub) =>
      sub.type === 'FOUR_DAY' &&
      sub.isActive &&
      new Date(sub.endDate) > new Date()
  );

  const hasActiveSixMonthPlan = subscriptions.some(
    (sub) =>
      sub.type === 'SIX_MONTH' &&
      sub.isActive &&
      new Date(sub.endDate) > new Date()
  );

  const plans = [
    {
      title: '4-Day Access Plan',
      price: '₹99',
      duration: '/4 days',
      description: 'Get access to 4 exclusive webinars',
      features: [
        'Daily meditation sessions',
        'Expert-led webinars',
        'Progress tracking',
        '24/7 support',
      ],
      planType: 'FOUR_DAY' as const,
      amount: 99,
      highlight: false,
    },
    {
      title: '6-Month Membership',
      price: '₹599',
      duration: '/6 months',
      description: 'Unlock 70+ meditations & courses',
      features: [
        'Full course library access',
        'Premium content',
        'Advanced analytics',
        'Priority support',
        'New content weekly',
      ],
      planType: 'SIX_MONTH' as const,
      amount: 599,
      highlight: true,
    },
  ];

  return (
    <div className="py-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center text-2xl font-bold"
      >
        Choose Your Plan
      </motion.h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card
              className={`relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl ${plan.highlight ? 'border-2 border-blue-500' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                  BEST VALUE
                </div>
              )}

              <h2 className="mb-3 text-xl font-bold">{plan.title}</h2>
              <p className="mb-4 text-gray-600">{plan.description}</p>

              <div className="my-4 flex items-baseline">
                <motion.span
                  className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + index * 0.2,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  {plan.price}
                </motion.span>
                <span className="ml-2 text-gray-500">{plan.duration}</span>
              </div>

              <ul className="mb-6 space-y-2 text-left">
                {plan.features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                  >
                    <svg
                      className="size-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {loading ? (
                <div className="flex h-10 items-center justify-center">
                  <div className="size-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : plan.planType === 'FOUR_DAY' && hasActiveFourDayPlan ? (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  You already have an active 4-Day plan
                </div>
              ) : plan.planType === 'SIX_MONTH' && hasActiveSixMonthPlan ? (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  You already have an active 6-Month plan
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SubscriptionButton
                    planType={plan.planType}
                    amount={plan.amount}
                    webinarId={webinarId}
                  />
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
