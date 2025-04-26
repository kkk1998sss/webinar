import * as React from 'react';
import { motion } from 'framer-motion';
import { Clock, Lock, Settings, Sparkles, Users, Video } from 'lucide-react';

const WebinarWatchRoom = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Watch Room
        </h2>
        <p className="mt-2 text-gray-600">
          Create an immersive experience for your webinar attendees
        </p>
      </motion.div>

      {/* Coming Soon Feature */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-center text-white shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <motion.div
            className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="size-10 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-white">Coming Soon</h3>
          <p className="mx-auto mt-3 max-w-md text-gray-200">
            We&apos;re working on something exciting! The Watch Room feature
            will be available soon with advanced customization options.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                icon: Video,
                title: 'HD Video Streaming',
                desc: 'Crystal clear video quality',
              },
              {
                icon: Settings,
                title: 'Custom Controls',
                desc: 'Tailored to your needs',
              },
              {
                icon: Clock,
                title: 'Live Scheduling',
                desc: 'Perfect timing every time',
              },
              {
                icon: Users,
                title: 'Interactive Features',
                desc: 'Engage with your audience',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="rounded-lg bg-white/20 p-4 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{
                  y: -5,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                }}
              >
                <feature.icon className="mx-auto size-6 text-blue-300" />
                <h4 className="mt-2 text-sm font-medium text-white">
                  {feature.title}
                </h4>
                <p className="mt-1 text-xs text-gray-200">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Lock className="size-4" />
            <span>Feature in development</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Watch Room Builder Button (Disabled) */}
      <motion.div
        className="group relative mt-6 w-full cursor-not-allowed overflow-hidden rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 p-8 text-center text-white shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-700/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20">
            <Video className="size-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Watch Room Builder</h3>
          <p className="mt-2 text-sm text-gray-200">
            Coming soon - Stay tuned for updates
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WebinarWatchRoom;
