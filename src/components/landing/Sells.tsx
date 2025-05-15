// components/WebinarFeatures.tsx
'use client';

import { FaDollarSign, FaLayerGroup, FaToggleOn } from 'react-icons/fa';
import { motion } from 'framer-motion';

const featuresData = [
  {
    icon: (
      <FaLayerGroup className="text-primary dark:text-primary-dark mr-4 size-8" />
    ),
    title: 'Scale Limitlessly: Unlimited Funnels, Infinite Sales.',
    description:
      'Design countless high-conversion webinar funnels. No caps on attendees, registrants, or events. Amplify sales, leads, and revenue—effortlessly on autopilot.',
  },
  {
    icon: (
      <FaToggleOn className="text-accent dark:text-accent-dark mr-4 size-8" />
    ),
    title: '24/7 Sales Machine: Convert Leads While You Sleep.',
    description:
      'Transform your best pitches into evergreen assets. Sell courses, software, or coaching automatically. Set it once, and let consistent sales flow.',
    points: [
      'Automate sales of courses, software, and coaching.',
      'Convert leads with high-converting, pre-recorded webinars.',
      'No live hosting required – set it and forget it.',
    ],
  },
  {
    icon: (
      <FaDollarSign className="text-primary dark:text-primary-dark mr-4 size-8" />
    ),
    title: 'AI-Powered Selling: Intelligent Automation, Zero Hassle.',
    description:
      "Our smart AI handles Q&A, overcomes objections, and guides prospects to purchase, 24/7. Focus on your passion; we'll handle the persuasion.",
  },
];

export default function Sells() {
  return (
    <section
      id="features"
      className="from-background to-secondary/30 dark:from-background dark:to-secondary-dark/20 w-full bg-gradient-to-b px-4 py-16 md:px-20"
    >
      <motion.h2
        className="text-foreground dark:text-foreground-dark mb-16 text-center text-3xl font-bold md:text-4xl lg:text-5xl"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Unlock Your Webinar{' '}
        <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent dark:from-red-500 dark:to-yellow-400">
          Superpowers
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
            transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
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
            {feature.points && (
              <ul className="mt-auto space-y-2 text-sm">
                {feature.points.map((point, pIndex) => (
                  <motion.li
                    key={pIndex}
                    className="flex items-start text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: 0.2 + index * 0.1 + pIndex * 0.1,
                      ease: 'easeOut',
                    }}
                  >
                    <svg
                      className="mr-2 mt-1 size-4 shrink-0 text-green-500 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    {point}
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
