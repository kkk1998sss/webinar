'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';

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
  const [isRedirecting, setIsRedirecting] = useState(false);

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
  const isRestrictedUser =
    session?.user?.email === 'user@gmail.com' ||
    session?.user?.email === 'User@gmail.com';

  const handleSubscribe = () => {
    if (!session) {
      window.location.href = '/auth/register';
      return;
    }
  };

  const handleRegister = async () => {
    setIsRedirecting(true);
    try {
      await signOut({ redirect: false });
      window.location.href = '/auth/register';
    } catch (error) {
      console.error('Error during sign out:', error);
      setIsRedirecting(false);
      toast.error('Failed to redirect. Please try again.');
    }
  };

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              className="text-primary dark:text-primary-dark mx-auto size-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Redirecting...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we redirect you to the registration page
          </p>
        </motion.div>
      </div>
    );
  }

  const plans = [
    // Commenting out 199 plan temporarily

    {
      title: '3-Day Access Plan',
      price: '₹199',
      duration: '/3 days',
      description: 'Learn Shree Suktam Sadhana in 3 days',
      features: [
        'Day-1: Learn Shree Suktam chanting',
        'Day-2: Learn Shree Yantra (Maha Meru) pooja',
        'Day-3: Learn guided meditation of Shree Suktam with jagrit mantra',
      ],
      planType: 'FOUR_DAY',
      amount: 199,
      highlight: false,
      popular: false,
    },
    {
      title: '6-Months Premium Subscription',
      price: '₹699',
      duration: '/6 months',
      description: 'Benifits Include:',
      features: [
        'Live session Every Sunday at 10 AM',
        'Learn Shree Suktam in detail and unlock the secrets',
        'Swar Vigyan - Ancient and Powerful breath techniques to control the Destiny',
        'Vigyan Bhairav Tantra - 70+ Ancient and powerful meditation techniques',
        'Hanuman Chalisa with Spiritual meaning',
        'Upanishad Gyan',
        'Kundalini Sadhana',
        'E-books and Many more...',
      ],
      planType: 'SIX_MONTH',
      amount: 699,
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
        <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card
                className={`dark:hover:shadow-primary/20 relative h-full overflow-hidden p-2 text-center transition-all duration-300 hover:shadow-xl ${plan.highlight ? 'border-primary dark:border-primary-dark border-2' : 'dark:border-border'}`}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground dark:bg-primary-dark absolute right-0 top-0 rounded-bl-lg px-2 py-0.5 text-xs font-bold">
                    POPULAR
                  </div>
                )}

                <div className="flex h-full flex-col">
                  <h3 className="mb-0.5 text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.title}
                  </h3>
                  <p className="mb-0.5 text-sm text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </p>

                  <div className="my-2 flex items-baseline justify-center">
                    <motion.span
                      className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-3xl font-bold text-transparent dark:from-red-500 dark:to-yellow-400"
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
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      {plan.duration}
                    </span>
                  </div>

                  <ul className="mb-2 grow space-y-3 text-left text-xs text-gray-700 dark:text-slate-300">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <svg
                          className="size-4 text-yellow-500 dark:text-yellow-400"
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

                  <div className="mt-auto">
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
                          className="w-full rounded-lg bg-gradient-to-r from-red-600 to-yellow-500 px-4 py-1.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                        >
                          Register to subscribe
                        </button>
                      </motion.div>
                    ) : plan.planType === 'FOUR_DAY' && hasActiveFourDayPlan ? (
                      <div className="rounded-md bg-green-100 p-2 text-xs text-green-800 dark:bg-green-700/30 dark:text-green-300">
                        You have an active 3-Day plan
                      </div>
                    ) : plan.planType === 'FOUR_DAY' &&
                      hasExpiredFourDayPlan ? (
                      <div className="rounded-md bg-green-100 p-2 text-xs text-green-800 dark:bg-green-700/30 dark:text-green-300">
                        You have purchased the 3-Day plan
                      </div>
                    ) : plan.planType === 'SIX_MONTH' &&
                      hasActiveSixMonthPlan ? (
                      <div className="rounded-md bg-green-100 p-2 text-xs text-green-800 dark:bg-green-700/30 dark:text-green-300">
                        You have an active 6-Month plan
                      </div>
                    ) : plan.planType === 'SIX_MONTH' &&
                      hasExpiredSixMonthPlan ? (
                      <div className="rounded-md bg-green-100 p-2 text-xs text-green-800 dark:bg-green-700/30 dark:text-green-300">
                        You have purchased the 6-Month plan
                      </div>
                    ) : isRestrictedUser && plan.planType === 'SIX_MONTH' ? (
                      <div className="rounded-md bg-gray-100 p-2 text-xs text-gray-800 dark:bg-gray-700/30 dark:text-gray-300">
                        This plan is not available for your account please{' '}
                        <button
                          onClick={handleRegister}
                          className="text-primary hover:text-primary-dark font-medium underline"
                        >
                          register
                        </button>
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
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
