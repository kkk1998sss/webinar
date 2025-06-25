'use client';

import { useEffect, useState } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaChartLine,
  FaUsers,
  FaVideo,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalWebinars: number;
  upcomingWebinars: number;
  userGrowth: number;
  webinarGrowth: number;
  plan199Count: number;
  plan599Count: number;
  totalRevenue: number;
}

interface ChartData {
  month: string;
  count: number;
}

interface Activity {
  user: string;
  action: string;
  time: string;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalWebinars: 0,
    upcomingWebinars: 0,
    userGrowth: 0,
    webinarGrowth: 0,
    plan199Count: 0,
    plan599Count: 0,
    totalRevenue: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState<ChartData[]>([]);
  const [webinarEngagementData, setWebinarEngagementData] = useState<
    ChartData[]
  >([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all dashboard data in parallel
        const [statsRes, userGrowthRes, webinarEngagementRes, activitiesRes] =
          await Promise.all([
            fetch('/api/dashboard/stats'),
            fetch('/api/dashboard/user-growth'),
            fetch('/api/dashboard/webinar-engagement'),
            fetch('/api/dashboard/recent-activity'),
          ]);

        const [
          statsData,
          userGrowthData,
          webinarEngagementData,
          activitiesData,
        ] = await Promise.all([
          statsRes.json(),
          userGrowthRes.json(),
          webinarEngagementRes.json(),
          activitiesRes.json(),
        ]);

        if (statsData.success) setStats(statsData.stats);
        if (userGrowthData.success) setUserGrowthData(userGrowthData.data);
        if (webinarEngagementData.success)
          setWebinarEngagementData(webinarEngagementData.data);
        if (activitiesData.success) setActivities(activitiesData.activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.h1
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Welcome, Admin
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Users Card */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
              <FaUsers className="size-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div
              className={`flex items-center ${stats.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {stats.userGrowth >= 0 ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(stats.userGrowth)}%
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-500">from last month</span>
          </div>
        </motion.div>

        {/* Active Users Card */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
              <FaUsers className="size-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : stats.activeUsers.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${(stats.activeUsers / stats.totalUsers) * 100}%`,
                }}
              ></div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of
              total users
            </p>
          </div>
        </motion.div>

        {/* Webinars Card */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-purple-100">
              <FaVideo className="size-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Webinars</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : stats.totalWebinars.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div
              className={`flex items-center ${stats.webinarGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {stats.webinarGrowth >= 0 ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(stats.webinarGrowth)}%
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-500">from last month</span>
          </div>
        </motion.div>

        {/* Upcoming Webinars Card */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-orange-100">
              <FaCalendarAlt className="size-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Upcoming Webinars</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : stats.upcomingWebinars.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-orange-500"
                style={{
                  width: `${(stats.upcomingWebinars / stats.totalWebinars) * 100}%`,
                }}
              ></div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {Math.round((stats.upcomingWebinars / stats.totalWebinars) * 100)}
              % of total webinars
            </p>
          </div>
        </motion.div>

        {/* Plan 199 Card */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100">
              <FaUsers className="size-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">₹199 Plan</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : stats.plan199Count.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {Math.round(
                (stats.plan199Count /
                  (stats.plan199Count + stats.plan599Count)) *
                  100
              )}
              % of total subscriptions
            </p>
          </div>
        </motion.div>

        {/* Plan 699 Card */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-indigo-100">
              <FaUsers className="size-6 text-indigo-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">₹699 Plan</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : stats.plan599Count.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {Math.round(
                (stats.plan599Count /
                  (stats.plan199Count + stats.plan599Count)) *
                  100
              )}
              % of total subscriptions
            </p>
          </div>
        </motion.div>

        {/* Total Revenue Card */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <FaChartLine className="size-6 text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Average: ₹
              {Math.round(
                stats.totalRevenue / (stats.plan199Count + stats.plan599Count)
              )}{' '}
              per subscription
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* User Growth Chart */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
          whileHover={{ y: -5 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">User Growth</h3>
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
              <FaChartLine className="size-4 text-blue-600" />
            </div>
          </div>
          <div className="flex h-64 items-end justify-between space-x-1">
            {userGrowthData.map((data, index) => {
              const maxCount = Math.max(...userGrowthData.map((d) => d.count));
              const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 rounded-t-md bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="mt-2 text-xs text-gray-500">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Webinar Engagement Chart */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
          whileHover={{ y: -5 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Webinar Engagement</h3>
            <div className="flex size-8 items-center justify-center rounded-full bg-purple-100">
              <FaVideo className="size-4 text-purple-600" />
            </div>
          </div>
          <div className="flex h-64 items-end justify-between space-x-1">
            {webinarEngagementData.map((data, index) => {
              const maxCount = Math.max(
                ...webinarEngagementData.map((d) => d.count)
              );
              const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 rounded-t-md bg-purple-500 transition-all duration-300 hover:bg-purple-600"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="mt-2 text-xs text-gray-500">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-center rounded-lg p-3 transition-colors duration-300 hover:bg-gray-50"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div
                className={`size-10 rounded-full ${activity.color} flex items-center justify-center font-bold text-white`}
              >
                {activity.user.charAt(0)}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium">
                  {activity.user} {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
