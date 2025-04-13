'use client';

import Link from 'next/link';

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mb-4 text-6xl text-red-500">🚫</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You don’t have permission to view this page. Please contact the
          administrator if you think this is a mistake.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="rounded bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700"
          >
            Go Home
          </Link>
          <Link
            href="/auth/login"
            className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition duration-200 hover:bg-gray-400"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
