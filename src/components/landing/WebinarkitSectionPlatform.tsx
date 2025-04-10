import Image from 'next/image';
import Link from 'next/link';

const WebinarkitSectionPlatform = () => {
  return (
    <section className="flex flex-col items-start justify-between gap-10 bg-white px-6 py-16 md:flex-row md:px-16">
      {/* Left Content */}
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

      {/* Right Image Card */}
      <div className="md:w-1/2">
        <h2 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
          The Only Platform Designed for <br className="hidden md:block" />
          Maximum Leads, Attendees & Conversions
        </h2>
        <p className="mb-6 text-lg text-gray-700">
          WebinarKit is the only platform fully equipped with everything you
          need to generate leads, maximize attendance, and close more sales
          effortlessly.
        </p>

        <ul className="list-none space-y-4 text-base text-gray-800">
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>AI-Optimized Email, SMS & Calendar Reminders</strong> → Keep
            your audience engaged before, during, and after your webinar with
            smartly timed, AI-personalized follow-ups.
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>Turn “Maybe” into “Yes” with One-Click Registration</strong>{' '}
            → AI removes friction by pre-filling registration details, allowing
            attendees to sign up instantly with one click.
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>AI-Powered CRM & Follow-Up Integration</strong> → Leads
            don’t stop at the webinar. AI segments your audience, personalizes
            follow-ups, and automates retargeting via Zapier, Pabbly, and your
            favorite CRM.
          </li>
          <li>
            <span className="font-bold text-indigo-600">✔</span>{' '}
            <strong>
              AI Chat That Sells for You - Never Miss a Chat Sale Again
            </strong>{' '}
            → AI answers questions, handles objections, and guides attendees to
            buy—hands-free.
          </li>
          <li>
            <span className="font-bold text-yellow-500">💡</span> A successful
            webinar isn’t just about getting people to register – it’s about
            making sure they show up, stay engaged, and convert into customers.
          </li>
        </ul>
      </div>
    </section>
  );
};

export default WebinarkitSectionPlatform;
