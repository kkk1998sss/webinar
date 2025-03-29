'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [message, setMessage] = useState('Verifying...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link.');
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/verify?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setMessage('✅ Email verified successfully! Redirecting to login...');
          setTimeout(() => router.push('/auth/login'), 3000);
        } else {
          setMessage(data.error || 'Verification failed.');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMessage(error.message || 'Verification failed.');
        } else {
          setMessage('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg md:p-10 lg:p-12">
        <h2 className="text-3xl font-bold text-gray-800">Email Verification</h2>
        <p className="mt-4 text-lg text-gray-600">{message}</p>
        {isLoading && (
          <p className="mt-2 animate-pulse text-gray-500">Please wait...</p>
        )}
      </div>
    </div>
  );
}
