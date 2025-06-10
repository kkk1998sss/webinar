'use client';

// import { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
import { LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { env } from '@/env.mjs';
import * as m from '@/paraglide/messages';

export const UserDropdown = ({ session: { user } }: { session: Session }) => {
  const router = useRouter();

  // const [isPending, setIsPending] = useState(false);

  // const handleCreateCheckoutSession = async () => {
  //   setIsPending(true);

  //   const res = await fetch('/api/stripe/checkout-session');
  //   const checkoutSession = await res.json().then(({ session }) => session);
  //   const stripe = await loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  //   await stripe!.redirectToCheckout({
  //     sessionId: checkoutSession.id,
  //   });
  // };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          {user?.image ? (
            <Image
              className="overflow-hidden rounded-full"
              src={user.image}
              alt={user.name || 'User'}
              width={32}
              height={32}
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-gray-500 text-sm font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={5}
        className="z-50 min-w-[220px] rounded-md border bg-white/95 p-2 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95"
      >
        <DropdownMenuLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {m.my_account()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="flex flex-col items-center justify-center p-2">
          {user?.image && (
            <Image
              className="overflow-hidden rounded-full"
              src={user.image}
              alt={user.name || 'User'}
              width={100}
              height={100}
            />
          )}
          <h2 className="py-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            {user?.name}
          </h2>
          {/* <Button
            onClick={handleCreateCheckoutSession}
            disabled={user?.isActive || isPending}
            className="w-64"
          >
            {user?.isActive ? (
              m.you_are_a_pro()
            ) : (
              <>
                {isPending && (
                  <Icons.loader className="mr-2 size-4 animate-spin" />
                )}
                {m.upgrade_to_pro_cta()}
              </>
            )}
          </Button> */}
        </div>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={() => {
            if (user?.isAdmin === true) {
              router.push('/admin/users');
            } else {
              router.push('/users/live-webinar');
            }
          }}
          className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <LayoutDashboard className="mr-2 size-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/' })}
          className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Icons.logOut className="mr-2 size-4" />
          <span>{m.log_out()}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
