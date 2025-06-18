'use client';

import { useEffect, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

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
        router.push('/auth/login');
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
              Join our community of webinar creators
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
    </div>
  );
}
