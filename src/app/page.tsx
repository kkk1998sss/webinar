'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Footer } from '@/components/footer';
import BusinessTypes from '@/components/landing/BusinessTypes';
import FAQ from '@/components/landing/FAQ';
import Pricing from '@/components/landing/Pricing';
import Sells from '@/components/landing/Sells';
import WebinarKitSection from '@/components/landing/WebinarkitSection';
import WebinarkitSectionPlatform from '@/components/landing/WebinarkitSectionPlatform';
import WebinarPage1 from '@/components/landing/WebinarPage1';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { data: session, status } = useSession();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loadingSub, setLoadingSub] = useState(true);
  const userName = session?.user?.name || '';

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/subscription');
          const data = await res.json();
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
  }, [status]);

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
