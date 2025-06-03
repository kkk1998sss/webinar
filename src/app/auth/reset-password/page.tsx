'use client';

import { useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPageLoaded] = useState(true);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password has been reset successfully!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
              Reset Password
            </motion.h2>
            <motion.p
              className="mt-1 text-red-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Enter your email and new password
            </motion.p>
          </div>

          <div className="p-6">
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

            {success && (
              <motion.div
                className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-700/50 dark:bg-green-900/30 dark:text-green-400"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
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
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400"
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
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.p
              className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-red-600 transition-colors hover:text-red-800 hover:underline dark:text-red-400 dark:hover:text-red-300"
              >
                Back to Login
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
