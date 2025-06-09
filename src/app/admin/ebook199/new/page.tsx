'use client';

import { useState } from 'react';
import { FaArrowLeft, FaBook, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewEBook199Page() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    thumbnail: null as File | null,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      formDataToSend.append('isActive', formData.isActive.toString());

      const response = await fetch('/api/ebook199', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        router.push('/admin/ebook199');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create ebook');
      }
    } catch {
      setError('An error occurred while creating the ebook');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      thumbnail: file,
    }));
  };

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
          href="/admin/ebook199"
          className="inline-flex items-center rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
        >
          <FaArrowLeft className="mr-2" /> Back to E-Books
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Add New E-Book 199
        </motion.h1>
        <Link
          href="/admin/ebook199"
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <FaArrowLeft /> Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            rows={4}
            required
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            E-Book File
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            accept=".pdf,.epub,.mobi"
            required
          />
          {formData.file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {formData.file.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="thumbnail"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Thumbnail
          </label>
          <input
            type="file"
            id="thumbnail"
            onChange={handleThumbnailChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            accept="image/*"
          />
          {formData.thumbnail && (
            <div className="mt-2">
              <Image
                src={URL.createObjectURL(formData.thumbnail)}
                alt="Thumbnail preview"
                width={80}
                height={80}
                className="size-20 rounded object-cover"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FaBook /> Create E-Book
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
