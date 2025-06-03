import React from 'react';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function WebinarPage1() {
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
            sadhana doesn’t just change your outer world—it elevates your soul,
            making abundance your natural state and devotion your way of life.
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
            >
              Start Your Journey →
            </motion.button>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4 pt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="size-10 rounded-full border-2 border-white bg-gray-200 dark:border-slate-700 dark:bg-gray-600"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                  viewport={{ once: true }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-red-600 dark:text-yellow-400">
                2,500+
              </span>{' '}
              seekers already on this path
            </p>
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
                src="/assets/webinar 1 (3).jpg"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-700 hover:scale-105"
                alt="Shree Suktam Sadhana"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <motion.button
                className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-yellow-400 text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">▶</span>
              </motion.button>
            </div>

            <motion.div
              className="absolute -bottom-4 -right-4 rounded-lg bg-white p-3 shadow-lg dark:bg-slate-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-500 dark:text-yellow-400">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <span className="text-sm font-semibold dark:text-slate-200">
                  4.9/5 Rating
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Trust & Ratings Section */}
      <motion.div
        className="mt-16 rounded-xl bg-gradient-to-r from-red-600 to-yellow-400 py-8 shadow-md dark:from-red-500 dark:to-yellow-400"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-6 px-4 lg:px-8">
          <motion.div
            className="flex items-center text-lg font-medium text-white"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="mr-2 text-2xl">✅</span> Trusted by over{' '}
            <span className="ml-1 bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text font-bold text-transparent dark:from-yellow-100 dark:to-yellow-300">
              18,000+ devotees
            </span>
          </motion.div>

          <motion.div
            className="flex items-center space-x-2 text-lg"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="flex text-yellow-300 dark:text-yellow-200">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </span>
            <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text font-semibold text-transparent dark:from-yellow-100 dark:to-yellow-300">
              4.8/5 stars on G2
            </span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
