import React, { useState } from 'react';
import {
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaCog,
  FaGlobe,
  FaMobileAlt,
  FaRocket,
  FaShieldAlt,
  FaUsers,
  FaVideo,
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

// Project-specific FAQs
const faqs = [
  {
    question: 'What is WebinarKit and how does it work?',
    answer: `WebinarKit is a comprehensive webinar platform that allows you to create, host, and manage webinars with ease. It provides tools for registration, live streaming, recording, analytics, and audience engagement. The platform supports both live and automated webinars, making it perfect for businesses of all sizes.`,
    icon: <FaVideo className="text-blue-500" />,
    category: 'general',
  },
  {
    question: 'What types of webinars can I create with WebinarKit?',
    answer:
      'WebinarKit supports multiple webinar formats including live webinars, automated webinars, webinar series, and hybrid events. You can create instant-watch webinars, just-in-time sessions, and scheduled events with customizable settings to match your specific needs.',
    icon: <FaRocket className="text-purple-500" />,
    category: 'features',
  },
  {
    question: 'How do I set up an automated webinar?',
    answer:
      "Setting up an automated webinar is simple with WebinarKit. You can upload your pre-recorded video, set the date and time for when it should go live, configure registration settings, and customize the watch room. The platform handles everything from registration to delivery, allowing you to reach your audience even when you're not available.",
    icon: <FaCog className="text-green-500" />,
    category: 'features',
  },
  {
    question:
      'What is the difference between Instant Watch and Just-In-Time webinars?',
    answer:
      'Instant Watch webinars are immediately available to viewers without any waiting period, perfect for on-demand content. Just-In-Time webinars have a configurable waiting period (from 1 minute to 24 hours) before they become available, allowing you to create anticipation and manage viewer expectations.',
    icon: <FaUsers className="text-orange-500" />,
    category: 'features',
  },
  {
    question: 'Can I customize the appearance of my webinar pages?',
    answer:
      'Yes! WebinarKit offers extensive customization options for all your webinar pages. You can customize registration forms, watch rooms, thank-you pages, and resource sections to match your brand identity. The platform supports custom colors, fonts, logos, and layouts to create a cohesive experience for your audience.',
    icon: <FaGlobe className="text-indigo-500" />,
    category: 'customization',
  },
  {
    question: 'What engagement features are available during webinars?',
    answer:
      'WebinarKit includes a variety of engagement tools such as live chat, polls, Q&A sessions, handouts, and resource downloads. You can also enable features like raise hand, reactions, and private messaging to enhance audience participation and create an interactive experience.',
    icon: <FaUsers className="text-pink-500" />,
    category: 'features',
  },
  {
    question: 'How do I track webinar performance and analytics?',
    answer:
      'WebinarKit provides comprehensive analytics to track your webinar performance. You can monitor registration rates, attendance, engagement metrics, chat activity, and conversion rates. The platform also offers detailed reports on viewer behavior, allowing you to optimize your future webinars for better results.',
    icon: <FaChartLine className="text-teal-500" />,
    category: 'analytics',
  },
  {
    question: 'Is my webinar content secure?',
    answer:
      'Yes, WebinarKit prioritizes security for your content. The platform offers features like password protection, domain restrictions, and IP blocking to control access to your webinars. You can also enable features like watermarking and disable downloads to protect your intellectual property.',
    icon: <FaShieldAlt className="text-red-500" />,
    category: 'security',
  },
  {
    question: 'Can I access my webinars on mobile devices?',
    answer:
      'Absolutely! WebinarKit is fully responsive and works seamlessly on all devices including smartphones, tablets, and desktop computers. Your audience can register, attend, and interact with your webinars from any device with an internet connection, ensuring maximum accessibility.',
    icon: <FaMobileAlt className="text-blue-500" />,
    category: 'accessibility',
  },
  {
    question: 'What integrations are available with WebinarKit?',
    answer:
      'WebinarKit integrates with popular platforms including email marketing tools, CRM systems, payment gateways, and analytics services. You can connect with tools like Mailchimp, Salesforce, Stripe, and Google Analytics to streamline your workflow and enhance your marketing efforts.',
    icon: <FaCog className="text-gray-500" />,
    category: 'integrations',
  },
  {
    question: 'How do I monetize my webinars?',
    answer:
      'WebinarKit offers multiple monetization options for your webinars. You can sell tickets, create membership sites, offer upsells and downsells, and implement one-time or subscription-based pricing models. The platform includes built-in payment processing and sales page templates to help you maximize revenue.',
    icon: <FaChartLine className="text-yellow-500" />,
    category: 'monetization',
  },
  {
    question: 'What support options are available?',
    answer:
      'WebinarKit provides comprehensive support through multiple channels including email, live chat, knowledge base, and video tutorials. Premium plans include priority support with faster response times. The platform also offers regular webinars and training sessions to help you get the most out of your webinars.',
    icon: <FaUsers className="text-green-500" />,
    category: 'support',
  },
];

// Categories for filtering
const categories = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'features', label: 'Features' },
  { id: 'customization', label: 'Customization' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'security', label: 'Security' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'monetization', label: 'Monetization' },
  { id: 'support', label: 'Support' },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter FAQs based on selected category
  const filteredFaqs =
    activeCategory === 'all'
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

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
  };

  const contentVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.25,
          delay: 0.15,
        },
      },
    },
  };

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white px-6 py-20 dark:from-slate-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400"
          >
            Got Questions?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300"
          >
            Find answers to common questions about WebinarKit and how it can
            help your business grow.
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
              }`}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="mx-auto max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              variants={itemVariants}
            >
              <motion.button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 dark:bg-slate-700">
                    {faq.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h4>
                </div>
                <div className="ml-4 shrink-0">
                  {activeIndex === index ? (
                    <FaChevronUp className="size-5 text-blue-500" />
                  ) : (
                    <FaChevronDown className="size-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </motion.button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={contentVariants}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 p-5 text-gray-600 dark:border-slate-700 dark:text-gray-300">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-3xl rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white shadow-xl dark:from-blue-500 dark:to-indigo-500"
        >
          <h3 className="mb-4 text-2xl font-bold">Still have questions?</h3>
          <p className="mb-6 text-lg text-white/90">
            Our support team is here to help you with any questions or concerns
            you may have about WebinarKit.
          </p>
          <motion.button
            className="rounded-full bg-white px-6 py-3 font-bold text-blue-600 shadow-lg transition-all duration-300 hover:bg-gray-100 dark:bg-slate-200 dark:text-blue-600 dark:hover:bg-slate-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
