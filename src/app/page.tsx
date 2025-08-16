'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

import { Footer } from '@/components/footer';
import BusinessTypes from '@/components/landing/BusinessTypes';
import FAQ from '@/components/landing/FAQ';
import Pricing from '@/components/landing/Pricing';
import Sells from '@/components/landing/Sells';
import WebinarKitSection from '@/components/landing/WebinarkitSection';
import WebinarkitSectionPlatform from '@/components/landing/WebinarkitSectionPlatform';
import WebinarPage1 from '@/components/landing/WebinarPage1';
import { Button } from '@/components/ui/button';

// Add User type for type safety
interface User {
  email: string;
  pending?: boolean;
  [key: string]: string | number | boolean | undefined;
}

const Home = () => {
  const { data: session, status } = useSession();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loadingSub, setLoadingSub] = useState(true);
  const userName = session?.user?.name || '';
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === 'authenticated') {
        try {
          // Check pending status first and redirect immediately if false
          const userRes = await fetch('/api/register');
          const users: User[] = await userRes.json();
          const user = users.find((u) => u.email === session.user.email);
          if (user && user.pending === false) {
            router.replace('/auth/login?subscribe=1');
            return;
          }
          // Only check subscription if user is not pending
          const res = await fetch('/api/subscription');
          const data = await res.json();
          if (
            Array.isArray(data.subscriptions) &&
            data.subscriptions.length === 0
          ) {
            await signOut({ redirect: false });
            router.replace('/auth/login?subscribe=1');
            return;
          }
          setHasSubscription(data.subscriptions?.length > 0);
        } catch (error) {
          console.error('Subscription check failed:', error);
        } finally {
          setLoadingSub(false);
        }
      } else {
        setLoadingSub(false);
      }
    };

    if (status !== 'loading') {
      checkSubscription();
    }
  }, [status, session, router]);

  if (status === 'loading' || loadingSub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <Loader2 className="size-12 animate-spin text-blue-600 dark:text-blue-400" />
          <motion.p
            className="mt-4 font-medium text-blue-600 dark:text-slate-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Loading your experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <main className="w-full flex-1">
        <motion.div
          className="mx-auto flex flex-col items-center py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent dark:from-red-500 dark:to-yellow-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {userName ? (
              <>
                Hi {userName}!<br />
                Welcome to Shree Mahavidya Shaktipeeth
              </>
            ) : (
              'Welcome to Shree Mahavidya Shaktipeeth'
            )}
          </motion.h1>

          <motion.div
            className="mt-4 max-w-2xl text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-lg">
              Awaken abundance, peace, and grace through guided spiritual
              practices and sacred wisdom
            </p>

            {/* Awesome Four Day Plan Button */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.div
                className="group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glowing background effect */}
                <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>

                {/* Main button */}
                <Button
                  className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-green-500/25 sm:px-12 sm:py-6 sm:text-xl dark:from-green-500 dark:via-blue-500 dark:to-purple-500"
                  onClick={() => router.push('/users/four-day-plan-free')}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="size-6 sm:size-8"
                    >
                      ✨
                    </motion.div>
                    <span className="whitespace-nowrap">
                      Continue Your Session
                    </span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="size-5 sm:size-6"
                    >
                      🚀
                    </motion.div>
                  </div>
                </Button>

                {/* Floating message - Hidden until hover */}
                <motion.div
                  className="pointer-events-none absolute -top-16 left-1/2 max-w-xs -translate-x-1/2 rounded-lg border border-green-200 bg-white px-3 py-2 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 sm:max-w-none sm:px-4 dark:border-green-700 dark:bg-gray-800"
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-center text-xs font-medium text-green-700 sm:text-sm dark:text-green-300">
                    🎯 Click to continue your session!
                  </p>
                  <div className="absolute bottom-0 left-1/2 size-0 -translate-x-1/2 border-x-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Subscription upsell for authenticated users without subscription */}
          {status === 'authenticated' && !hasSubscription && (
            <motion.div
              className="mt-8 w-full max-w-2xl rounded-xl border border-blue-100 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{
                y: -5,
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              <motion.div
                className="absolute -right-3 -top-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white dark:bg-blue-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.8 }}
              >
                NEW
              </motion.div>
              <h2 className="mb-2 text-xl font-semibold text-blue-800 dark:text-blue-300">
                Start Your Journey Today
              </h2>
              <p className="text-blue-700 dark:text-blue-400">
                Unlock premium features and take your webinars to the next level
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                  onClick={() =>
                    document.getElementById('pricing')?.scrollIntoView({
                      behavior: 'smooth',
                    })
                  }
                >
                  View Plans
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Main content visible to all users */}
          <motion.div
            className="max-w-8xl mt-16 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <WebinarPage1 />
            <Sells />
            <Pricing />
            <WebinarKitSection />
            <WebinarkitSectionPlatform />
            <BusinessTypes />
            <FAQ />
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
