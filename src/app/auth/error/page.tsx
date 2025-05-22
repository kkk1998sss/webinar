'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // Redirect to login page after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/auth/login');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <motion.div
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <AlertCircle className="size-8 text-red-600" />
          </motion.div>

          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Authentication Error
          </h1>

          <p className="mb-6 text-gray-600">
            {error === 'Configuration'
              ? 'There is a problem with the server configuration.'
              : error === 'AccessDenied'
                ? 'You do not have permission to sign in.'
                : error === 'Verification'
                  ? 'The verification token has expired or has already been used.'
                  : 'An error occurred during authentication.'}
          </p>

          <motion.button
            onClick={() => router.push('/auth/login')}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Return to Login
          </motion.button>

          <p className="mt-4 text-sm text-gray-500">
            Redirecting to login page in 5 seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
