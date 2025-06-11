import React, { useState } from 'react';
import {
  FaBrain,
  FaBriefcase,
  FaMagic,
  FaPrayingHands,
  FaQuestion,
  FaSeedling,
  FaSpa,
  FaUserGraduate,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Combined and enhanced business & participant types with descriptions and alternate names
type CombinedType = {
  icon: React.ReactElement;
  label: string;
  description: string;
  color: string;
  alternateNames?: string[];
};

const combinedTypes: CombinedType[] = [
  {
    icon: <FaUserGraduate size={30} />,
    label: 'Students',
    description: 'Explore spirituality beyond books and develop inner wisdom.',
    color: 'from-blue-500 to-indigo-600',
    alternateNames: ['Pupils', 'Learners'], // Add if needed
  },
  {
    icon: <FaBriefcase size={30} />,
    label: 'Professionals',
    description: 'Manage stress and improve focus through meditation.',
    color: 'from-purple-500 to-pink-600',
    alternateNames: ['Employees', 'Workers'], // Add if needed
  },
  {
    icon: <FaPrayingHands size={30} />,
    label: 'Spiritual Seekers',
    description: 'Deepen your connection with ancient spiritual practices.',
    color: 'from-cyan-500 to-blue-600',
    alternateNames: ['Devotees'], // Add if needed
  },
  {
    icon: <FaMagic size={30} />,
    label: 'Occult Science Practitioners',
    description: 'Enhance your skills with authentic tantric techniques.',
    color: 'from-green-500 to-emerald-600',
    alternateNames: ['Mystics'], // Add if needed
  },
  {
    icon: <FaSpa size={30} />,
    label: 'Yoga Enthusiasts',
    description: 'Complement your practice with advanced spiritual knowledge.',
    color: 'from-red-500 to-orange-600',
    alternateNames: ['Yogis'], // Add if needed
  },
  {
    icon: <FaBrain size={30} />,
    label: 'Meditation Learners',
    description: 'Master diverse and powerful meditation methods.',
    color: 'from-gray-600 to-gray-800',
    alternateNames: ['Meditators'], // Add if needed
  },
  {
    icon: <FaSeedling size={30} />,
    label: 'Personal Growth Seekers',
    description: 'Transform your life with proven spiritual tools.',
    color: 'from-indigo-500 to-purple-600',
    alternateNames: ['Self-improvers'], // Add if needed
  },
  {
    icon: <FaQuestion size={30} />,
    label: 'Anyone Curious About Spirituality',
    description:
      'Open to all sincere individuals wanting inner peace and self-realization.',
    color: 'from-blue-600 to-cyan-600',
    alternateNames: ['Curious Minds'], // Add if needed
  },
];

const BusinessTypes = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      y: -5,
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  return (
    <section
      id="testimonials"
      className="w-full bg-gradient-to-b from-gray-900 to-gray-800 px-6 py-40 text-center text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <motion.p
          className="mb-2 text-sm uppercase tracking-wide text-yellow-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
        >
          Endless Use Cases
        </motion.p>
        <motion.h2
          className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
        >
          All types of businesses can massively benefit from
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            {' '}
            Webinars
          </span>
        </motion.h2>
        <motion.p
          className="mx-auto mb-12 max-w-2xl text-lg text-gray-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
        >
          Automating your business has never been this easy. Connect with your
          audience, showcase your expertise, and grow your business with
          powerful webinars.
        </motion.p>
      </motion.div>

      <motion.div
        className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {combinedTypes.map((type, index) => (
          <motion.div
            key={index}
            className="group relative overflow-hidden rounded-xl bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
            variants={itemVariants}
            whileHover="hover"
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            {/* Background gradient that appears on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            ></div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center">
              <motion.div
                className="mb-4 text-teal-400 transition-colors duration-300 group-hover:text-white"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {type.icon}
              </motion.div>

              <h3 className="mb-2 text-xl font-bold text-white">
                {type.label}
              </h3>

              {/* Alternate names - only for business types */}
              {type.alternateNames && (
                <div className="mb-3 flex flex-wrap justify-center gap-1">
                  {type.alternateNames.map((name, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300 transition-colors duration-300 group-hover:bg-gray-600"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Description - visible on hover */}
              <motion.p
                className="text-sm text-gray-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                initial={{ height: 0 }}
                animate={{ height: hoveredIndex === index ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
              >
                {type.description}
              </motion.p>

              {/* Learn more button - visible on hover for business types */}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to action - only for business types */}
      <motion.div
        className="mx-auto mt-16 max-w-3xl rounded-xl bg-gradient-to-r from-red-600 to-yellow-400 p-8 text-center shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h3 className="mb-4 text-2xl font-bold text-white">
          Ready to transform your life with spirituality?
        </h3>
        <p className="mb-6 text-lg text-white/90">
          Join seekers from all walks of life and experience deep transformation
          with our 6-Month Spiritual Course.
        </p>
        <motion.button
          className="rounded-full bg-white px-6 py-3 font-bold text-red-600 shadow-lg transition-all duration-300 hover:bg-yellow-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const section = document.getElementById('pricing');
            if (section) {
              section.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Get Started Today
        </motion.button>
      </motion.div>
    </section>
  );
};

export default BusinessTypes;
