import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaBook, FaDownload, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
// import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Subscription = {
  type: string;
  isActive: boolean;
  endDate: string;
};

export default function WebinarPage1() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasSixMonthPlan, setHasSixMonthPlan] = useState(false);
  const [has599Plan, setHas599Plan] = useState(false);
  // const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === 'authenticated') {
        setIsLoading(true);
        try {
          const res = await fetch('/api/subscription');
          const data = await res.json();

          // Check if user has any subscription
          setHasSubscription(data.subscriptions?.length > 0);

          // Check specifically for 6-month plan
          const sixMonthSub = data.subscriptions?.find(
            (sub: Subscription) =>
              sub.type === 'SIX_MONTH' &&
              sub.isActive &&
              new Date(sub.endDate) > new Date()
          );
          setHasSixMonthPlan(!!sixMonthSub);

          // Check for either SIX_MONTH or FIVE_NINE_NINE plan
          const premiumSub = data.subscriptions?.find(
            (sub: Subscription) =>
              (sub.type === 'SIX_MONTH' || sub.type === 'FIVE_NINE_NINE') &&
              sub.isActive &&
              new Date(sub.endDate) > new Date()
          );
          setHas599Plan(!!premiumSub);
        } catch (error) {
          console.error('Subscription check failed:', error);
          toast.error('Failed to check subscription status');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (status !== 'loading') {
      checkSubscription();
    }
  }, [status]);

  const handleEbookAccess = () => {
    if (!hasSubscription) {
      toast.error('Please subscribe to access the ebook');
      return;
    }

    if (!hasSixMonthPlan) {
      toast.error('This ebook is available only for 6-month plan subscribers');
      return;
    }

    // If has access, redirect to ebooks page
    window.location.href = '/users/ebooks';
  };

  const handleSubscriptionRedirect = () => {
    if (session && has599Plan) {
      window.location.href =
        'https://shreemahavidyashaktipeeth.com/subscription/';
    } else if (session && hasSubscription) {
      toast.error('This content is only available for 699 plan subscribers');
    } else {
      toast.error('Please subscribe to access this content');
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-b from-white to-yellow-50 py-16 text-gray-900 dark:from-gray-900 dark:to-slate-800 dark:text-slate-200"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto flex flex-col-reverse items-center justify-between gap-12 px-4 lg:flex-row lg:gap-20 lg:px-8">
        {/* Left Content */}
        <motion.div
          className="w-full space-y-8 lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.h1
            className="text-justify text-3xl font-bold leading-tight md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Transform Your Spiritual Journey{' '}
            <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent dark:from-red-500 dark:to-yellow-400">
              With 6 Months of Shree Suktam Sadhana
            </span>
          </motion.h1>

          <motion.p
            className="text-justify text-lg leading-relaxed text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            In just 6 months, Shree Suktam Sadhana brings a deep spiritual
            transformation—cleansing the mind, awakening inner Shakti, and
            attracting divine abundance. As you chant the sacred verses of Maa
            Mahalakshmi, negativity dissolves, energy aligns, and peace blossoms
            within. Prosperity flows naturally, relationships heal, and your
            life begins to reflect the grace and blessings of the Devi. This
            sadhana doesn&apos;t just change your outer world—it elevates your
            soul, making abundance your natural state and devotion your way of
            life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="rounded-full bg-gradient-to-r from-red-600 to-yellow-400 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-50 hover:text-red-700 hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const section = document.getElementById('pricing');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Start Your Journey →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          className="flex w-full items-center justify-center lg:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="relative h-[280px] w-[420px] sm:h-[320px] sm:w-[480px] md:h-[360px] md:w-[520px]">
            <motion.div
              className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-600 to-yellow-400 opacity-20 blur dark:from-red-500 dark:to-yellow-400 dark:opacity-30"
              animate={{
                opacity: [0.2, 0.3, 0.2],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            <div className="relative size-full overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/assets/Shree.png"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-700 hover:scale-105"
                alt="Shree Suktam Sadhana"
              />
              {/* <motion.button
                className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-yellow-400 text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">▶</span>
              </motion.button> */}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Free Ebook Section */}
      <motion.div
        className="container mx-auto mt-16 px-4 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-yellow-50 p-8 dark:from-gray-800 dark:to-slate-800">
          {/* Background Decorative Elements */}
          <div className="absolute -right-20 -top-20 size-40 rounded-full bg-red-100 opacity-50 blur-3xl dark:bg-red-900/30" />
          <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-yellow-100 opacity-50 blur-3xl dark:bg-yellow-900/30" />

          <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            {/* Left Content */}
            <motion.div
              className="flex flex-col space-y-4 text-center lg:w-1/2 lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="inline-block rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-600 dark:bg-red-900/50 dark:text-red-400">
                Exclusive Offer
              </span>
              <h2 className="text-3xl font-bold lg:text-4xl">
                Get Your{' '}
                <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent dark:from-red-500 dark:to-yellow-400">
                  Free Sacred Ebook
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Discover the profound wisdom and transformative power of Shree
                Suktam Sadhana. Download your free copy of &quot;श्री सूक्तम्
                साधना की महिमा&quot; today!
              </p>
              <ul className="space-y-2 text-left text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Detailed
                  Sadhana guidelines
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Sacred mantras
                  with meanings
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Step-by-step
                  practice instructions
                </li>
              </ul>
              <motion.button
                className="group mt-4 inline-flex items-center gap-2 self-center rounded-full bg-gradient-to-r from-red-600 to-yellow-500 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 lg:self-start dark:from-red-500 dark:to-yellow-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={
                  session
                    ? handleEbookAccess
                    : () => (window.location.href = '/auth/login')
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Checking access...</span>
                  </>
                ) : session ? (
                  hasSubscription ? (
                    hasSixMonthPlan ? (
                      <>
                        <FaDownload className="transition-transform group-hover:-translate-y-1" />
                        Access Free Ebook
                      </>
                    ) : (
                      <>
                        <FaLock className="transition-transform group-hover:-translate-y-1" />
                        Upgrade to 6-Month Plan
                      </>
                    )
                  ) : (
                    <>
                      <FaLock className="transition-transform group-hover:-translate-y-1" />
                      Subscribe to Access
                    </>
                  )
                ) : (
                  <>
                    <FaLock className="transition-transform group-hover:-translate-y-1" />
                    Login to Access
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Right Content - Book Image */}
            <motion.div
              className="relative lg:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="relative mx-auto h-[300px] w-full max-w-[450px] overflow-hidden rounded-lg shadow-2xl transition-all duration-300 hover:shadow-red-500/20 dark:hover:shadow-yellow-400/20">
                <Image
                  src="/assets/श्री सूक्तम् साधना की महिमा.png"
                  layout="fill"
                  objectFit="contain"
                  alt="श्री सूक्तम् साधना की महिमा"
                  className="transition-transform duration-700 hover:scale-105"
                />
                {/* Decorative Elements */}
                <div className="absolute -right-6 -top-6 size-12 rounded-full bg-yellow-400 opacity-50 blur-lg" />
                <div className="absolute -bottom-6 -left-6 size-12 rounded-full bg-red-400 opacity-50 blur-lg" />
              </div>
              {/* Floating Badge */}
              <motion.div
                className="absolute -right-4 top-4 rounded-lg bg-white p-3 shadow-lg dark:bg-slate-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-2">
                  <FaBook className="text-red-500 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Free Download
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 699 Image Section */}
      <motion.div
        className="container mx-auto mt-16 px-4 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-yellow-50 p-8 dark:from-gray-800 dark:to-slate-800">
          {/* Background Decorative Elements */}
          <div className="absolute -right-20 -top-20 size-40 rounded-full bg-red-100 opacity-50 blur-3xl dark:bg-red-900/30" />
          <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-yellow-100 opacity-50 blur-3xl dark:bg-yellow-900/30" />

          <div className="relative mx-auto max-w-4xl">
            <motion.div
              className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-lg shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={handleSubscriptionRedirect}
            >
              <Image
                src="/assets/599.jpg"
                layout="fill"
                objectFit="cover"
                alt="699 Plan Details"
                className="transition-transform duration-700 hover:scale-105"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

              {/* Decorative Elements */}
              <div className="absolute -right-6 -top-6 size-12 rounded-full bg-yellow-400 opacity-50 blur-lg" />
              <div className="absolute -bottom-6 -left-6 size-12 rounded-full bg-red-400 opacity-50 blur-lg" />
            </motion.div>

            {/* Floating Badge */}
            <motion.div
              className="absolute -right-4 top-4 rounded-lg bg-white p-3 shadow-lg dark:bg-slate-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-lg font-bold text-transparent">
                  ₹699
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Best Value
                </span>
              </div>
            </motion.div>

            {/* Subscribe Button */}
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.button
                className="rounded-full bg-gradient-to-r from-red-600 to-yellow-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:from-red-500 dark:to-yellow-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscriptionRedirect}
                disabled={!session || !has599Plan}
              >
                {!session
                  ? 'Login to Access'
                  : !has599Plan
                    ? 'Upgrade to 699 Plan'
                    : 'Access Subscription Portal'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
