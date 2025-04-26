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
          className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300 hover:border-blue-300"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mr-2"
          >
            <Icons.loader className="size-4 text-blue-500" />
          </motion.div>
          <span className="text-blue-600">{m.loading()}</span>
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
              className="group border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300 hover:border-blue-300"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <motion.div
                  className="mr-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icons.user className="size-4 text-white" />
                </motion.div>
                <span className="font-medium text-blue-600">
                  {session.user.name || 'User'}
                </span>
                <motion.div
                  className="ml-2"
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icons.moon className="size-4 text-blue-500" />
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
              className="group border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300 hover:border-blue-300"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <motion.div
                  className="mr-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icons.user className="size-4 text-white" />
                </motion.div>
                <span className="font-medium text-blue-600">{m.sign_in()}</span>
                <motion.div
                  className="ml-2"
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icons.moon className="size-4 text-blue-500" />
                </motion.div>
              </motion.div>
            </Button>
          </motion.div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="overflow-hidden rounded-xl border border-blue-100 bg-white/80 shadow-lg backdrop-blur-md"
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
                className="flex cursor-pointer items-center px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="mr-2 rounded-full bg-red-100 p-1"
                >
                  <Icons.logOut className="size-4 text-red-500" />
                </motion.div>
                <span className="font-medium text-gray-700">
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
                  className="flex cursor-pointer items-center px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mr-2 rounded-full bg-gray-100 p-1"
                  >
                    <Icons.github className="size-4 text-gray-700" />
                  </motion.div>
                  <span className="font-medium text-gray-700">
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
                  className="flex cursor-pointer items-center px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mr-2 rounded-full bg-red-100 p-1"
                  >
                    <Icons.google className="size-4 text-red-500" />
                  </motion.div>
                  <span className="font-medium text-gray-700">
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
                  className="flex cursor-pointer items-center px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mr-2 rounded-full bg-blue-100 p-1"
                  >
                    <Icons.twitter className="size-4 text-blue-500" />
                  </motion.div>
                  <span className="font-medium text-gray-700">
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
                  className="flex cursor-pointer items-center px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mr-2 rounded-full bg-green-100 p-1"
                  >
                    <Icons.user className="size-4 text-green-500" />
                  </motion.div>
                  <span className="font-medium text-gray-700">
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
