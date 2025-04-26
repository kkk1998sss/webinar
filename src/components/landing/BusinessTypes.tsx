import React, { useState } from 'react';
import {
  FaBookOpen,
  FaBriefcase,
  FaBullhorn,
  FaCalculator,
  FaChalkboardTeacher,
  FaEllipsisH,
  FaHome,
  FaLaptopCode,
  FaThumbsUp,
  FaTooth,
  FaUserMd,
  FaUserTie,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Enhanced business types with descriptions and alternate names
const businessTypes = [
  {
    icon: <FaChalkboardTeacher size={30} />,
    label: 'Coaches',
    alternateNames: [
      'Life Coaches',
      'Business Coaches',
      'Fitness Trainers',
      'Wellness Experts',
    ],
    description:
      'Transform lives through personalized coaching sessions and group programs. Perfect for life, business, health, and wellness coaches.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: <FaBookOpen size={30} />,
    label: 'Course Creators',
    alternateNames: [
      'Online Educators',
      'Knowledge Entrepreneurs',
      'Digital Learning Experts',
      'Edupreneurs',
    ],
    description:
      'Share your expertise with the world through engaging online courses and educational content.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: <FaLaptopCode size={30} />,
    label: 'SaaS Businesses',
    alternateNames: [
      'Software Companies',
      'Tech Startups',
      'Digital Solutions',
      'Cloud Services',
    ],
    description:
      'Showcase your software solutions and drive adoption through interactive product demonstrations.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <FaHome size={30} />,
    label: 'Real Estate',
    alternateNames: [
      'Property Agents',
      'Real Estate Investors',
      'Property Managers',
      'Real Estate Brokers',
    ],
    description:
      'Connect with potential clients and showcase properties through virtual tours and market updates.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: <FaBullhorn size={30} />,
    label: 'Marketing Agencies',
    alternateNames: [
      'Digital Marketers',
      'Ad Agencies',
      'Brand Strategists',
      'Marketing Consultants',
    ],
    description:
      'Demonstrate your marketing expertise and attract new clients with compelling case studies.',
    color: 'from-red-500 to-orange-600',
  },
  {
    icon: <FaBriefcase size={30} />,
    label: 'Professional Services',
    alternateNames: [
      'Law Firms',
      'Consulting Firms',
      'Business Advisors',
      'Service Providers',
    ],
    description:
      'Share industry insights and attract new clients through educational webinars and workshops.',
    color: 'from-gray-600 to-gray-800',
  },
  {
    icon: <FaUserTie size={30} />,
    label: 'Consultants',
    alternateNames: [
      'Business Consultants',
      'Strategy Advisors',
      'Industry Experts',
      'Professional Advisors',
    ],
    description:
      'Position yourself as an industry authority and generate leads through valuable insights.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: <FaCalculator size={30} />,
    label: 'Accountants',
    alternateNames: [
      'Financial Advisors',
      'Tax Specialists',
      'Bookkeepers',
      'Financial Planners',
    ],
    description:
      'Educate clients on financial matters and showcase your expertise in tax and accounting.',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    icon: <FaThumbsUp size={30} />,
    label: 'Chiropractors',
    alternateNames: [
      'Wellness Practitioners',
      'Health Specialists',
      'Physical Therapists',
      'Alternative Medicine',
    ],
    description:
      'Share wellness tips and attract new patients through educational health webinars.',
    color: 'from-teal-500 to-green-600',
  },
  {
    icon: <FaUserMd size={30} />,
    label: 'Doctors',
    alternateNames: [
      'Medical Practitioners',
      'Healthcare Providers',
      'Physicians',
      'Medical Specialists',
    ],
    description:
      'Connect with patients and share medical knowledge through informative health webinars.',
    color: 'from-blue-500 to-teal-600',
  },
  {
    icon: <FaTooth size={30} />,
    label: 'Dentists',
    alternateNames: [
      'Dental Practitioners',
      'Oral Health Specialists',
      'Dental Clinics',
      'Orthodontists',
    ],
    description:
      'Educate patients on oral health and showcase your dental expertise to attract new clients.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <FaEllipsisH size={30} />,
    label: 'Many More',
    alternateNames: [
      'Other Industries',
      'Specialized Businesses',
      'Niche Markets',
      'Emerging Sectors',
    ],
    description:
      'WebinarKit adapts to any business type, helping you connect with your audience and grow your business.',
    color: 'from-gray-500 to-gray-700',
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
          All types of businesses can massively benefit from WebinarKit
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
        {businessTypes.map((type, index) => (
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

              {/* Alternate names */}
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

              {/* Description - visible on hover */}
              <motion.p
                className="text-sm text-gray-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                initial={{ height: 0 }}
                animate={{ height: hoveredIndex === index ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
              >
                {type.description}
              </motion.p>

              {/* Learn more button - visible on hover */}
              <motion.button
                className="mt-4 rounded-full bg-white px-4 py-1 text-sm font-medium text-gray-800 opacity-0 transition-all duration-300 group-hover:opacity-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to action */}
      <motion.div
        className="mx-auto mt-16 max-w-3xl rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h3 className="mb-4 text-2xl font-bold text-white">
          Ready to transform your business with webinars?
        </h3>
        <p className="mb-6 text-lg text-white/90">
          Join thousands of businesses already using WebinarKit to connect with
          their audience and grow their business.
        </p>
        <motion.button
          className="rounded-full bg-white px-6 py-3 font-bold text-blue-600 shadow-lg transition-all duration-300 hover:bg-gray-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Today
        </motion.button>
      </motion.div>
    </section>
  );
};

export default BusinessTypes;
