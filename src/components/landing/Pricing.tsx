'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

import { SubscriptionButton } from '../Subscription/SubscriptionButton';

import { Card } from '@/components/ui/card';

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isValid: boolean;
}

const Pricing = () => {
  const { data: session, status } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/subscription');
          const data = await response.json();

          if (data.subscriptions) {
            setSubscriptions(data.subscriptions);
          }
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          toast.error('Failed to fetch subscription status');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchSubscriptions();
    }
  }, [status]);

  const hasActiveFourDayPlan = subscriptions.some(
    (sub) => sub.type === 'FOUR_DAY' && sub.isValid
  );

  const hasActiveSixMonthPlan = subscriptions.some(
    (sub) => sub.type === 'SIX_MONTH' && sub.isValid
  );

  const hasExpiredFourDayPlan = subscriptions.some(
    (sub) => sub.type === 'FOUR_DAY' && !sub.isValid
  );

  const hasExpiredSixMonthPlan = subscriptions.some(
    (sub) => sub.type === 'SIX_MONTH' && !sub.isValid
  );

  // Add check for restricted user
  const isRestrictedUser = session?.user?.email === 'User@gmail.com';

  const handleSubscribe = () => {
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }
  };

  const plans = [
    // Commenting out 199 plan temporarily
    /*
    {
      title: '4-Day Access Plan',
      price: '₹199',
      duration: '/4 days',
      description: 'Get access to 4 exclusive webinars',
      features: [
        'Daily meditation sessions',
        'Expert-led webinars',
        'Progress tracking',
        '24/7 support',
      ],
      planType: 'FOUR_DAY',
      amount: 199,
      highlight: false,
      popular: false,
    },
    */
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
      planType: 'SIX_MONTH',
      amount: 599,
      highlight: true,
      popular: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="dark:to-secondary-dark/20 scroll-mt-24 bg-gradient-to-t from-white to-yellow-50 py-16 dark:from-gray-900"
    >
      <div className="mx-auto max-w-screen-xl px-4 lg:px-6">
        <div className="mx-auto mb-12 max-w-screen-md text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            Choose Your Meditation Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-5 font-light text-gray-600 sm:text-xl dark:text-gray-400"
          >
            Start your mindfulness journey with flexible subscription options
          </motion.p>
        </div>
        <div className="mx-auto max-w-md">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className={`dark:hover:shadow-primary/20 relative overflow-hidden p-6 text-center transition-all duration-300 hover:shadow-xl ${plan.highlight ? 'border-primary dark:border-primary-dark border-2' : 'dark:border-border'}`}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground dark:bg-primary-dark absolute right-0 top-0 rounded-bl-lg px-3 py-1 text-xs font-bold">
                    POPULAR
                  </div>
                )}

                <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  {plan.title}
                </h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  {plan.description}
                </p>

                <div className="my-6 flex items-baseline justify-center">
                  <motion.span
                    className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-5xl font-bold text-transparent dark:from-red-500 dark:to-yellow-400"
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3 + index * 0.2,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    viewport={{ once: true }}
                  >
                    {plan.price}
                  </motion.span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    {plan.duration}
                  </span>
                </div>

                <ul className="mb-8 space-y-3 text-left text-gray-700 dark:text-slate-300">
                  {plan.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <svg
                        className="size-5 text-yellow-500 dark:text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {loading ? (
                  <div className="flex h-10 items-center justify-center">
                    <div className="border-primary dark:border-primary-dark size-6 animate-spin rounded-full border-b-2"></div>
                  </div>
                ) : !session ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={handleSubscribe}
                      className="w-full rounded-lg bg-gradient-to-r from-red-600 to-yellow-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                    >
                      Login to Subscribe
                    </button>
                  </motion.div>
                ) : plan.planType === 'FOUR_DAY' && hasActiveFourDayPlan ? (
                  <div className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-700/30 dark:text-green-300">
                    You have an active 4-Day plan
                  </div>
                ) : plan.planType === 'FOUR_DAY' && hasExpiredFourDayPlan ? (
                  <div className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-700/30 dark:text-green-300">
                    You have purchased the 4-Day plan
                  </div>
                ) : plan.planType === 'SIX_MONTH' && hasActiveSixMonthPlan ? (
                  <div className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-700/30 dark:text-green-300">
                    You have an active 6-Month plan
                  </div>
                ) : plan.planType === 'SIX_MONTH' && hasExpiredSixMonthPlan ? (
                  <div className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-700/30 dark:text-green-300">
                    You have purchased the 6-Month plan
                  </div>
                ) : isRestrictedUser && plan.planType === 'SIX_MONTH' ? (
                  <div className="rounded-md bg-gray-100 p-3 text-sm text-gray-800 dark:bg-gray-700/30 dark:text-gray-300">
                    This plan is not available for your account please register
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SubscriptionButton
                      planType={plan.planType as 'FOUR_DAY' | 'SIX_MONTH'}
                      amount={plan.amount}
                    />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
