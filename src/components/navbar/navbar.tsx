'use client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DropdownMenuPortal } from '@radix-ui/react-dropdown-menu';
import { DashboardIcon, ExitIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { SignInButton } from '@/components/navbar/sign-in-button';
import { SolutionsDropdown } from '@/components/navbar/solutions-dropdown';
import { UseCasesDropdown } from '@/components/navbar/use-cases-dropdown';
import { UserDropdown } from '@/components/navbar/user-dropdown';
import { Link } from '@/lib/i18n';
import * as m from '@/paraglide/messages';

// import { LanguageSwitcher } from "./language-switcher";

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const navItems = [
    { href: '/features', label: m.features() },
    { href: '/demo', label: m.demo() },
    { href: '/pricing', label: m.pricing() },
    { href: '/testimonials', label: m.testimonials() },
  ];

  return (
    <header className="w-full border-b bg-white shadow">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-lg font-bold">
          {m.app_name()}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <SolutionsDropdown />
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:underline"
            >
              {item.label}
            </Link>
          ))}
          <UseCasesDropdown />
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              {session.user.image ? (
                <UserDropdown session={session} />
              ) : (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800 hover:bg-blue-200">
                      <span className="font-medium text-blue-800">
                        {session.user.name
                          ? session.user.name
                              .split(' ')
                              .map((n: string) => n.charAt(0).toUpperCase())
                              .join('')
                          : 'U'}
                      </span>
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenuPortal>
                    <DropdownMenu.DropdownMenuContent
                      className="min-w-[220px] rounded-md border bg-white p-2 shadow-lg"
                      sideOffset={5}
                    >
                      {/* Profile Preview */}
                      <div className="mb-1 border-b px-2 py-1.5">
                        <p className="truncate text-sm font-semibold text-blue-800">
                          {session.user.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <DropdownMenu.DropdownMenuItem
                        // onClick={() => router.push('/admin/users')}
                        onClick={() => {
                          if (session?.user?.isAdmin === true) {
                            router.push('/admin/users');
                          } else {
                            router.push('/users/live-webinar');
                          }
                        }}
                        className="group flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <DashboardIcon className="size-4 text-gray-500 group-hover:text-gray-700" />
                        Dashboard
                      </DropdownMenu.DropdownMenuItem>

                      <DropdownMenu.DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="group flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-red-600 hover:bg-red-100"
                      >
                        <ExitIcon className="size-4 text-red-500 group-hover:text-red-600" />
                        Logout
                      </DropdownMenu.DropdownMenuItem>
                    </DropdownMenu.DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu.Root>
              )}
              {/* <LanguageSwitcher /> */}
              {/* <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ml-2 rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
              >
                Logout
              </button> */}
            </>
          ) : (
            <>
              <SignInButton />
              {/* <LanguageSwitcher /> */}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
