// import { redirect } from 'next/navigation';

// import WebinarView from './webinar-view';

// import { auth } from '@/app/api/auth/[...nextauth]/auth-options';

// export default async function LiveWebinarPage() {
//   const session = await auth();

//   if (!session) {
//     redirect('/auth/login');
//   }

//   return <WebinarView session={session} />;
// }

import { redirect } from 'next/navigation';

import WebinarView from './webinar-view';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import FourDayPlan from '@/components/FourDayPlan/FourDayPlan';
import prisma from '@/lib/prisma';

export default async function LiveWebinarPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // If user is admin, give them unrestricted access
  if (session.user.isAdmin) {
    return <WebinarView session={session} />;
  }

  // For non-admin users, check subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      endDate: { gt: new Date() },
    },
  });

  // If no active subscription for regular users
  if (!subscription) {
    return <WebinarView session={session} />;
  }

  // FOUR_DAY plan holders get redirected to video content
  if (subscription.type === 'FOUR_DAY') {
    return <FourDayPlan />;
  }

  // SIX_MONTH plan holders can access webinars
  if (subscription.type === 'SIX_MONTH') {
    return <WebinarView session={session} />;
  }

  // If subscription type is unknown, show webinar view
  return <WebinarView session={session} />;
}
