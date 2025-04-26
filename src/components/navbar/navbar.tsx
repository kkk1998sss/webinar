'use client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DropdownMenuPortal } from '@radix-ui/react-dropdown-menu';
import { DashboardIcon, ExitIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { SignInButton } from '@/components/navbar/sign-in-button';
import { SolutionsDropdown } from '@/components/navbar/solutions-dropdown';
import { UseCasesDropdown } from '@/components/navbar/use-cases-dropdown';
import { UserDropdown } from '@/components/navbar/user-dropdown';
import { Link } from '@/lib/i18n';
import * as m from '@/paraglide/messages';

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '#features', label: m.features() },
    { href: '#demo', label: m.demo() },
    { href: '#pricing', label: m.pricing() },
    { href: '#testimonials', label: m.testimonials() },
  ];

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const sectionId = href.split('#')[1];
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 w-full border-b bg-white/90 shadow-md backdrop-blur-sm"
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <motion.div
            className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur"
            animate={{
              opacity: [0.2, 0.3, 0.2],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <Link
            href="/"
            className="relative flex items-center font-mono text-xl font-bold"
          >
            <motion.span
              className="bg-size-200 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              {m.app_name()}
            </motion.span>
            <motion.div
              className="ml-1 size-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </Link>
        </motion.div>

        <nav className="hidden items-center gap-6 md:flex">
          <SolutionsDropdown />
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Link
                href={item.href}
                onClick={handleNavClick(item.href)}
                className="group relative text-sm font-medium"
              >
                {item.label}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"
                  whileHover={{ width: '100%' }}
                />
              </Link>
            </motion.div>
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg"
                    >
                      <span className="font-medium text-white">
                        {session.user.name
                          ? session.user.name
                              .split(' ')
                              .map((n: string) => n.charAt(0).toUpperCase())
                              .join('')
                          : 'U'}
                      </span>
                    </motion.button>
                  </DropdownMenu.Trigger>

                  <DropdownMenuPortal>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="z-50"
                    >
                      <DropdownMenu.DropdownMenuContent
                        className="z-50 min-w-[220px] rounded-md border bg-white/95 p-2 shadow-lg backdrop-blur-sm"
                        sideOffset={5}
                        style={{ zIndex: 9999 }}
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
                          onClick={() => {
                            if (session?.user?.isAdmin === true) {
                              router.push('/admin/users');
                            } else {
                              router.push('/users/live-webinar');
                            }
                          }}
                          className="group flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-blue-50"
                        >
                          <DashboardIcon className="size-4 text-blue-500 group-hover:text-blue-600" />
                          Dashboard
                        </DropdownMenu.DropdownMenuItem>

                        <DropdownMenu.DropdownMenuItem
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="group flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-red-600 transition-colors duration-200 hover:bg-red-50"
                        >
                          <ExitIcon className="size-4 text-red-500 group-hover:text-red-600" />
                          Logout
                        </DropdownMenu.DropdownMenuItem>
                      </DropdownMenu.DropdownMenuContent>
                    </motion.div>
                  </DropdownMenuPortal>
                </DropdownMenu.Root>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SignInButton />
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};
