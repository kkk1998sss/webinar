'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import * as m from '@/paraglide/messages';

export const SignInButton = () => {
  // OLD CODE - EASILY REVERTIBLE
  // export const SignInButton = ({ isFreeUser = false }: { isFreeUser?: boolean } = {}) => {
  const { status } = useSession();
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
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        variant="outline"
        onClick={() => router.push('/auth/login-free')}
        // OLD CODE - EASILY REVERTIBLE
        // onClick={() => router.push(isFreeUser ? '/auth/login-free' : '/auth/login')}
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
  );
};
