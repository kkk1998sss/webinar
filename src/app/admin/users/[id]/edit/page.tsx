'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type UserData = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
};

export default function EditUser() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/register/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          } else {
            setError('Failed to load user data');
          }
        })
        .catch(() => {
          setError('An error occurred while loading user data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      phoneNumber: formData.get('phoneNumber'),
    };

    try {
      const res = await fetch(`/api/register/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="flex h-64 items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="size-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading user data...</span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 text-red-500">
          <svg
            className="mx-auto size-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-red-700">Error</h2>
        <p className="mb-4 text-red-600">{error}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Users
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
          Edit User
        </h1>
        <Link
          href="/admin/users"
          className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          <FaArrowLeft className="mr-2" /> Back
        </Link>
      </div>

      <motion.div
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  id="name"
                  name="name"
                  defaultValue={user?.name}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter user name"
                  required
                />
              </motion.div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter email address"
                  required
                />
              </motion.div>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  defaultValue={user?.phoneNumber || ''}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter phone number"
                />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="rounded-lg bg-red-50 p-4 text-red-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                className="rounded-lg bg-green-50 p-4 text-green-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                User updated successfully! Redirecting...
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
          >
            <span className="flex items-center justify-center">
              {saving ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Update User
                </>
              )}
            </span>
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
