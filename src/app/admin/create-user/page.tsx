'use client';

import { useEffect, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Type definitions for user data
interface Subscription {
  type: 'FOUR_DAY' | 'SIX_MONTH';
  startDate: string;
  endDate: string;
  isActive: boolean;
  payment: {
    planType: string;
    amount: number;
    status: string;
    createdAt: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  subscriptions: Subscription[];
}

export default function CreateUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [planType, setPlanType] = useState<'FOUR_DAY' | 'SIX_MONTH'>(
    'SIX_MONTH'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber}`;

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: formattedPhoneNumber,
          planType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `${data.message}\n\nUser Details:\nName: ${data.user.name}\nEmail: ${data.user.email}\nPlan: ${data.user.planType === 'SIX_MONTH' ? '₹699 - 6 Months' : '₹199 - 4 Days'}\n\nUser can now log in with these credentials.`
        );
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setPlanType('SIX_MONTH');
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setRecentUsers((data.users as User[]) || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  useEffect(() => {
    if (success) {
      // Refresh the user list when a new user is created
      fetchRecentUsers();
    }
  }, [success]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.h1
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Create User with Plan Access
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Give users direct access to premium plans
        </motion.p>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {/* Total Users Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
          <div className="flex items-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="size-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              {isLoadingUsers ? (
                <div className="mt-1">
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {recentUsers.length}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
          <div className="flex items-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="size-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              {isLoadingUsers ? (
                <div className="mt-1">
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {recentUsers.filter((user: User) => user.isActive).length}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ₹699 Plan Users Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
          <div className="flex items-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-purple-100">
              <svg
                className="size-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                ₹699 Plan Users
              </p>
              {isLoadingUsers ? (
                <div className="mt-1">
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {
                    recentUsers.filter(
                      (user: User) =>
                        user.subscriptions &&
                        user.subscriptions.length > 0 &&
                        user.subscriptions[0].type === 'SIX_MONTH'
                    ).length
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ₹199 Plan Users Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
          <div className="flex items-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="size-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                ₹199 Plan Users
              </p>
              {isLoadingUsers ? (
                <div className="mt-1">
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {
                    recentUsers.filter(
                      (user: User) =>
                        user.subscriptions &&
                        user.subscriptions.length > 0 &&
                        user.subscriptions[0].type === 'FOUR_DAY'
                    ).length
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            User Information
          </h2>
          <p className="text-sm text-gray-600">
            Create a new user account and grant them immediate access to the
            selected plan.
          </p>
        </div>

        {error && (
          <motion.div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="whitespace-pre-line">{success}</div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name Field */}
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email Field */}
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <Label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                  }
                }}
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <Label
              htmlFor="planType"
              className="text-sm font-medium text-gray-700"
            >
              Plan Type *
            </Label>
            <Select.Root
              value={planType}
              onValueChange={(value: string) =>
                setPlanType(value as 'FOUR_DAY' | 'SIX_MONTH')
              }
            >
              <Select.Trigger className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                <Select.Value>
                  {planType === 'FOUR_DAY'
                    ? '₹199 - Four Day Plan'
                    : '₹699 - Six Month Plan'}
                </Select.Value>
                <Select.Icon>
                  <ChevronDownIcon className="size-4 opacity-50" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                  <Select.Viewport className="p-1">
                    <Select.Item
                      value="FOUR_DAY"
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <Select.ItemText>₹199 - Four Day Plan</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex w-4 items-center justify-center">
                        <CheckIcon className="size-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item
                      value="SIX_MONTH"
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <Select.ItemText>₹699 - Six Month Plan</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex w-4 items-center justify-center">
                        <CheckIcon className="size-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            <p className="mt-1 text-sm text-gray-500">
              {planType === 'FOUR_DAY'
                ? 'User will get access to 4-day plan content for 4 days'
                : 'User will get access to 6-month plan content for 180 days'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-2 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50"
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
                  <span>Creating User...</span>
                </div>
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Information Card */}
      <motion.div
        className="rounded-xl border border-blue-100 bg-blue-50 p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start">
          <div className="shrink-0">
            <svg
              className="size-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Important Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Users created through this form will have immediate access to
                  the selected plan
                </li>
                <li>
                  No payment verification is required - access is granted
                  automatically
                </li>
                <li>
                  Users can log in immediately with the credentials you provide
                </li>
                <li>Plan duration starts from the moment of creation</li>
                <li>
                  All subscription features will be available as if they had
                  paid normally
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Users Section */}
      <motion.div
        className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Users
            </h2>
            <p className="text-sm text-gray-600">
              Users created through this admin panel and their plan details.
            </p>
          </div>
          <Button
            onClick={fetchRecentUsers}
            disabled={isLoadingUsers}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <svg
              className="size-4"
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
            <span>Refresh</span>
          </Button>
        </div>

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <motion.div
                className="size-5 rounded-full border-2 border-blue-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-gray-600">Loading users...</span>
            </div>
          </div>
        ) : recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plan Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentUsers.slice(0, 10).map((user: User, index: number) => (
                  <motion.tr
                    key={user.id}
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {user.subscriptions && user.subscriptions.length > 0 ? (
                        <div>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              user.subscriptions[0].type === 'SIX_MONTH'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.subscriptions[0].type === 'SIX_MONTH'
                              ? '₹699 - 6 Months'
                              : '₹199 - 4 Days'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No plan</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {user.subscriptions && user.subscriptions.length > 0 ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.subscriptions[0].isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.subscriptions[0].isActive
                            ? 'Active Plan'
                            : 'Expired Plan'}
                        </span>
                      ) : (
                        <span className="text-gray-400">No Plan</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-2 text-gray-400">
              <svg
                className="mx-auto size-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500">No users created yet</p>
            <p className="text-sm text-gray-400">
              Create your first user above
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
