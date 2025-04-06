'use client';

import { useSession } from 'next-auth/react';

import { Footer } from '@/components/footer';
import Pricing from '@/components/landing/Pricing';
import Sells from '@/components/landing/Sells';
import WebinarPage1 from '@/components/landing/WebinarPage1';

const Home = () => {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || '';

  return (
    <div className="flex min-h-screen flex-col">
      <main className="w-full flex-1">
        <div className="container mx-auto flex flex-col items-center py-12 text-center">
          <h1 className="text-3xl font-bold">
            {status === 'loading'
              ? 'Loading...'
              : userName
                ? `Welcome ${userName}!`
                : 'Welcome to the Webinar'}
          </h1>
          <div className="w-full max-w-6xl">
            <WebinarPage1 />
            <Sells />
            <Pricing />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
