import React from 'react';
import { FaStar } from 'react-icons/fa';
import Image from 'next/image';

export default function WebinarPage1() {
  return (
    <>
      <div className="bg-white text-gray-900">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 py-12 lg:flex-row lg:px-8">
          <div className="space-y-5 lg:w-1/2">
            <h1 className="text-3xl font-bold lg:text-5xl">
              The modern, AI-powered <br />
              <span className="text-blue-600">Automated Webinar Platform.</span>
            </h1>
            <p className="text-lg text-gray-600">
              Set up automated webinars that run 24/7 while AI handles Q&A,
              objections, and maximizes sales... On the same platform trusted by
              over 18,000+ businesses.
            </p>
            <button className="rounded-md bg-blue-600 px-6 py-3 text-lg text-white transition duration-300 hover:bg-blue-700">
              Get Instant Access →
            </button>
          </div>

          <div className="mt-8 flex justify-center lg:mt-0 lg:w-1/2">
            <div className="relative h-[220px] w-[380px] sm:h-[240px] sm:w-[420px] md:h-[260px] md:w-[450px]">
              <Image
                src="/webinar-thumbnail.png"
                layout="fill"
                objectFit="cover"
                className="rounded-md"
                alt="Webinar Thumbnail"
              />
              <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 p-3 shadow-md">
                ▶
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gray-100 py-10">
          <div className="container mx-auto flex flex-wrap items-center justify-between px-4 lg:px-8">
            <div className="flex items-center text-lg font-medium text-gray-700">
              ✅ Trusted by over{' '}
              <span className="ml-1 text-blue-600">18,000+ businesses</span>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-lg lg:mt-0">
              <span className="flex text-yellow-500">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </span>
              <span className="font-semibold text-blue-600">
                4.8/5 stars on G2
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
