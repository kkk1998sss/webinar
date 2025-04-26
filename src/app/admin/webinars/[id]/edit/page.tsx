'use client';

import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaGlobe,
  FaLock,
  FaSave,
  FaUserFriends,
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type WebinarData = {
  id: string;
  webinarName: string;
  webinarTitle: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  webinarDate: string;
  attendeeSignIn: boolean;
  passwordProtected: boolean;
  webinarTime?: string;
  selectedLanguage?: string;
};

export default function EditWebinar() {
  const { id } = useParams();
  const router = useRouter();
  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/webinar/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setWebinar(data.webinar);
          } else {
            setError('Failed to load webinar data');
          }
        })
        .catch(() => {
          setError('An error occurred while loading webinar data');
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
      webinarName: formData.get('webinarName'),
      webinarTitle: formData.get('webinarTitle'),
      webinarDate: formData.get('webinarDate'),
      webinarTime: formData.get('webinarTime'),
      durationHours: parseInt(formData.get('durationHours') as string),
      durationMinutes: parseInt(formData.get('durationMinutes') as string),
      durationSeconds: parseInt(formData.get('durationSeconds') as string),
      attendeeSignIn: formData.get('attendeeSignIn') === 'on',
      passwordProtected: formData.get('passwordProtected') === 'on',
      selectedLanguage: formData.get('selectedLanguage'),
    };

    try {
      const res = await fetch(`/api/webinar/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/webinars');
        }, 1500);
      } else {
        setError('Failed to update webinar');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating webinar');
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
        <span className="ml-3 text-gray-600">Loading webinar data...</span>
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
          href="/admin/webinars"
          className="inline-flex items-center rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Webinars
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
          Edit Webinar
        </h1>
        <Link
          href="/admin/webinars"
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
                htmlFor="webinarName"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Webinar Name
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  id="webinarName"
                  name="webinarName"
                  defaultValue={webinar?.webinarName}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter webinar name"
                  required
                />
              </motion.div>
            </div>

            <div>
              <label
                htmlFor="webinarTitle"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Webinar Title
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  id="webinarTitle"
                  name="webinarTitle"
                  defaultValue={webinar?.webinarTitle}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter webinar title"
                  required
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="webinarDate"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  <FaCalendarAlt className="mr-1 inline" /> Date
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    id="webinarDate"
                    name="webinarDate"
                    type="date"
                    defaultValue={
                      webinar?.webinarDate
                        ? new Date(webinar.webinarDate)
                            .toISOString()
                            .split('T')[0]
                        : ''
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </motion.div>
              </div>

              <div>
                <label
                  htmlFor="webinarTime"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  <FaClock className="mr-1 inline" /> Time
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    id="webinarTime"
                    name="webinarTime"
                    type="time"
                    defaultValue={webinar?.webinarTime || ''}
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </motion.div>
              </div>
            </div>

            <div>
              <label
                htmlFor="duration"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    id="durationHours"
                    name="durationHours"
                    type="number"
                    min="0"
                    max="24"
                    defaultValue={webinar?.durationHours}
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Hours"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    min="0"
                    max="59"
                    defaultValue={webinar?.durationMinutes}
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Minutes"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    id="durationSeconds"
                    name="durationSeconds"
                    type="number"
                    min="0"
                    max="59"
                    defaultValue={webinar?.durationSeconds}
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Seconds"
                  />
                </motion.div>
              </div>
            </div>

            <div>
              <label
                htmlFor="selectedLanguage"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                <FaGlobe className="mr-1 inline" /> Language
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  id="selectedLanguage"
                  name="selectedLanguage"
                  defaultValue={webinar?.selectedLanguage || ''}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter language"
                />
              </motion.div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="attendeeSignIn"
                  name="attendeeSignIn"
                  type="checkbox"
                  defaultChecked={webinar?.attendeeSignIn}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="attendeeSignIn"
                  className="ml-2 block text-sm text-gray-700"
                >
                  <FaUserFriends className="mr-1 inline" /> Attendee Sign-In
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="passwordProtected"
                  name="passwordProtected"
                  type="checkbox"
                  defaultChecked={webinar?.passwordProtected}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="passwordProtected"
                  className="ml-2 block text-sm text-gray-700"
                >
                  <FaLock className="mr-1 inline" /> Password Protected
                </label>
              </div>
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
                Webinar updated successfully! Redirecting...
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
                  Update Webinar
                </>
              )}
            </span>
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
