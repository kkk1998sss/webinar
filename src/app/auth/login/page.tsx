'use client';

import { useEffect, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log('response', res);

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        const session = await getSession();
        console.log('session', session);

        if (session?.user?.isAdmin) {
          router.push('/admin/users');
        } else {
          router.push('/users/live-webinar');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Something went wrong. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpSent(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      if (!data.user?.email || !data.user?.password) {
        throw new Error('Missing email or password in response.');
      }

      const signInRes = await signIn('credentials', {
        redirect: false,
        email: data.user.email,
        password: data.user.password,
      });

      if (signInRes?.error) {
        setError('Login failed. Please try again.');
      } else {
        router.push('/admin/users');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
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
              Welcome Back
            </motion.h2>
            <motion.p
              className="mt-1 text-red-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Sign in to continue to your account
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

            {/* Toggle Between Email & Phone Login */}
            <motion.div
              className="mb-6 flex justify-center space-x-2 rounded-lg bg-gray-100 p-1 dark:bg-slate-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  loginMethod === 'email'
                    ? 'bg-white text-red-600 shadow-sm dark:bg-slate-600 dark:text-red-300 dark:shadow-none'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setLoginMethod('email')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Email Login
              </motion.button>
              <motion.button
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  loginMethod === 'phone'
                    ? 'bg-white text-red-600 shadow-sm dark:bg-slate-600 dark:text-red-300 dark:shadow-none'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setLoginMethod('phone')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Phone Login
              </motion.button>
            </motion.div>

            {/* Email & Password Login Form */}
            <AnimatePresence mode="wait">
              {loginMethod === 'email' && (
                <motion.form
                  onSubmit={handleEmailLogin}
                  className="space-y-5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
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
                    <div className="flex justify-end">
                      <Link
                        href="/auth/reset-password"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
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
                        'Sign in'
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              )}

              {/* Phone Number + OTP Login */}
              {loginMethod === 'phone' && (
                <motion.form
                  onSubmit={handlePhoneLogin}
                  className="space-y-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Phone Number
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="phone"
                        type="text"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                      />
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: phoneNumber ? '100%' : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  {!otpSent ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Button
                        type="button"
                        onClick={handleRequestOTP}
                        disabled={isLoading}
                        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg dark:from-blue-500 dark:to-purple-500 dark:hover:shadow-blue-700/50"
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
                            <span>Sending OTP...</span>
                          </div>
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <Label
                          htmlFor="otp"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Enter OTP
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                          />
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: otp ? '100%' : 0 }}
                            transition={{ duration: 0.3 }}
                          />
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
                              <span>Verifying OTP...</span>
                            </div>
                          ) : (
                            'Verify & Login'
                          )}
                        </Button>
                      </motion.div>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            <motion.div
              className="my-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Or sign in with
              </span>
            </motion.div>

            <motion.div
              className="flex justify-center space-x-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isPageLoaded ? 1 : 0,
                y: isPageLoaded ? 0 : 10,
              }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                className="flex size-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
                whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => signIn('github')}
              >
                <Icons.github className="size-5" />
              </motion.button>
              <motion.button
                className="flex size-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
                whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => signIn('google')}
              >
                <Icons.google className="size-5" />
              </motion.button>
              <motion.button
                className="flex size-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
                whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => signIn('twitter')}
              >
                <Icons.twitter className="size-5" />
              </motion.button>
            </motion.div>

            <motion.p
              className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
