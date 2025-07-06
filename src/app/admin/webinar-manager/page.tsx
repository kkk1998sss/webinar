'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

import WebinarView from '@/app/users/live-webinar/webinar-view';

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH' | 'PAID_WEBINAR';
  startDate: string;
  endDate: string;
  isActive: boolean;
  isValid: boolean;
}

export default function LiveWebinarPage() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();

        if (data.subscriptions?.length > 0) {
          const userSub = data.subscriptions.find(
            (sub: Subscription) =>
              sub.type === 'FOUR_DAY' ||
              sub.type === 'SIX_MONTH' ||
              sub.type === 'PAID_WEBINAR'
          );
          setSubscription(userSub);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  // Check if user is admin
  if (session?.user?.isAdmin) {
    return <WebinarView session={session} />;
  }

  // For non-admin users, check subscription
  if (!subscription) {
    redirect('/');
  }

  // For FOUR_DAY subscribers, redirect to four-day-plan
  if (subscription.type === 'FOUR_DAY') {
    redirect('/dashboard');
  }

  // For SIX_MONTH subscribers, show the webinar view
  if (subscription.type === 'SIX_MONTH' && session) {
    return <WebinarView session={session} />;
  }

  // If no valid subscription type is found, redirect to home
  redirect('/');
}
