'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

import WebinarView from './webinar-view';

import Dashboard from '@/components/Dashboard';
import WelcomePage from '@/components/WelcomePage';

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function LiveWebinarPage() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSubscription = async () => {
      console.log('Fetching subscription');
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();

        if (data.subscriptions?.length > 0) {
          const activeSub = data.subscriptions.find(
            (sub: Subscription) => sub.isActive
          );
          setSubscription(activeSub);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && !session?.user?.isAdmin) {
      console.log('User is not admin');
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [status, session?.user?.isAdmin]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  // Check if user is admin and active - no subscription required
  if (session?.user?.isAdmin && session?.user?.isActive) {
    console.log('Admin user is active');
    return <WebinarView session={session} />;
  }

  // For non-admin users, check subscription
  if (!subscription) {
    redirect('/#pricing');
  }

  // For new FOUR_DAY subscribers, show welcome page
  if (
    subscription.type === 'FOUR_DAY' &&
    new Date(subscription.startDate).getTime() >
      Date.now() - 24 * 60 * 60 * 1000
  ) {
    return <WelcomePage />;
  }

  // For all other cases, show the dashboard
  return <Dashboard />;
}
