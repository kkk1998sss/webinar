'use client';

import { use, useEffect, useState } from 'react';
import { FaArrowLeft, FaBook, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditEBook199Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: '',
    thumbnail: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchEBook = async () => {
      if (id !== 'new') {
        try {
          const response = await fetch(`/api/ebook199/${id}`);
          const data = await response.json();
          setFormData({
            title: data.ebook.title || '',
            description: data.ebook.description || '',
            fileUrl: data.ebook.fileUrl || '',
            fileType: data.ebook.fileType || '',
            thumbnail: data.ebook.thumbnail || '',
            isActive: data.ebook.isActive,
          });
        } catch {
          setError('Failed to fetch ebook details');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchEBook();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/ebook199/${id}`, {
        method: id === 'new' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/ebook199');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save ebook');
      }
    } catch {
      setError('An error occurred while saving the ebook');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Here you would typically upload the file to your storage service
    // and get back the URL. For now, we'll just use a placeholder
    const fileUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      fileUrl,
      fileType: file.type,
    }));
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Here you would typically upload the thumbnail to your storage service
    // and get back the URL. For now, we'll just use a placeholder
    const thumbnailUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      thumbnail: thumbnailUrl,
    }));
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
        <span className="ml-3 text-gray-600">Loading ebook data...</span>
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
          href="/admin/ebook199"
          className="inline-flex items-center rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
        >
          <FaArrowLeft className="mr-2" /> Back to E-Books
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/admin/ebook199"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FaArrowLeft className="mr-2" /> Back to E-Books
        </Link>
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
          {id === 'new' ? 'Add New E-Book' : 'Edit E-Book'}
        </h1>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
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
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
            />
            {formData.fileUrl && (
              <p className="mt-2 text-sm text-gray-500">
                Current file: {formData.fileUrl}
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
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  width={80}
                  height={80}
                  className="size-20 rounded object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-400"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/ebook199"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FaBook /> Save E-Book
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
