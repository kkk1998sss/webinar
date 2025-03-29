'use client';
import { signOut, useSession } from 'next-auth/react';
// import { LanguageSwitcher } from "./language-switcher";
import { SignInButton } from '@/components/navbar/sign-in-button';
import { SolutionsDropdown } from '@/components/navbar/solutions-dropdown';
import { UseCasesDropdown } from '@/components/navbar/use-cases-dropdown';
import { UserDropdown } from '@/components/navbar/user-dropdown';
import { Link } from '@/lib/i18n';
import * as m from '@/paraglide/messages';

export const Navbar = () => {
  const { data: session } = useSession(); // ✅ Use useSession() in client components

  const navItems = [
    { href: '/features', label: m.features() },
    { href: '/demo', label: m.demo() },
    { href: '/pricing', label: m.pricing() },
    { href: '/testimonials', label: m.testimonials() },
  ];

  return (
    <header className="w-full border-b bg-white shadow">
      <div className="container flex h-16 items-center justify-between">
        {/* App Name / Logo */}
        <Link href="/" className="font-mono text-lg font-bold">
          {m.app_name()}
        </Link>

        {/* Navigation Links */}
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

        {/* Right Section: Auth + Language Switcher + Logout */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              {session.user.image ? (
                <UserDropdown session={session} />
              ) : (
                <span className="font-medium text-gray-700">
                  {session.user.name || 'User'}
                </span>
              )}
              {/* <LanguageSwitcher /> */}
              {/* 🔴 Logout Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ml-2 rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
              >
                Logout
              </button>
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
