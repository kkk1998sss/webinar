'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FreePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to free login page
    router.push('/auth/login-free');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-b-2 border-green-600"></div>
        <p className="text-lg font-medium text-gray-700">
          Redirecting to available access...
        </p>
      </div>
    </div>
  );
}
