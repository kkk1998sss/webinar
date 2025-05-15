'use client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DropdownMenuPortal } from '@radix-ui/react-dropdown-menu';
import { DashboardIcon, ExitIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
      className="bg-background/90 sticky top-0 z-40 w-full border-b shadow-md backdrop-blur-sm"
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/" className="relative flex items-center">
            <Image
              src="/assets/shree-maaha.png"
              alt="Shree Maaha"
              width={150}
              height={50}
              className="object-contain"
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
                className="group relative text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-50"
              >
                {item.label}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-300 group-hover:w-full dark:from-red-500 dark:to-yellow-400"
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
                      className="text-primary-foreground flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-medium shadow-md transition-all duration-300 hover:shadow-lg"
                    >
                      <span className="text-primary-foreground font-medium">
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
                        className="bg-popover/95 dark:border-border z-50 min-w-[220px] rounded-md border p-2 shadow-lg backdrop-blur-sm"
                        sideOffset={5}
                        style={{ zIndex: 9999 }}
                      >
                        {/* Profile Preview */}
                        <div className="dark:border-border/50 mb-1 border-b px-2 py-1.5">
                          <p className="text-primary dark:text-primary-dark truncate text-sm font-semibold">
                            {session.user.name}
                          </p>
                          <p className="text-muted-foreground dark:text-muted-foreground-dark truncate text-xs">
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
                          className="text-foreground hover:bg-secondary dark:hover:bg-secondary-dark hover:text-secondary-foreground dark:hover:text-secondary-foreground-dark group flex cursor-pointer items-center gap-2 rounded p-2 text-sm transition-colors duration-200"
                        >
                          <DashboardIcon className="text-primary dark:text-primary-dark group-hover:text-primary-hover dark:group-hover:text-primary-dark-hover size-4" />
                          Dashboard
                        </DropdownMenu.DropdownMenuItem>

                        <DropdownMenu.DropdownMenuItem
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="text-destructive dark:text-destructive-dark hover:bg-destructive/10 dark:hover:bg-destructive-dark/20 hover:text-destructive-hover dark:hover:text-destructive-dark-hover group flex cursor-pointer items-center gap-2 rounded p-2 text-sm transition-colors duration-200"
                        >
                          <ExitIcon className="text-destructive dark:text-destructive-dark group-hover:text-destructive-hover dark:group-hover:text-destructive-dark-hover size-4" />
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
