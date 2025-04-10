'use client';

import { useSession } from 'next-auth/react';

import { Footer } from '@/components/footer';
import BusinessTypes from '@/components/landing/BusinessTypes';
import FAQ from '@/components/landing/FAQ';
import Pricing from '@/components/landing/Pricing';
import Sells from '@/components/landing/Sells';
import WebinarKitSection from '@/components/landing/WebinarkitSection';
import WebinarkitSectionBuild from '@/components/landing/WebinarkitSectionBuild';
import WebinarkitSectionPlatform from '@/components/landing/WebinarkitSectionPlatform';
import WebinarkitSectionScale from '@/components/landing/WebinarkitSectionScale';
import WebinarPage1 from '@/components/landing/WebinarPage1';

const Home = () => {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || '';

  return (
    <div className="flex min-h-screen flex-col">
      <main className="w-full flex-1">
        <div className=" mx-auto flex flex-col items-center py-12 text-center ">
          <h1 className="text-3xl font-bold">
            {status === 'loading'
              ? 'Loading...'
              : userName
                ? `Welcome ${userName}!`
                : 'Welcome to the Webinar'}
          </h1>
          <div className="max-w-8xl w-full">
            <WebinarPage1 />
            <Sells />
            <Pricing />
            <WebinarKitSection />
            <WebinarkitSectionBuild />
            <WebinarkitSectionPlatform />
            <WebinarkitSectionScale />
            <BusinessTypes />
            <FAQ />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
