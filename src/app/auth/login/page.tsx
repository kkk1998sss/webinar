'use client';

import { useEffect, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';

import { SubscriptionButton } from '@/components/Subscription/SubscriptionButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Subscription {
  type: 'FOUR_DAY' | 'SIX_MONTH' | 'PAID_WEBINAR';
  isValid: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Track 3-day plan state for modal
  const [hasActiveFourDayPlan, setHasActiveFourDayPlan] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    console.log('Subscription modal state changed:', showSubscriptionModal);
  }, [showSubscriptionModal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = '';
        switch (result.error) {
          case 'Configuration':
            setError('Invalid email or password');
            break;
          case 'CredentialsSignin':
          case 'Invalid email or password':
          case 'Missing email or password':
            setError(result.error);
            break;
          case 'AccessDenied':
            setError('Access denied. Please check your credentials.');
            break;
          case 'Verification':
            setError('Please verify your email before logging in.');
            break;
          default:
            errorMessage = result.error.toLowerCase();
            if (
              errorMessage.includes('invalid') ||
              errorMessage.includes('incorrect') ||
              errorMessage.includes('wrong') ||
              errorMessage.includes('not found')
            ) {
              setError('Invalid email or password. Please try again.');
            } else {
              setError('An error occurred during login. Please try again.');
            }
        }
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Wait a bit for the session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get session directly after successful login
        const session = await getSession();
        console.log('session', session);

        if (session?.user?.isAdmin) {
          // Force a page reload to ensure session is properly set
          window.location.href = '/admin/users';
          return;
        }

        // Check if user is restricted
        if (email === 'user@gmail.com') {
          router.push('/dashboard');
          return;
        }

        // Check subscription status
        try {
          const response = await fetch('/api/subscription');
          const data = await response.json();
          console.log('Subscription check response:', data);

          if (data.subscriptions && Array.isArray(data.subscriptions)) {
            const hasActiveSixMonthPlan = data.subscriptions.some(
              (sub: Subscription) => sub.type === 'SIX_MONTH' && sub.isValid
            );
            const hasExpiredSixMonthPlan = data.subscriptions.some(
              (sub: Subscription) => sub.type === 'SIX_MONTH' && !sub.isValid
            );
            const hasActiveFourDay = data.subscriptions.some(
              (sub: Subscription) => sub.type === 'FOUR_DAY' && sub.isValid
            );
            const hasExpiredFourDay = data.subscriptions.some(
              (sub: Subscription) => sub.type === 'FOUR_DAY' && !sub.isValid
            );

            setHasActiveFourDayPlan(hasActiveFourDay);

            if (hasActiveSixMonthPlan || hasExpiredSixMonthPlan) {
              // User already has a 6-month plan (active or expired)
              router.push('/dashboard');
              return;
            }

            if (hasActiveFourDay || hasExpiredFourDay) {
              // User already has a 3-day plan (active or expired)
              router.push('/dashboard');
              return;
            }
          }

          // If no subscription or not 6-month plan, show subscription modal
          setShowSubscriptionModal(true);
        } catch (error) {
          console.error('Error checking subscription:', error);
          // If there's an error checking subscription, show the modal anyway
          setShowSubscriptionModal(true);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSubscriptionComplete = () => {
  //   setShowSubscriptionModal(false);
  //   router.push('/dashboard');
  // };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-4 py-12 sm:px-6 lg:px-8 dark:from-gray-800 dark:to-gray-900">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800 dark:shadow-slate-700/50"
          initial={{ scale: 0.95 }}
          animate={{ scale: isPageLoaded ? 1 : 0.95 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-6 text-center text-white dark:from-red-500 dark:to-yellow-400">
            <motion.h2
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Welcome Back
            </motion.h2>
            <motion.p
              className="mt-1 text-red-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Sign in to your account
            </motion.p>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-700/50 dark:bg-red-900/30 dark:text-red-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleLogin}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-red-500 dark:bg-red-400"
                    initial={{ width: 0 }}
                    animate={{ width: email ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-red-500 dark:bg-red-400"
                    initial={{ width: 0 }}
                    animate={{ width: password ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center">
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      tabIndex={-1}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </motion.button>
                  </div>
                </div>
                <div className="mt-1 flex justify-end">
                  <Link
                    href="/auth/reset-password"
                    className="text-sm font-medium text-red-600 transition-colors hover:text-red-800 hover:underline dark:text-red-400 dark:hover:text-red-300"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-red-600 to-yellow-500 py-2 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg dark:from-red-500 dark:to-yellow-400 dark:hover:shadow-red-700/50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        className="mr-2"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <svg
                          className="size-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </motion.div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.p
              className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-red-600 transition-colors hover:text-red-800 hover:underline dark:text-red-400 dark:hover:text-red-300"
              >
                Sign up
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Custom Subscription Modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative mx-4 flex w-full max-w-6xl flex-col rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="size-5" />
              </button>

              <div className="text-center">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 text-xl font-bold text-gray-900 dark:text-white"
                >
                  Choose Your Plan
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 text-sm text-gray-600 dark:text-gray-300"
                >
                  Start your mindfulness journey today
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grow grid-cols-1 gap-6 md:grid-cols-2"
              >
                {/* 3-Day Plan */}
                <div className="border-primary dark:border-primary-dark flex h-full flex-col rounded-xl border bg-white p-4 shadow-lg dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      3-Day Access Plan
                    </h3>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹199
                    </span>
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                      /3 days
                    </span>
                  </div>

                  <ul className="mb-6 grow space-y-2">
                    {[
                      'Day-1: Learn Shree Suktam chanting',
                      'Day-2: Learn Shree Yantra (Maha Meru) pooja',
                      'Day-3: Learn guided meditation of Shree Suktam with jagrit mantra',
                    ].map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <svg
                          className="size-5 text-yellow-500"
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
                    {hasActiveFourDayPlan ? (
                      <div className="rounded-md bg-green-100 p-2 text-center text-xs text-green-800 dark:bg-green-700/30 dark:text-green-300">
                        You have an active 3-Day plan
                      </div>
                    ) : (
                      <SubscriptionButton planType="FOUR_DAY" amount={199} />
                    )}
                  </div>
                </div>

                {/* 6-Month Plan */}
                <div className="border-primary dark:border-primary-dark flex h-full flex-col rounded-xl border-2 bg-white p-4 shadow-lg dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      6-Months Premium Subscription
                    </h3>
                    <span className="bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark rounded-full px-2 py-0.5 text-xs font-medium">
                      POPULAR
                    </span>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹699
                    </span>
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                      /6 months
                    </span>
                  </div>

                  <ul className="mb-6 grow space-y-2">
                    {[
                      'Live session Every Sunday at 10 AM',
                      'Learn Shree Suktam in detail and unlock the secrets',
                      'Swar Vigyan - Ancient and Powerful breath techniques to control the Destiny',
                      'Vigyan Bhairav Tantra - 70+ Ancient and powerful meditation techniques',
                      'Hanuman Chalisa with Spiritual meaning',
                      'Upanishad Gyan',
                      'Kundalini Sadhana',
                      'E-books and Many more...',
                    ].map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <svg
                          className="size-5 text-yellow-500"
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
                    <SubscriptionButton planType="SIX_MONTH" amount={699} />
                  </div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowSubscriptionModal(false);
                  router.push('/');
                }}
                className="mt-6 w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              >
                Skip for Later
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
