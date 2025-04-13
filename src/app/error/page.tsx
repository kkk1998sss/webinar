'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const errorMessages: Record<string, { title: string; message: string }> = {
  '401': {
    title: '401 - Unauthorized',
    message: 'You are not authorized to access this page. Please login first.',
  },
  '403': {
    title: '403 - Forbidden',
    message: 'You do not have permission to access this page.',
  },
  '404': {
    title: '404 - Not Found',
    message: 'The page you are looking for does not exist.',
  },
  '500': {
    title: '500 - Server Error',
    message: 'Something went wrong. Please try again later.',
  },
  default: {
    title: 'Oops!',
    message: 'An unexpected error occurred.',
  },
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'default';
  const { title, message } = errorMessages[type] || errorMessages['default'];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 text-center text-gray-900">
      <h1 className="text-5xl font-bold">{title}</h1>
      <p className="mt-4 text-lg">{message}</p>
      <Link
        href="/"
        className="mt-6 font-semibold text-blue-600 underline transition hover:text-blue-800"
      >
        Go to Home
      </Link>
    </div>
  );
}
