import { useState } from 'react';
import {
  FaFacebook,
  FaHeadset,
  FaHeart,
  FaInstagram,
  FaLightbulb,
  FaLinkedin,
  FaRocket,
  FaTwitter,
  FaUsers,
  FaYoutube,
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Enhanced footer links with descriptions and icons
const footerSections = {
  features: {
    title: 'FEATURES',
    icon: <FaRocket className="text-blue-400" />,
    description: 'Discover powerful tools to grow your business',
    links: [
      {
        label: 'Live Webinars',
        href: '/features/live',
        description: 'Host engaging live sessions with your audience',
      },
      {
        label: 'Automated Webinars',
        href: '/features/automated',
        description: 'Create evergreen content that works 24/7',
      },
      {
        label: 'Analytics',
        href: '/features/analytics',
        description: 'Track performance and optimize results',
      },
      {
        label: 'Integrations',
        href: '/features/integrations',
        description: 'Connect with your favorite tools',
      },
    ],
  },
  resources: {
    title: 'RESOURCES',
    icon: <FaLightbulb className="text-yellow-400" />,
    description: 'Learn and grow with our resources',
    links: [
      {
        label: 'Knowledge Base',
        href: '/resources/knowledge',
        description: 'In-depth guides and tutorials',
      },
      {
        label: 'Blog',
        href: '/blog',
        description: 'Latest tips and best practices',
      },
      {
        label: 'Case Studies',
        href: '/case-studies',
        description: 'Success stories from our users',
      },
      {
        label: 'Webinar Templates',
        href: '/templates',
        description: 'Ready-to-use presentation templates',
      },
    ],
  },
  company: {
    title: 'COMPANY',
    icon: <FaUsers className="text-green-400" />,
    description: 'Get to know us better',
    links: [
      {
        label: 'About Us',
        href: '/about',
        description: 'Our mission and values',
      },
      {
        label: 'Careers',
        href: '/careers',
        description: 'Join our growing team',
      },
      {
        label: 'Partners',
        href: '/partners',
        description: 'Collaborate with us',
      },
      {
        label: 'Contact',
        href: '/contact',
        description: 'Get in touch with our team',
      },
    ],
  },
  support: {
    title: 'SUPPORT',
    icon: <FaHeadset className="text-purple-400" />,
    description: "We're here to help you succeed",
    links: [
      {
        label: 'Help Center',
        href: '/help',
        description: '24/7 customer support',
      },
      {
        label: 'Community',
        href: '/community',
        description: 'Connect with other users',
      },
      {
        label: 'Status',
        href: '/status',
        description: 'System performance and updates',
      },
      {
        label: 'Feedback',
        href: '/feedback',
        description: 'Share your suggestions',
      },
    ],
  },
};

export const Footer = () => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isNewsletterFocused, setIsNewsletterFocused] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter submission
    setEmail('');
  };

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
        {/* Newsletter Section */}
        <motion.div
          className="container mx-auto px-6 pb-16 pt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 shadow-xl">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <motion.h3
                  className="mb-2 text-2xl font-bold"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Join Our Newsletter
                </motion.h3>
                <motion.p
                  className="text-white/90"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Get the latest updates, tips, and special offers delivered
                  directly to your inbox.
                </motion.p>
              </div>
              <form onSubmit={handleSubmit} className="flex items-center">
                <div className="relative grow">
                  <motion.input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-l-full bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-all duration-300 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    onFocus={() => setIsNewsletterFocused(true)}
                    onBlur={() => setIsNewsletterFocused(false)}
                    whileFocus={{ scale: 1.02 }}
                  />
                  <AnimatePresence>
                    {isNewsletterFocused && (
                      <motion.span
                        className="absolute -bottom-6 left-0 text-sm text-white/80"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        Join 10,000+ subscribers
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  type="submit"
                  className="rounded-r-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-6 pb-12">
          {/* Main Footer Content */}
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(footerSections).map(([key, section]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onHoverStart={() => setHoveredSection(key)}
                onHoverEnd={() => setHoveredSection(null)}
              >
                <div className="mb-4 flex items-center gap-2">
                  {section.icon}
                  <h3 className="font-semibold text-gray-300">
                    {section.title}
                  </h3>
                </div>
                <p className="mb-4 text-sm text-gray-400">
                  {section.description}
                </p>
                <div className="space-y-2">
                  {section.links.map((link, index) => (
                    <motion.div
                      key={index}
                      className="group block"
                      whileHover={{ x: 5 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <Link
                        href={link.href}
                        className="block text-gray-400 transition-colors duration-300 hover:text-blue-400"
                      >
                        <span className="text-sm font-medium">
                          {link.label}
                        </span>
                        <AnimatePresence>
                          {hoveredSection === key && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-1 text-xs text-gray-500"
                            >
                              {link.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social Links */}
          <motion.div
            className="my-12 flex flex-wrap items-center justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {[
              {
                icon: <FaFacebook size={24} />,
                label: 'Facebook',
                color: 'hover:text-blue-500',
              },
              {
                icon: <FaTwitter size={24} />,
                label: 'Twitter',
                color: 'hover:text-blue-400',
              },
              {
                icon: <FaLinkedin size={24} />,
                label: 'LinkedIn',
                color: 'hover:text-blue-600',
              },
              {
                icon: <FaInstagram size={24} />,
                label: 'Instagram',
                color: 'hover:text-pink-500',
              },
              {
                icon: <FaYoutube size={24} />,
                label: 'YouTube',
                color: 'hover:text-red-500',
              },
            ].map((social, index) => (
              <motion.a
                key={index}
                href="#"
                className={`group flex items-center gap-2 text-gray-400 transition-colors duration-300 ${social.color}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {social.icon}
                <span className="text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {social.label}
                </span>
              </motion.a>
            ))}
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            className="border-t border-gray-800 py-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
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
              <Link href="/terms" className="hover:text-blue-400">
                Terms
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-blue-400">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-blue-400">
                Cookies
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-sm text-gray-500">
              <span>
                Made with <FaHeart className="inline text-red-500" /> by{' '}
                <Link
                  href="https://rsatechsoftware.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-300 hover:text-blue-400"
                >
                  RSA Tech Software
                </Link>{' '}
                © {new Date().getFullYear()}
              </span>
              <span>
                Contact:{' '}
                <a
                  href="tel:8009448518"
                  className="transition-colors duration-300 hover:text-blue-400"
                >
                  8009448518
                </a>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
