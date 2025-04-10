import Image from 'next/image';
import Link from 'next/link';

const WebinarkitSectionBuild = () => {
  return (
    <section className="flex flex-col items-start justify-between gap-10 bg-white px-6 py-16 md:flex-row md:px-16">
      {/* Left Section - Text */}
      <div className="md:w-1/2">
        <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
          Build Automated Webinars <br /> & Virtual Events That Sell <br /> for
          You 24/7
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          <strong>Turn</strong> your best pitch into a 24/7 sales machine -
          without running live events or dealing with outdated tech (with
          presentations that actually auto-play)
        </p>
        <ul className="list-none space-y-4 text-base text-gray-800">
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>Run Like-Live Events on Your Schedule</strong> → Set up
            evergreen webinars...
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>Just-in-Time Webinars for Maximum Conversions</strong> →
            Instantly deliver 5, 10...
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>Instant-Watch Video Funnels (VSLs)</strong> → Let attendees
            skip the wait...
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>Multi-Day Virtual Events & Challenges</strong> → Easily set
            up 5-day challenges...
          </li>
          <li>
            <span className="font-bold text-yellow-500">💡</span>{' '}
            <strong>The Easiest Way</strong> to Automate Your Sales → No live
            events, no tech headaches...
          </li>
        </ul>
      </div>

      {/* Right Section - Image */}
      <div className="flex flex-col items-center md:w-1/2">
        <div className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 p-2 shadow-lg">
          <div className="overflow-hidden rounded-lg bg-white">
            <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">
              WebinarKit
            </div>
            <Image
              src="/image.png"
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

export default WebinarkitSectionBuild;
