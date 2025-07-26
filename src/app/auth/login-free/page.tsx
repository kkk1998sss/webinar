'use client';

import { useEffect, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginFreePage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

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
        if (session?.user?.isAdmin) {
          window.location.href = '/admin/users';
          return;
        }

        // Create a free subscription for the user after successful login
        try {
          await fetch('/api/subscription/free', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
        } catch (error) {
          console.log('Free subscription creation error:', error);
        }

        // Redirect to free dashboard
        router.push('/dashboard-free');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
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
          <div className="bg-gradient-to-r from-green-600 to-blue-500 p-6 text-center text-white dark:from-green-500 dark:to-blue-400">
            <motion.h2
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Welcome Back - Available Access
            </motion.h2>
            <motion.p
              className="mt-1 text-green-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Sign in to access available content
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-green-500 dark:bg-green-400"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-green-500 dark:bg-green-400"
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
                    className="text-sm font-medium text-green-600 transition-colors hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
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
                  className="w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-500 py-2 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg dark:from-green-500 dark:to-blue-400 dark:hover:shadow-green-700/50"
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
                    'Sign In - Available Access'
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
                href="/auth/register-free"
                className="font-medium text-green-600 transition-colors hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
              >
                Sign up for available access
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
