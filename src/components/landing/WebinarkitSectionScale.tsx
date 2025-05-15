'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart, Check, Lightbulb, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const WebinarkitSectionScale = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white px-6 py-20 md:px-16 dark:from-slate-800 dark:to-gray-900">
      {/* Background decorative elements */}
      <div className="absolute -left-20 top-20 size-80 rounded-full bg-indigo-100 opacity-30 blur-3xl dark:bg-indigo-900/50 dark:opacity-20"></div>
      <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-blue-100 opacity-30 blur-3xl dark:bg-blue-900/50 dark:opacity-20"></div>

      <div className="relative flex flex-col items-start justify-between gap-12 md:flex-row">
        {/* Left Content */}
        <motion.div
          className="text-left md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h2
            className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Scale Without Limits —{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              Unlimited Webinars, Registrants & Attendees
            </span>
          </motion.h2>

          <motion.p
            className="mb-8 text-lg text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Most webinar platforms limit your growth—WebinarKit scales with you.
            Create unlimited high-converting webinar funnels and welcome
            unlimited attendees without hidden fees or restrictions.
          </motion.p>

          <motion.ul
            className="space-y-5 text-base text-gray-800 dark:text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {[
              {
                title: 'Run Unlimited Webinars & Funnels',
                description:
                  'No caps on registrations, attendees, or events—your growth is truly limitless.',
                icon: <BarChart className="size-4" />,
              },
              {
                title: 'Never Worry About Audience Size',
                description:
                  'Whether you have 100 attendees or 100,000, your webinars run seamlessly.',
                icon: <Zap className="size-4" />,
              },
              {
                title: 'No Overpriced "Per-Attendee" Fees',
                description:
                  'Unlike other platforms that charge you more as you grow, WebinarKit gives you full freedom at one simple price.',
                icon: <Check className="size-4" />,
              },
              {
                title: 'More webinars = more leads = more revenue',
                description: 'Scale on your terms—without limits.',
                icon: <Lightbulb className="size-4" />,
                highlight: true,
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                className="group flex items-start gap-4 rounded-lg p-3 transition-all duration-300 hover:bg-white hover:shadow-md dark:hover:bg-slate-700 dark:hover:shadow-slate-600/50"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${item.highlight ? 'bg-yellow-100 text-yellow-500 dark:bg-yellow-800 dark:text-yellow-300' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300'}`}
                >
                  {item.icon}
                </span>
                <div>
                  <strong className="block font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </strong>
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right Image Card */}
        <motion.div
          className="flex flex-col items-center md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative w-full">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 opacity-20 blur-lg dark:opacity-30"></div>
            <motion.div
              className="relative overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 dark:from-slate-700 dark:to-slate-600 dark:text-slate-200">
                WebinarKit
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/assets/webinar 1 (3).jpg"
                  alt="Webinar Preview"
                  width={800}
                  height={450}
                  className="h-auto w-full transition-transform duration-700 hover:scale-105"
                />
              </div>
              <motion.div
                className="absolute -right-4 -top-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 p-3 text-white shadow-lg dark:from-fuchsia-400 dark:to-indigo-400"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <BarChart className="size-6" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8"
          >
            <Link
              href="#pricing"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/30 dark:from-fuchsia-500 dark:to-indigo-500 dark:hover:shadow-fuchsia-400/30"
            >
              Explore all plans
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WebinarkitSectionScale;
