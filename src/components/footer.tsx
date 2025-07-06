import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative w-full bg-[#0A1833] text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="absolute -top-1 left-0 w-full"
      >
        <motion.path
          fill="#0A1833"
          fillOpacity="1"
          d="M0,160 Q120,80 240,160 T480,160 T720,140 T960,160 T1200,160 Q1320,80 1440,160 L1440,320 L0,320 Z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        ></motion.path>
      </svg>

      <div className="relative z-10 rounded-t-3xl">
        {/* Limited-Time Enrolment Section */}
        <motion.div
          className="container mx-auto px-6 pb-16 pt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-red-600 to-yellow-400 p-8 shadow-xl">
            <div className="flex flex-col items-center justify-center gap-4">
              <motion.h3
                className="mb-2 text-2xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Limited-Time Enrolment with Bonus Gifts!
              </motion.h3>
              <motion.p
                className="text-center text-white/90"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Enroll now in the 6-Month Shree Suktam Sadhana Course and
                receive exclusive bonus gifts, personal guidance, and access to
                a vibrant spiritual community. Don’t miss this opportunity to
                transform your life!
              </motion.p>
              <motion.a
                href="#pricing"
                role="button"
                tabIndex={0}
                className="mt-4 rounded-full bg-white px-8 py-3 font-bold text-red-600 shadow-lg transition-all duration-300 hover:bg-yellow-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  const section = document.getElementById('pricing');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Enroll Now
              </motion.a>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-6 pb-12">
          {/* Main Footer Content */}
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="mb-4 flex justify-center">
              <Image
                src="/assets/shree-maaha.png"
                alt="Shree Maaha Logo"
                width={260}
                height={53}
                className="object-contain mix-blend-screen"
              />
            </div>
            <div className="mb-4 flex justify-center gap-4 text-sm text-gray-400">
              <Link href="/about" className="hover:text-yellow-300">
                About
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-yellow-300">
                Contact
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-yellow-300">
                Privacy
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-sm text-gray-500">
              <span>
                Made with <FaHeart className="inline text-red-500" /> by{' '}
                <Link
                  href="https://rsatechsoftware.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-300 hover:text-yellow-300"
                >
                  RSA Tech Software
                </Link>{' '}
                © {currentYear || '2024'}
              </span>
              <span>
                Contact:{' '}
                <a
                  href="tel:8009448518"
                  className="transition-colors duration-300 hover:text-yellow-300"
                >
                  8009448518
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
