import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  BookText,
  Brain,
  DollarSign,
  Feather,
  Flame,
  Sparkles,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const WebinarKitSectionPlatform = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-t from-white to-yellow-50 px-6 py-20 md:px-16 dark:from-gray-900 dark:to-slate-800">
      {/* Background decorative elements */}
      <div className="absolute -right-20 top-20 size-80 rounded-full bg-yellow-100 opacity-30 blur-3xl dark:bg-yellow-900/50 dark:opacity-20"></div>
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-yellow-200 opacity-30 blur-3xl dark:bg-yellow-900/50 dark:opacity-20"></div>

      <div className="relative flex flex-col items-center justify-between gap-12 md:flex-row">
        {/* Left Content */}
        <motion.div
          className="flex flex-col items-center md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative w-full">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-white to-yellow-50 opacity-20 blur-lg dark:from-gray-900 dark:to-slate-800 dark:opacity-30"></div>
            <motion.div
              className="relative overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text px-4 py-2 text-sm font-semibold text-transparent dark:from-red-500 dark:to-yellow-400 dark:text-slate-200">
                6-Month Spiritual Course
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/assets/Spiritual.jpg"
                  alt="Webinar Preview"
                  width={800}
                  height={450}
                  className="h-auto w-full transition-transform duration-700 hover:scale-105"
                />
              </div>
              <motion.div
                className="absolute -right-4 -top-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 p-3 text-white shadow-lg dark:from-yellow-400 dark:to-yellow-500"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <Sparkles className="size-6" />
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
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-yellow-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-yellow-50 hover:text-red-700"
            >
              Explore all plans
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          className="text-left md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
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
            What You Will Get in the{' '}
            <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent dark:from-yellow-400 dark:to-yellow-300">
              6-Month Spiritual Course
            </span>
          </motion.h2>

          <motion.ul
            className="space-y-6 text-base text-gray-800 dark:text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <li className="flex items-start gap-4">
              <BookOpen className="mt-1 size-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <strong className="block font-semibold text-gray-900 dark:text-white">
                  1. Vigyan Bhairav Tantra
                </strong>
                <span className="block text-gray-700 dark:text-gray-300">
                  Learn over 70 ancient and powerful meditation techniques
                  revealed in the Vigyan Bhairav Tantra — a timeless scripture
                  that unlocks deep states of consciousness and spiritual
                  awakening.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Flame className="mt-1 size-6 text-orange-500 dark:text-orange-300" />
              <div>
                <strong className="block font-semibold text-gray-900 dark:text-white">
                  2. Kundalini Sadhana
                </strong>
                <span className="block text-gray-700 dark:text-gray-300">
                  Master the art of awakening and balancing your Kundalini
                  energy through guided sadhana practices designed to activate
                  your inner spiritual power safely and effectively.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Feather className="mt-1 size-6 text-yellow-500 dark:text-yellow-300" />
              <div>
                <strong className="block font-semibold text-gray-900 dark:text-white">
                  3. Spiritual Secrets of Hanuman Chalisa
                </strong>
                <span className="block text-gray-700 dark:text-gray-300">
                  Discover the hidden spiritual wisdom and mantras within the
                  Hanuman Chalisa, enhancing your devotion, courage, and inner
                  strength.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <DollarSign className="mt-1 size-6 text-green-500 dark:text-green-300" />
              <div>
                <strong className="block font-semibold text-gray-900 dark:text-white">
                  4. Discounted Prices on Advanced Sadhanas
                </strong>
                <span className="block text-gray-700 dark:text-gray-300">
                  Enjoy exclusive discounts on higher-level spiritual practices
                  and courses, enabling you to deepen your journey without
                  financial stress.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <BookText className="mt-1 size-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <strong className="block font-semibold text-gray-900 dark:text-white">
                  5. E-books and Study Materials
                </strong>
                <span className="block text-gray-700 dark:text-gray-300">
                  Receive a collection of comprehensive e-books, guides, and
                  sacred texts to support your learning and daily practice.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Brain className="mt-1 size-6 text-yellow-700 dark:text-yellow-400" />
              <div>
                <strong className="block font-semibold text-gray-900 dark:text-white">
                  6. Upanishad Gyan
                </strong>
                <span className="block text-gray-700 dark:text-gray-300">
                  Dive into the profound teachings of the Upanishads, exploring
                  the philosophy that forms the foundation of spiritual wisdom.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Users className="mt-1 size-6 text-pink-500 dark:text-pink-300" />
              <div>
                <strong className="block font-semibold text-gray-900 dark:text-white">
                  7. And Much More
                </strong>
                <span className="block text-gray-700 dark:text-gray-300">
                  Along with regular live sessions, guided meditations, Q&amp;A,
                  and community support, the course offers a complete
                  transformational experience for your mind, body, and soul.
                </span>
              </div>
            </li>
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
};

export default WebinarKitSectionPlatform;
