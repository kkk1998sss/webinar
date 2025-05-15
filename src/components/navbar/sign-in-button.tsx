'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline"
          disabled
          className="border-secondary dark:border-secondary-dark from-secondary/50 to-accent/30 hover:border-secondary/70 dark:from-secondary-dark/50 dark:to-accent-dark/30 dark:hover:border-secondary-dark/70 bg-gradient-to-r transition-all duration-300"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mr-2"
          >
            <Icons.loader className="text-primary dark:text-primary-dark size-4" />
          </motion.div>
          <span className="text-primary dark:text-primary-foreground/80">
            {m.loading()}
          </span>
        </Button>
      </motion.div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {session?.user ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              className="border-secondary dark:border-secondary-dark from-secondary/50 to-accent/30 hover:border-secondary/70 dark:from-secondary-dark/50 dark:to-accent-dark/30 dark:hover:border-secondary-dark/70 group bg-gradient-to-r transition-all duration-300"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <motion.div
                  className="from-primary to-accent mr-2 rounded-full bg-gradient-to-r p-1"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icons.user className="text-primary-foreground size-4" />
                </motion.div>
                <span className="text-primary dark:text-primary-foreground/90 font-medium">
                  {session.user.name || 'User'}
                </span>
                <motion.div
                  className="ml-2"
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icons.moon className="text-accent dark:text-accent-dark size-4" />
                </motion.div>
              </motion.div>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              onClick={() => signIn()}
              className="border-secondary dark:border-secondary-dark from-secondary/50 to-accent/30 hover:border-secondary/70 dark:from-secondary-dark/50 dark:to-accent-dark/30 dark:hover:border-secondary-dark/70 group bg-gradient-to-r transition-all duration-300"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <motion.div
                  className="from-primary to-accent mr-2 rounded-full bg-gradient-to-r p-1"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icons.user className="text-primary-foreground size-4" />
                </motion.div>
                <span className="text-primary dark:text-primary-foreground/90 font-medium">
                  {m.sign_in()}
                </span>
                <motion.div
                  className="ml-2"
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icons.moon className="text-accent dark:text-accent-dark size-4" />
                </motion.div>
              </motion.div>
            </Button>
          </motion.div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border bg-popover/80 dark:border-border-dark overflow-hidden rounded-xl shadow-lg backdrop-blur-md"
      >
        <AnimatePresence>
          {session?.user ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hover:bg-secondary dark:hover:bg-secondary-dark flex cursor-pointer items-center px-4 py-3 transition-colors duration-200"
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="bg-destructive/20 dark:bg-destructive-dark/30 mr-2 rounded-full p-1"
                >
                  <Icons.logOut className="text-destructive dark:text-destructive-dark size-4" />
                </motion.div>
                <span className="text-foreground dark:text-foreground-dark font-medium">
                  {m.sign_out()}
                </span>
              </DropdownMenuItem>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <DropdownMenuItem
                  onClick={() => signIn('github')}
                  className="hover:bg-secondary dark:hover:bg-secondary-dark flex cursor-pointer items-center px-4 py-3 transition-colors duration-200"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="bg-muted dark:bg-muted-dark mr-2 rounded-full p-1"
                  >
                    <Icons.github className="text-muted-foreground dark:text-muted-foreground-dark size-4" />
                  </motion.div>
                  <span className="text-foreground dark:text-foreground-dark font-medium">
                    {m.sign_in()} (GitHub)
                  </span>
                </DropdownMenuItem>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <DropdownMenuItem
                  onClick={() => signIn('google')}
                  className="hover:bg-secondary dark:hover:bg-secondary-dark flex cursor-pointer items-center px-4 py-3 transition-colors duration-200"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mr-2 rounded-full bg-red-600/20 p-1 dark:bg-red-500/30"
                  >
                    <Icons.google className="size-4 text-red-600 dark:text-red-500" />
                  </motion.div>
                  <span className="text-foreground dark:text-foreground-dark font-medium">
                    {m.sign_in()} (Google)
                  </span>
                </DropdownMenuItem>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <DropdownMenuItem
                  onClick={() => signIn('twitter')}
                  className="hover:bg-secondary dark:hover:bg-secondary-dark flex cursor-pointer items-center px-4 py-3 transition-colors duration-200"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mr-2 rounded-full bg-yellow-400/30 p-1 dark:bg-yellow-500/40"
                  >
                    <Icons.twitter className="size-4 text-yellow-600 dark:text-yellow-300" />
                  </motion.div>
                  <span className="text-foreground dark:text-foreground-dark font-medium">
                    {m.sign_in()} (Twitter)
                  </span>
                </DropdownMenuItem>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.4 }}
              >
                <DropdownMenuItem
                  onClick={() => router.push('/auth/login')}
                  className="hover:bg-secondary dark:hover:bg-secondary-dark flex cursor-pointer items-center px-4 py-3 transition-colors duration-200"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="bg-primary/20 dark:bg-primary-dark/30 mr-2 rounded-full p-1"
                  >
                    <Icons.user className="text-primary dark:text-primary-dark size-4" />
                  </motion.div>
                  <span className="text-foreground dark:text-foreground-dark font-medium">
                    {m.sign_up()} (Email)
                  </span>
                </DropdownMenuItem>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
