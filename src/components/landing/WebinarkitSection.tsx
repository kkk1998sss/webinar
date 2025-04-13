import Image from 'next/image';
import Link from 'next/link';

export default function WebinarKitSection() {
  return (
    <section className="flex flex-col items-center justify-between px-6 py-16 md:flex-row md:px-20">
      {/* Illustration */}
      <div className="mb-10 w-full md:mb-0 md:w-1/2">
        <Image
          src="/assets/webinar 1 (4).jpg"
          alt="WebinarKit Illustration"
          width={600}
          height={400}
          className="h-auto w-full"
        />
        <Link
          href="/masterclass"
          className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Register for the masterclass now!
        </Link>
      </div>

      {/* Text Content */}
      <div className="w-full text-left md:w-1/2">
        <h2 className="mb-6 text-3xl font-semibold text-gray-900 md:text-4xl">
          That’s why we created{' '}
          <span className="text-blue-600">WebinarKit</span>
        </h2>
        <p className="mb-6 text-lg text-gray-700">
          WebinarKit is the all-in-one automated webinar platform that lets you
          scale your business effortlessly while keeping the engagement and
          urgency of live events.
        </p>
        <p className="mb-6 text-lg text-gray-700">
          And now, with AI-powered engagement, your webinars don’t just run on
          autopilot—they sell on autopilot.
        </p>
        <ul className="mb-6 space-y-4 text-base text-gray-700">
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✔</span>
            Convert leads into customers automatically—while still having the
            flexibility to go live when you want.
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✔</span>
            Set up your best webinar once—and let it sell for you 24/7.
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✔</span>
            Use AI-assisted chat to engage attendees, handle objections, and
            drive action.
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✔</span>
            Run high-converting webinar funnels without limits or technical
            headaches.
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-purple-600">💡</span>
            Your time is valuable. Focus on growing your business while
            WebinarKit handles the rest.
          </li>
        </ul>
      </div>
    </section>
  );
}
