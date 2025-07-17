'use client';

import { useEffect, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn, signOut } from 'next-auth/react';

import { SubscriptionButton } from '@/components/Subscription/SubscriptionButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Add User type for type safety
interface User {
  email: string;
  pending?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  // Auto-logout logic after registration if no subscription
  useEffect(() => {
    let logoutTimer: NodeJS.Timeout | null = null;
    const checkAndAutoLogout = async () => {
      const session = await getSession();
      if (session?.user?.email) {
        try {
          const res = await fetch('/api/subscription');
          const data = await res.json();
          if (
            Array.isArray(data.subscriptions) &&
            data.subscriptions.length === 0
          ) {
            // Set a 1-minute timer to auto-logout
            logoutTimer = setTimeout(async () => {
              await signOut({ redirect: false });
              router.replace('/auth/login?subscribe=1');
            }, 60000);
          }
        } catch {
          // ignore
        }
      }
    };
    if (showSubscriptionModal) {
      checkAndAutoLogout();
    }
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [showSubscriptionModal, router]);

  // Payment success callback
  const handlePaymentSuccess = async () => {
    // Re-fetch user and check pending
    const userRes = await fetch('/api/register');
    const users: User[] = await userRes.json();
    const user = users.find((u) => u.email === email);
    if (user && user.pending === true) {
      setShowSubscriptionModal(false);
      setError('');
      // Re-login to refresh session
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard',
      });
    } else {
      setError(
        'Payment was successful, but your access is not yet active. Please contact support.'
      );
    }
  };

  // Payment modal close/cancel handler
  const handleModalClose = async () => {
    setShowSubscriptionModal(false);
    setError('You must purchase a plan to continue.');
    await signOut({ redirect: false });
    router.replace('/auth/login?subscribe=1');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    function formatPhoneNumber(phoneNumber: string): string {
      const cleaned = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
      if (cleaned.length === 10) {
        return `+91${cleaned}`; // Add country code for India
      }
      if (cleaned.length > 10 && !cleaned.startsWith('+')) {
        return `+${cleaned}`;
      }
      return cleaned; // Return formatted number
    }
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      const res = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: formattedPhoneNumber,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        // Auto-login after registration
        const loginResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (loginResult?.ok) {
          setShowSubscriptionModal(true);
        } else {
          setError(
            'Registration succeeded, but auto-login failed. Please try logging in.'
          );
        }
      } else {
        const data = await res.json();
        // Handle specific error messages
        if (data.error?.includes('already exists')) {
          setError(
            'This email or phone number is already registered. Please use different credentials or try logging in.'
          );
        } else if (data.message?.includes('email')) {
          setError(
            'This email is already registered. Please use a different email or try logging in.'
          );
        } else if (data.message?.includes('phone')) {
          setError(
            'This phone number is already registered. Please use a different phone number.'
          );
        } else if (data.message?.includes('password')) {
          setError('Password must be at least 6 characters long.');
        } else if (data.message?.includes('invalid')) {
          setError('Please enter valid information in all fields.');
        } else {
          setError(
            data.message ||
              data.error ||
              'Registration failed. Please check your information and try again.'
          );
        }
      }
    } catch (error) {
      console.error(error);
      setError(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              Create Your Account
            </motion.h2>
            <motion.p
              className="mt-1 text-red-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Start your Shree Suktam Journey today at 9PM
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
              onSubmit={handleSignUp}
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
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-red-500 dark:bg-red-400"
                    initial={{ width: 0 }}
                    animate={{ width: name ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone Number
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      if (value.length <= 10) {
                        // Limit to 10 digits
                        setPhoneNumber(value);
                      }
                    }}
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit phone number"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-red-500 dark:bg-red-400"
                    initial={{ width: 0 }}
                    animate={{ width: phoneNumber ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Sign Up'
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
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-red-600 transition-colors hover:text-red-800 hover:underline dark:text-red-400 dark:hover:text-red-300"
              >
                Sign in
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative mx-2 flex max-h-[90vh] w-full min-w-0 max-w-full flex-col overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl sm:mx-4 sm:max-w-2xl sm:p-6 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Soft blurred gradient accent */}
              <div className="pointer-events-none absolute -left-10 -top-10 z-0 size-40 rounded-full bg-gradient-to-br from-yellow-200 via-red-200 to-transparent opacity-40 blur-2xl dark:from-yellow-900 dark:via-red-900 dark:to-transparent"></div>
              {/* Animated meditation icon */}
              <div className="relative z-10 mb-2 flex justify-center">
                <motion.svg
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.1,
                    type: 'spring',
                    stiffness: 120,
                  }}
                  className="size-12 text-yellow-400 drop-shadow-lg"
                  fill="none"
                  viewBox="0 0 48 48"
                  stroke="currentColor"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    strokeWidth="2"
                    className="opacity-30"
                  />
                  <path
                    d="M24 34c-4-2-8-6-8-10a8 8 0 1116 0c0 4-4 8-8 10z"
                    strokeWidth="2"
                  />
                  <circle cx="24" cy="20" r="3" fill="currentColor" />
                </motion.svg>
              </div>
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-2 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-center text-2xl font-extrabold text-transparent drop-shadow-sm sm:text-3xl dark:from-red-500 dark:to-yellow-400"
              >
                Choose Your Plan
              </motion.h2>
              <div className="mx-auto mb-2 h-1 w-16 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 opacity-80 dark:from-red-500 dark:to-yellow-400"></div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 text-center text-base font-medium text-gray-600 dark:text-gray-300"
              >
                Unlock your spiritual journey with the perfect plan for you!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="z-10 mx-auto grid max-w-xl grow grid-cols-1 justify-center gap-6 sm:grid-cols-2 md:gap-8"
              >
                {/* 3-Day Plan */}
                <motion.div
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 8px 32px 0 rgba(255, 193, 7, 0.15)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="dark:border-border relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 py-8 shadow-lg transition-all duration-200 sm:p-6 sm:py-10 dark:bg-gray-800"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-lg font-extrabold text-transparent drop-shadow-sm sm:text-xl dark:from-red-500 dark:to-yellow-400">
                        3-Day Access Plan
                      </span>
                    </h3>
                  </div>

                  <div className="mb-6">
                    <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-3xl font-extrabold text-transparent drop-shadow-sm sm:text-4xl dark:from-red-500 dark:to-yellow-400">
                      ₹199
                    </span>
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                      /3 days
                    </span>
                  </div>

                  <ul className="mb-6 grow space-y-2 text-left text-xs text-gray-700 sm:text-sm dark:text-slate-300">
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
                        className="flex items-center space-x-2"
                      >
                        <span className="mr-1 inline-flex items-center justify-center rounded-full bg-yellow-100 p-1 dark:bg-yellow-900/30">
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
                        </span>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <SubscriptionButton
                      planType="FOUR_DAY"
                      amount={199}
                      onSuccess={handlePaymentSuccess}
                    />
                  </div>
                </motion.div>
                {/* Removed 6-Month Plan */}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
