import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Calendar,
  Lightbulb,
  MessageSquare,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const WebinarKitSectionPlatform = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-indigo-50 px-6 py-20 md:px-16">
      {/* Background decorative elements */}
      <div className="absolute -right-20 top-20 size-80 rounded-full bg-indigo-100 opacity-30 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-blue-100 opacity-30 blur-3xl"></div>

      <div className="relative flex flex-col items-start justify-between gap-12 md:flex-row">
        {/* Left Content */}
        <motion.div
          className="flex flex-col items-center md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative w-full">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-lg"></div>
            <motion.div
              className="relative overflow-hidden rounded-xl bg-white shadow-2xl"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 text-sm font-semibold text-gray-800">
                WebinarKit
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/assets/webinar 1 (1).jpg"
                  alt="Webinar Preview"
                  width={800}
                  height={450}
                  className="h-auto w-full transition-transform duration-700 hover:scale-105"
                />
              </div>
              <motion.div
                className="absolute -right-4 -top-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-3 text-white shadow-lg"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <Brain className="size-6" />
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
              href="/pricing"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30"
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
            className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            The Only Platform Designed for{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Maximum Leads, Attendees & Conversions
            </span>
          </motion.h2>

          <motion.p
            className="mb-8 text-lg text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            WebinarKit is the only platform fully equipped with everything you
            need to generate leads, maximize attendance, and close more sales
            effortlessly.
          </motion.p>

          <motion.ul
            className="space-y-5 text-base text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {[
              {
                title: 'AI-Optimized Email, SMS & Calendar Reminders',
                description:
                  'Keep your audience engaged before, during, and after your webinar with smartly timed, AI-personalized follow-ups.',
                icon: <Calendar className="size-4" />,
              },
              {
                title: 'Turn "Maybe" into "Yes" with One-Click Registration',
                description:
                  'AI removes friction by pre-filling registration details, allowing attendees to sign up instantly with one click.',
                icon: <Zap className="size-4" />,
              },
              {
                title: 'AI-Powered CRM & Follow-Up Integration',
                description:
                  "Leads don't stop at the webinar. AI segments your audience, personalizes follow-ups, and automates retargeting via Zapier, Pabbly, and your favorite CRM.",
                icon: <Brain className="size-4" />,
              },
              {
                title:
                  'AI Chat That Sells for You - Never Miss a Chat Sale Again',
                description:
                  'AI answers questions, handles objections, and guides attendees to buy—hands-free.',
                icon: <MessageSquare className="size-4" />,
              },
              {
                title:
                  "A successful webinar isn't just about getting people to register",
                description:
                  "It's about making sure they show up, stay engaged, and convert into customers.",
                icon: <Lightbulb className="size-4" />,
                highlight: true,
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                className="group flex items-start gap-4 rounded-lg p-3 transition-all duration-300 hover:bg-white hover:shadow-md"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${item.highlight ? 'bg-yellow-100 text-yellow-500' : 'bg-indigo-100 text-indigo-600'}`}
                >
                  {item.icon}
                </span>
                <div>
                  <strong className="block font-semibold text-gray-900">
                    {item.title}
                  </strong>
                  <span className="text-gray-600">{item.description}</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
};

export default WebinarKitSectionPlatform;
