import { motion } from 'framer-motion';
import { ArrowRight, Check, Lightbulb, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function WebinarKitSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 px-6 py-20 md:px-20 dark:from-gray-900 dark:to-slate-800">
      <div className="absolute -right-20 -top-20 size-80 rounded-full bg-blue-100 opacity-30 blur-3xl dark:bg-blue-900/50 dark:opacity-20"></div>
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-indigo-100 opacity-30 blur-3xl dark:bg-indigo-900/50 dark:opacity-20"></div>

      <div className="relative flex flex-col items-center justify-between gap-12 md:flex-row">
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 blur-lg dark:opacity-30"></div>
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/assets/webinar 1 (4).jpg"
                alt="WebinarKit Illustration"
                width={600}
                height={400}
                className="h-auto w-full transition-transform duration-700 hover:scale-105"
              />
            </div>
            <motion.div
              className="absolute -right-4 -top-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white shadow-lg dark:from-blue-400 dark:to-indigo-500"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <Zap className="size-6" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 text-center md:text-left"
          >
            <Link
              href="/masterclass"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 dark:from-blue-500 dark:to-indigo-500 dark:hover:shadow-blue-400/30"
            >
              Register for the masterclass now!
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="w-full text-left md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h2
            className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            That&apos;s why we created{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              WebinarKit
            </span>
          </motion.h2>

          <motion.p
            className="mb-6 text-lg text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            WebinarKit is the all-in-one automated webinar platform that lets
            you scale your business effortlessly while keeping the engagement
            and urgency of live events.
          </motion.p>

          <motion.p
            className="mb-8 text-lg text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            And now, with AI-powered engagement, your webinars don&apos;t just
            run on autopilot—they sell on autopilot.
          </motion.p>

          <motion.ul
            className="space-y-4 text-base text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {[
              'Convert leads into customers automatically—while still having the flexibility to go live when you want.',
              'Set up your best webinar once—and let it sell for you 24/7.',
              'Use AI-assisted chat to engage attendees, handle objections, and drive action.',
              'Run high-converting webinar funnels without limits or technical headaches.',
              'Your time is valuable. Focus on growing your business while WebinarKit handles the rest.',
            ].map((item, index) => (
              <motion.li
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              >
                <span
                  className={`mr-3 flex size-6 shrink-0 items-center justify-center rounded-full ${index === 4 ? 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300' : 'bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-300'}`}
                >
                  {index === 4 ? (
                    <Lightbulb className="size-4" />
                  ) : (
                    <Check className="size-4" />
                  )}
                </span>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
