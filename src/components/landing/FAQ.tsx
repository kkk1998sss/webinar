import React, { useState } from 'react';
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaFemale,
  FaHandsHelping,
  FaLeaf,
  FaMagic,
  FaRegClock,
  FaSmile,
  FaUserGraduate,
  FaUserTie,
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

// Shree Suktam Sadhana FAQs
const faqs = [
  {
    question: 'What is Shree Suktam Sadhana?',
    answer:
      'Shree Suktam Sadhana is a spiritual practice involving chanting the Shree Suktam hymn dedicated to Goddess Lakshmi to attract prosperity, abundance, and spiritual growth.',
    icon: <FaLeaf className="text-yellow-600" />,
  },
  {
    question: 'What’s the best time to practice Shree Suktam?',
    answer:
      'You can practice Shree Suktam anytime as per your convenience. Early morning or Brahma Muhurta is ideal but not mandatory.',
    icon: <FaClock className="text-blue-500" />,
  },
  {
    question: 'Can women do Shree Suktam Sadhana?',
    answer:
      'Yes, women can perform Shree Suktam Sadhana 365 days a year without any restrictions. It is beneficial for the entire family.',
    icon: <FaFemale className="text-pink-500" />,
  },
  {
    question: 'How long does one session take?',
    answer:
      'A session typically lasts 15 to 30 minutes, depending on repetitions and meditation added.',
    icon: <FaRegClock className="text-purple-500" />,
  },
  {
    question: 'Is this sadhana suitable for beginners?',
    answer:
      'Absolutely, with proper guidance, beginners can easily learn and benefit from this sadhana.',
    icon: <FaUserGraduate className="text-green-500" />,
  },
  {
    question: 'What are the benefits of regular practice?',
    answer:
      'It brings wealth, removes obstacles, enhances mental peace, and supports overall prosperity.',
    icon: <FaSmile className="text-orange-500" />,
  },
  {
    question: 'Do I need a guru to start Shree Suktam Sadhana?',
    answer:
      'Maharishi Angira Anantanand is the living guru of Shree Suktam Sadhana. You will receive direct guidance from him throughout the practice.',
    icon: <FaUserTie className="text-blue-700" />,
  },
  {
    question: 'Can Shree Suktam be done with other spiritual practices?',
    answer:
      'Yes, it complements other mantras and meditation practices effectively.',
    icon: <FaHandsHelping className="text-teal-500" />,
  },
  {
    question: 'What are the prerequisites before starting?',
    answer:
      'Cleanliness of body and mind, pure intentions, and a peaceful environment improve the sadhana’s effectiveness.',
    icon: <FaCheckCircle className="text-green-600" />,
  },
  {
    question: 'How soon will I see results?',
    answer:
      'With sincere and regular practice, positive changes can be experienced within a few weeks or months.',
    icon: <FaMagic className="text-yellow-500" />,
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    <section className="w-full bg-gradient-to-b from-yellow-50 to-white px-6 py-20 dark:from-yellow-900 dark:to-gray-900">
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
            className="mb-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
          >
            FAQs on Shree Suktam Sadhana
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
            Find answers to common questions about Shree Suktam Sadhana and how
            it can help you on your spiritual journey.
          </motion.p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="mx-auto max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="mb-4 overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-yellow-700 dark:bg-slate-800"
              variants={itemVariants}
            >
              <motion.button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                whileHover={{ backgroundColor: 'rgba(253, 224, 71, 0.08)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900">
                    {faq.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h4>
                </div>
                <div className="ml-4 shrink-0">
                  {activeIndex === index ? (
                    <FaChevronUp className="size-5 text-yellow-600" />
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
                    <div className="border-t border-yellow-100 p-5 text-gray-600 dark:border-yellow-700 dark:text-gray-300">
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
          className="mx-auto mt-16 max-w-3xl rounded-xl bg-gradient-to-r from-yellow-500 to-orange-400 p-8 text-center text-white shadow-xl dark:from-yellow-700 dark:to-orange-600"
        >
          <h3 className="mb-4 text-2xl font-bold">Still have questions?</h3>
          <p className="mb-6 text-lg text-white/90">
            Our support team is here to help you with any questions or concerns
            you may have about Shree Suktam Sadhana.
          </p>
          <motion.button
            className="rounded-full bg-white px-6 py-3 font-bold text-yellow-700 shadow-lg transition-all duration-300 hover:bg-yellow-50 dark:bg-slate-200 dark:text-yellow-700 dark:hover:bg-slate-300"
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
