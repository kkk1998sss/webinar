'use client';

import Image from 'next/image';
import Link from 'next/link';

const WebinarkitSectionScale = () => {
  return (
    <section className="flex flex-col items-start justify-between gap-10 bg-white px-6 py-16 md:flex-row md:px-16">
      {/* Left Content */}
      <div className="text-left md:w-1/2">
        <h2 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
          Scale Without Limits — Unlimited Webinars, Registrants & Attendees
        </h2>
        <p className="mb-6 text-lg text-gray-700">
          Most webinar platforms limit your growth—WebinarKit scales with you.
          Create unlimited high-converting webinar funnels and welcome unlimited
          attendees without hidden fees or restrictions.
        </p>

        <ul className="list-none space-y-4 text-base text-gray-800">
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>Run Unlimited Webinars & Funnels</strong> → No caps on
            registrations, attendees, or events—your growth is truly limitless.
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>Never Worry About Audience Size</strong> → Whether you have
            100 attendees or 100,000, your webinars run seamlessly.
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>No Overpriced “Per-Attendee” Fees</strong> → Unlike other
            platforms that charge you more as you grow, WebinarKit gives you
            full freedom at one simple price.
          </li>
          <li>
            <span className="font-bold text-yellow-500">💡</span> More webinars
            = more leads = more revenue. Scale on your terms—without limits.
          </li>
        </ul>
      </div>

      {/* Right Image Card */}
      <div className="flex flex-col items-center md:w-1/2">
        <div className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 p-2 shadow-lg">
          <div className="overflow-hidden rounded-lg bg-white">
            <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">
              WebinarKit
            </div>
            <Image
              src="/assets/webinar 1 (3).jpg" // Ensure this image is placed inside your public/ folder
              alt="Webinar Preview"
              width={800}
              height={450}
              className="h-auto w-full"
            />
          </div>
        </div>

        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Explore all plans →
        </Link>
      </div>
    </section>
  );
};

export default WebinarkitSectionScale;
