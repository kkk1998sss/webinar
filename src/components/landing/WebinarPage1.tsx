import React from 'react';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
// import webinarImg1 from './../../../public/assets/webinar 1 (3).jpg'

export default function WebinarPage1() {
  return (
    <motion.div
      className="bg-gradient-to-b from-white to-blue-50 py-16 text-gray-900 dark:from-gray-900 dark:to-slate-800 dark:text-slate-200"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto flex flex-col items-center justify-between px-4 lg:flex-row lg:px-8">
        <motion.div
          className="space-y-6 lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl font-bold lg:text-5xl">
              Transform Your <br />
              <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent dark:from-red-500 dark:to-yellow-400">
                Webinar Experience
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg leading-relaxed text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Create stunning, interactive webinars that convert. Our AI-powered
            platform handles engagement, answers questions, and drives sales
            while you focus on what matters most - your content and audience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-lg text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                2,500+
              </span>{' '}
              creators already using our platform
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 flex justify-center lg:mt-0 lg:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="relative h-[280px] w-[420px] sm:h-[320px] sm:w-[480px] md:h-[360px] md:w-[520px]">
            <motion.div
              className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur dark:from-blue-700 dark:to-purple-700 dark:opacity-30"
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
                alt="Webinar Platform Preview"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <motion.button
                className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg dark:from-blue-500 dark:to-purple-500"
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

      <motion.div
        className="mt-16 rounded-xl bg-white py-8 shadow-md dark:bg-gray-800/70"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between px-4 lg:px-8">
          <motion.div
            className="flex items-center text-lg font-medium text-gray-700 dark:text-slate-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="mr-2 text-2xl">✅</span> Trusted by over{' '}
            <span className="ml-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
              18,000+ businesses
            </span>
          </motion.div>

          <motion.div
            className="mt-4 flex items-center space-x-2 text-lg lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="flex text-yellow-500 dark:text-yellow-400">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-transparent dark:from-blue-400 dark:to-purple-400">
              4.8/5 stars on G2
            </span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
