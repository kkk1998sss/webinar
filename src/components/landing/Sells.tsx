// components/WebinarFeatures.tsx
'use client';

import { FaCalendarAlt, FaPrayingHands, FaVideo } from 'react-icons/fa';
import { motion } from 'framer-motion';

const featuresData = [
  {
    icon: (
      <FaPrayingHands className="text-primary dark:text-primary-dark mr-4 size-8" />
    ),
    title: 'Guided Mantra Chanting with Proper Vidhi',
    description:
      'Receive authentic guidance on how to chant the Shree Suktam with correct pronunciation, rhythm, and spiritual method — ensuring your sadhana is powerful and fruitful.',
  },
  {
    icon: (
      <FaCalendarAlt className="text-accent dark:text-accent-dark mr-4 size-8" />
    ),
    title: 'Live Webinars Every Sunday at 10:00 AM',
    description:
      'Join weekly interactive satsangs and teachings with spiritual mentors to clarify doubts, deepen your understanding, and stay connected with divine energy and sangha.',
  },
  {
    icon: (
      <FaVideo className="text-primary dark:text-primary-dark mr-4 size-8" />
    ),
    title: 'Daily Practice Videos for Consistency',
    description:
      'Access daily video content including mantra recitations, sadhana instructions, and spiritual insights — helping you maintain regularity and devotion throughout the 6 months.',
  },
];

export default function Sells() {
  return (
    <section
      id="features"
      className="w-full bg-gradient-to-b from-white to-yellow-50 px-4 py-16 md:px-20 dark:from-gray-900 dark:to-slate-800"
    >
      <motion.h2
        className="text-foreground dark:text-foreground-dark mb-16 text-center text-3xl font-bold md:text-4xl lg:text-5xl"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Invoke the Grace of Maa Mahalakshmi in{' '}
        <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent dark:from-red-500 dark:to-yellow-400">
          6 Months
        </span>
      </motion.h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuresData.map((feature, index) => (
          <motion.div
            key={index}
            className="flex flex-col rounded-xl bg-white p-8 shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-800/70"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.15,
              ease: 'easeOut',
            }}
          >
            <div className="mb-5 flex items-start">
              {feature.icon}
              <h3 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                {feature.title}
              </h3>
            </div>
            <p className="mb-4 grow text-sm text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
