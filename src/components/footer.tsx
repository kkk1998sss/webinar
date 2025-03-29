import { FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="grow"></div>
      <div className="relative w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute -top-1 left-0 w-full"
        >
          <path
            fill="#0A1833"
            fillOpacity="1"
            d="M0,160 Q120,80 240,160 T480,160 T720,140 T960,160 T1200,160 Q1320,80 1440,160 L1440,320 L0,320 Z"
          ></path>
        </svg>
        <footer className="relative z-10 rounded-t-3xl bg-[#0A1833] py-12 text-white">
          <div className="container mx-auto px-6 text-center">
            <button className="mb-4 rounded-full bg-gray-700 px-4 py-2 text-sm uppercase tracking-widest text-gray-300 shadow-md">
              Get Started
            </button>
            <h1 className="text-3xl font-bold md:text-5xl">
              Start working less and earning more <br /> with WebinarKit.
            </h1>
            <p className="mx-auto mt-4 text-lg text-gray-400 md:w-3/4">
              Stop wasting your precious time doing everything yourself. Quickly
              and easily automate your business with WebinarKit today.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <FaFacebook
                className="cursor-pointer text-gray-400 hover:text-blue-500"
                size={24}
              />
              <FaTwitter
                className="cursor-pointer text-gray-400 hover:text-blue-400"
                size={24}
              />
              <FaLinkedin
                className="cursor-pointer text-gray-400 hover:text-blue-600"
                size={24}
              />
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
              <div>
                <h3 className="font-semibold text-gray-300">FEATURES</h3>
                <Button
                  variant="link"
                  className="p-0 text-gray-400 hover:text-blue-500"
                  asChild
                >
                  <Link href="/features">Features</Link>
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-300">PRICING</h3>
                <Button
                  variant="link"
                  className="p-0 text-gray-400 hover:text-blue-500"
                  asChild
                >
                  <Link href="/pricing">Pricing</Link>
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-300">RESOURCES</h3>
                <Button
                  variant="link"
                  className="p-0 text-gray-400 hover:text-blue-500"
                  asChild
                >
                  <Link href="/affiliate">Affiliate Program</Link>
                </Button>
                <Button
                  variant="link"
                  className="p-0 text-gray-400 hover:text-blue-500"
                  asChild
                >
                  <Link href="/marketplace">Marketplace</Link>
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-300">LEGAL</h3>
                <Button
                  variant="link"
                  className="p-0 text-gray-400 hover:text-blue-500"
                  asChild
                >
                  <Link href="/terms">Terms of Service</Link>
                </Button>
                <Button
                  variant="link"
                  className="p-0 text-gray-400 hover:text-blue-500"
                  asChild
                >
                  <Link href="/privacy">Privacy Policy</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-10 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} WebinarKit. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};
