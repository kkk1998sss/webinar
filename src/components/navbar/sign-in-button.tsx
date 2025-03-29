'use client';

import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as m from '@/paraglide/messages';

export const SignInButton = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <Button variant="outline" disabled>
        <Icons.loader className="mr-2 size-4 animate-spin" /> {m.loading()}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {session?.user ? (
          <Button variant="outline">{session.user.name || 'User'}</Button>
        ) : (
          <Button variant="outline" onClick={() => signIn()}>
            {m.sign_in()}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {session?.user ? (
          <DropdownMenuItem onClick={() => signOut()}>
            <Icons.logOut className="mr-2 size-4" /> {m.sign_out()}
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => signIn('github')}>
              <Icons.github className="mr-2 size-4" /> {m.sign_in()} (GitHub)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signIn('google')}>
              <Icons.google className="mr-2 size-4" /> {m.sign_in()} (Google)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signIn('twitter')}>
              <Icons.twitter className="mr-2 size-4" /> {m.sign_in()} (Twitter)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/auth/login')}>
              <Icons.user className="mr-2 size-4" /> {m.sign_up()} (Email)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
