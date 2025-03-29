import { redirect } from 'next/navigation';

import WebinarView from './webinar-view';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';

export default async function LiveWebinarPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return <WebinarView session={session} />;
}
