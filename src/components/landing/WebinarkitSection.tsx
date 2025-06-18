import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getSession, signOut } from 'next-auth/react';

export default function WebinarKitSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-yellow-50 px-6 py-20 md:px-20 dark:from-gray-900 dark:to-slate-800">
      <div className="absolute -right-20 -top-20 size-80 rounded-full bg-yellow-100 opacity-30 blur-3xl dark:bg-yellow-900/50 dark:opacity-20"></div>

      <div className="relative flex flex-col items-center justify-between gap-12 md:flex-row">
        <motion.div
          className="flex w-full flex-col items-center justify-center md:w-1/2 md:justify-center"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative flex h-full flex-col items-center justify-center">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-white to-yellow-50 opacity-20 blur-lg dark:from-gray-900 dark:to-slate-800 dark:opacity-30"></div>
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/assets/spritual.png"
                alt="WebinarKit Illustration"
                width={600}
                height={400}
                className="h-auto w-full transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 text-center md:text-left"
          >
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-yellow-400 px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-yellow-50 hover:text-red-700"
              onClick={async (event) => {
                event.preventDefault();
                const session = await getSession();
                if (session) {
                  await signOut({ redirect: false });
                }
                window.location.href = '/auth/register';
              }}
            >
              Register for the masterclass now!
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="flex w-full flex-col justify-center text-left md:w-1/2"
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
            Why Join Our{' '}
            <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent dark:from-red-500 dark:to-yellow-400">
              Shree Suktam Sadhana
            </span>{' '}
            Webinar?
          </motion.h2>

          {/* New checklist section */}
          <motion.ul
            className="mb-8 space-y-3 text-base text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <li className="flex items-center gap-2">
              <span className="text-xl text-green-600">✅</span>
              Unable to maintain focus, peace, or consistency
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xl text-green-600">✅</span>
              Looking for divine support in difficult times
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xl text-green-600">✅</span>
              Want to invite abundance, peace, and grace into life
            </li>
          </motion.ul>

          <motion.ul
            className="space-y-8 text-base text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <li className="flex flex-col gap-2">
              <span className="flex items-center text-lg font-semibold">
                <span className="mr-2 text-2xl">🔱</span>
                1. Guided Mantra Chanting with Proper Vidhi
              </span>
              <span>
                Receive authentic guidance on how to chant the Shree Suktam with
                correct pronunciation, rhythm, and spiritual method — ensuring
                your sadhana is powerful and fruitful.
              </span>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
            </li>
            <li className="flex flex-col gap-2">
              <span className="flex items-center text-lg font-semibold">
                <span className="mr-2 text-2xl">🧘‍♀️</span>
                2. Live Webinars Every Sunday at 10:00 AM
              </span>
              <span>
                Join weekly interactive satsangs and teachings with spiritual
                mentors to clarify doubts, deepen your understanding, and stay
                connected with divine energy and sangha.
              </span>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
            </li>
            <li className="flex flex-col gap-2">
              <span className="flex items-center text-lg font-semibold">
                <span className="mr-2 text-2xl">🎥</span>
                3. Daily Practice Videos for Consistency
              </span>
              <span>
                Access daily video content including mantra recitations, sadhana
                instructions, and spiritual insights — helping you maintain
                regularity and devotion throughout the 6 months.
              </span>
            </li>
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
