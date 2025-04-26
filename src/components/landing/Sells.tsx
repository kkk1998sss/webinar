// components/WebinarFeatures.tsx
'use client';

import { FaDollarSign, FaLayerGroup, FaToggleOn } from 'react-icons/fa';

export default function WebinarFeatures() {
  return (
    <section id="features" className="w-full bg-white px-4 py-16 md:px-20">
      <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3 md:text-left">
        {/* Block 1 */}
        <div>
          <div className="mb-4 flex justify-center md:justify-start">
            <FaLayerGroup className="size-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold">
            Unlimited Funnels, Unlimited Sales – Scale Without Limits
          </h3>
          <p className="mt-2 text-gray-600">
            Create as many high-converting webinar funnels as you need with zero
            restrictions on attendees, registrants, or events. More funnels =
            more sales, more leads, more revenue – on autopilot.
          </p>
        </div>

        {/* Block 2 */}
        <div>
          <div className="mb-4 flex justify-center md:justify-start">
            <FaToggleOn className="size-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold">
            Sell on Autopilot 24/7 – Turn Visitors Into Paying Customers Faster
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600">
            <li>
              <strong>Sell</strong> courses, software, coaching, and products
              while you focus on growth.
            </li>
            <li>
              <strong>Convert</strong> leads automatically with high-converting,
              pre-recorded webinars.
            </li>
            <li>
              <strong>No</strong> live hosting required – just set it up once
              and watch sales roll in.
            </li>
          </ul>
        </div>

        {/* Block 3 */}
        <div>
          <div className="mb-4 flex justify-center md:justify-start">
            <FaDollarSign className="size-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold">
            AI and automation sell for you
          </h3>
          <p className="mt-2 text-gray-600">
            Leverage our built-in AI and automation to handle Q&amp;A,
            objections, and sell for you 24/7… while you focus on whatever you
            want.
          </p>
        </div>
      </div>
    </section>
  );
}
