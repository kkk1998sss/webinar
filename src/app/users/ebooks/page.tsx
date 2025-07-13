'use client';

import * as React from 'react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Add LoadingScreen component
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 backdrop-blur-sm dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <div
            className="absolute inset-0 size-16 animate-spin rounded-full border-4 border-transparent border-t-purple-600"
            style={{ animationDelay: '-0.5s' }}
          ></div>
          <div
            className="absolute inset-0 size-16 animate-spin rounded-full border-4 border-transparent border-t-pink-600"
            style={{ animationDelay: '-1s' }}
          ></div>
        </div>
        <div className="text-center">
          <p className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-xl font-semibold text-transparent">
            Loading E-Books...
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Preparing your digital library
          </p>
        </div>
      </div>
    </div>
  );
};

interface EBook {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  thumbnail?: string;
  downloads: number;
}

export default function EBooksPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    thumbnail: null as File | null,
  });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EBook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState<EBook | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for session to be loaded
      if (status === 'loading') return;

      // If no session, redirect to login
      if (status === 'unauthenticated') {
        window.location.href = '/auth/login';
        return;
      }

      // If user is admin, grant immediate access
      if (isAdmin) {
        setHasAccess(true);
        return;
      }

      try {
        const res = await fetch('/api/subscription');
        const data = await res.json();

        // Check if user has SIX_MONTH plan
        const hasSixMonthPlan = data.subscriptions?.some(
          (sub: { type: string; isActive: boolean; endDate: string }) =>
            sub.type === 'SIX_MONTH' &&
            sub.isActive &&
            new Date(sub.endDate) > new Date()
        );

        if (!hasSixMonthPlan) {
          window.location.href = '/users/ebook199';
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Error checking subscription:', error);
        window.location.href = '/auth/login';
      }
    };

    checkAccess();
  }, [status, session, isAdmin]);

  useEffect(() => {
    if (!hasAccess) return;

    const fetchEbooks = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ebooks');
        if (!response.ok) throw new Error('Failed to fetch ebooks');
        const data = await response.json();
        if (data.ebooks) setEbooks(data.ebooks);
      } catch (error) {
        console.error('Error fetching ebooks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEbooks();
  }, [hasAccess]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const thumbnail = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      thumbnail,
    }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setShowError(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('file', formData.file);
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/ebooks', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to create ebook' }));
        throw new Error(errorData.message || 'Failed to create ebook');
      }

      const responseData = await response.json();
      if (!responseData.ebook) {
        throw new Error(responseData.message || 'Failed to create ebook');
      }

      setEbooks((prev) => [...prev, responseData.ebook]);

      clearInterval(uploadInterval);
      setUploadProgress(100);
      setShowSuccess(true);

      setFormData({
        title: '',
        description: '',
        file: null,
        thumbnail: null,
      });

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setShowSuccess(false);
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Error uploading ebook:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (ebook: EBook): void => {
    setEbookToDelete(ebook);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!ebookToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ebooks/${ebookToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete e-book');
      }

      setEbooks((prev) =>
        prev.filter((ebook) => ebook.id !== ebookToDelete.id)
      );
    } catch (error) {
      console.error('Error deleting e-book:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete e-book');
    } finally {
      setIsDeleting(false);
      setEbookToDelete(null);
    }
  };

  const handleDownload = async (ebook: EBook): Promise<void> => {
    try {
      const response = await fetch(`/api/ebooks/${ebook.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download e-book');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ebook.title}.${ebook.fileType.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setEbooks((prev) =>
        prev.map((e) =>
          e.id === ebook.id ? { ...e, downloads: e.downloads + 1 } : e
        )
      );
    } catch (error) {
      console.error('Error downloading e-book:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to download e-book'
      );
    }
  };

  const handlePreview = (ebook: EBook): void => {
    setSelectedEbook(ebook);
    setPreviewModalOpen(true);
  };

  if (status === 'loading' || !hasAccess || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 size-80 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"></div>
        <div
          className="absolute -bottom-40 -left-40 size-80 animate-pulse rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-pink-400/10 to-blue-400/10 blur-3xl"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="container relative mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Header Section */}
        <motion.div
          className="mb-8 rounded-2xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-800/70"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => (window.location.href = '/dashboard')}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
              </motion.button>
              <div>
                <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent sm:text-4xl">
                  Digital Library
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Explore our collection of premium e-books
                </p>
              </div>
            </div>
            {isAdmin && (
              <motion.button
                onClick={() => setIsUploadModalOpen(true)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="size-5 transition-transform group-hover:-translate-y-1" />
                <span>Add E-Book</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* E-Books Grid */}
        <AnimatePresence>
          {ebooks.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {ebooks.map((ebook, index) => (
                <motion.div
                  key={ebook.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-gray-700/30 dark:bg-gray-800/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.3 },
                  }}
                  layout
                >
                  <motion.div
                    className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {ebook.fileUrl ? (
                      <>
                        {/* Desktop PDF Preview */}
                        <div className="hidden h-[600px] sm:block">
                          <iframe
                            src={`${ebook.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="size-full rounded-xl border border-gray-200"
                            title={ebook.title}
                          />
                        </div>
                        {/* Mobile Preview */}
                        <div className="relative aspect-[3/4] w-full sm:hidden">
                          <Image
                            src="/assets/shreeSookthPDF.jpg"
                            layout="fill"
                            objectFit="contain"
                            className="transition-transform duration-700 hover:scale-105"
                            alt="Shree Suktam Sadhana"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <FileText className="size-8 text-gray-400 sm:size-10" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                  <div className="mt-4 flex flex-1 flex-col">
                    <motion.h3
                      className="line-clamp-2 text-sm font-semibold text-gray-800 sm:text-base dark:text-gray-200"
                      whileHover={{ color: '#3b82f6' }}
                    >
                      {ebook.title}
                    </motion.h3>
                    {ebook.description && (
                      <motion.p
                        className="mt-2 line-clamp-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                      >
                        {ebook.description}
                      </motion.p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                      <span className="font-medium">
                        {Math.round(ebook.fileSize / 1024 / 1024)} MB
                      </span>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-1 font-medium"
                      >
                        <Download className="size-3 sm:size-4" />
                        {ebook.downloads}
                      </motion.span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 pt-2">
                      <motion.button
                        onClick={() => handlePreview(ebook)}
                        className="group flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:gap-2 sm:px-3 sm:text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Eye className="size-3.5 transition-transform group-hover:scale-110 sm:size-4" />
                        </motion.div>
                        <span>Preview</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleDownload(ebook)}
                        className="group flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:gap-2 sm:px-3 sm:text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Download className="size-3.5 transition-transform group-hover:scale-110 sm:size-4" />
                        </motion.div>
                        <span>Download</span>
                      </motion.button>
                      {isAdmin && (
                        <motion.button
                          onClick={() => handleDelete(ebook)}
                          disabled={isDeleting}
                          className="group flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 p-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:gap-1.5 sm:px-2.5"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isDeleting && ebookToDelete?.id === ebook.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="flex items-center gap-1 sm:gap-2"
                            >
                              <ClipLoader size={12} color="#fff" />
                            </motion.div>
                          ) : (
                            <motion.div
                              whileHover={{ rotate: 20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Trash2 className="size-3.5 transition-transform group-hover:scale-110 sm:size-4" />
                            </motion.div>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-800/70"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:mb-8 sm:size-28"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 360 }}
              >
                <BookOpen className="size-10 text-white sm:size-14" />
              </motion.div>
              <motion.h3
                className="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent sm:text-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                No E-Books Available
              </motion.h3>
              <motion.p
                className="max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {isAdmin
                  ? 'Start by adding your first e-book using the "Add E-Book" button above.'
                  : "Check back later for new e-books. We're constantly adding new content!"}
              </motion.p>
              {isAdmin && (
                <motion.button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:mt-8 sm:w-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Upload className="size-5" />
                  </motion.div>
                  <span>Add Your First E-Book</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal - Only show if admin */}
        {isAdmin && (
          <Dialog.Root
            open={isUploadModalOpen}
            onOpenChange={setIsUploadModalOpen}
          >
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              <Dialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-3 shadow-2xl sm:w-[600px] sm:p-6">
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <Dialog.Title className="text-lg font-bold text-gray-800 sm:text-xl">
                    Upload E-Book
                  </Dialog.Title>
                  <Dialog.Close className="rounded-lg p-1 hover:bg-gray-100">
                    <X className="size-4 text-gray-500 sm:size-5" />
                  </Dialog.Close>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 sm:space-y-4"
                >
                  <div>
                    <label
                      htmlFor="ebook-title"
                      className="block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Title
                    </label>
                    <input
                      id="ebook-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ebook-description"
                      className="block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Description
                    </label>
                    <textarea
                      id="ebook-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ebook-file"
                      className="block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      E-Book File (PDF, EPUB)
                    </label>
                    <input
                      id="ebook-file"
                      type="file"
                      accept=".pdf,.epub"
                      onChange={handleFileChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ebook-thumbnail"
                      className="block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Thumbnail (Optional)
                    </label>
                    <input
                      id="ebook-thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                    />
                  </div>

                  {isUploading && (
                    <div className="mt-3 sm:mt-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 sm:h-2">
                        <motion.div
                          className="h-full bg-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-600 sm:mt-2 sm:text-sm">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  {showError && (
                    <motion.div
                      className="mt-3 rounded bg-red-100 px-3 py-1.5 text-xs text-red-700 sm:mt-4 sm:px-4 sm:py-2 sm:text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      Failed to create ebook. Please try again.
                    </motion.div>
                  )}

                  <div className="mt-4 flex justify-end sm:mt-6">
                    <motion.button
                      type="submit"
                      disabled={isUploading || !formData.file}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:bg-gray-400 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isUploading ? (
                        <>
                          <ClipLoader size={14} color="#fff" />
                          <span>Uploading...</span>
                        </>
                      ) : showSuccess ? (
                        <>
                          <CheckCircle2 className="size-4 sm:size-5" />
                          <span>Uploaded Successfully!</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-4 sm:size-5" />
                          <span>Upload E-Book</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {previewModalOpen && (
            <Dialog.Root
              open={previewModalOpen}
              onOpenChange={setPreviewModalOpen}
            >
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  />
                </Dialog.Overlay>
                <Dialog.Content className="fixed left-1/2 top-1/2 h-[80vh] w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-3 shadow-2xl sm:h-[60vh] sm:w-[80vw] sm:p-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-full flex-col"
                  >
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <Dialog.Title className="text-base font-bold text-gray-800 sm:text-xl">
                        {selectedEbook?.title}
                      </Dialog.Title>
                      <Dialog.Close>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          className="cursor-pointer rounded-lg p-1 hover:bg-gray-100"
                        >
                          <X className="size-4 text-gray-500 sm:size-5" />
                        </motion.div>
                      </Dialog.Close>
                    </div>
                    <motion.div
                      className="flex-1 overflow-hidden rounded-lg border border-gray-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {selectedEbook && (
                        <>
                          {/* Mobile Preview */}
                          <div className="relative aspect-[3/4] w-full sm:hidden">
                            <Image
                              src="/assets/shreeSookthPDF.jpg"
                              layout="fill"
                              objectFit="contain"
                              className="transition-transform duration-700 hover:scale-105"
                              alt="Shree Suktam Sadhana"
                            />
                          </div>
                          {/* Desktop PDF Preview */}
                          <div className="hidden h-[800px] sm:block">
                            <iframe
                              src={`${selectedEbook.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                              className="size-full rounded-lg border border-gray-200"
                              title={selectedEbook.title}
                            />
                          </div>
                          {/* Action Buttons */}
                          <div className="mt-4 flex justify-end gap-3">
                            <motion.button
                              onClick={() => setPreviewModalOpen(false)}
                              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <X className="size-4" />
                              Close
                            </motion.button>
                            <motion.button
                              onClick={() =>
                                selectedEbook && handleDownload(selectedEbook)
                              }
                              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Download className="size-4" />
                              Download PDF
                            </motion.button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {ebookToDelete && (
            <AlertDialog.Root
              open={!!ebookToDelete}
              onOpenChange={(open) => !open && setEbookToDelete(null)}
            >
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  />
                </AlertDialog.Overlay>
                <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-3 shadow-2xl sm:w-[400px] sm:p-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-full flex-col"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertDialog.Title className="text-lg font-bold text-gray-800 sm:text-xl">
                        Delete E-Book
                      </AlertDialog.Title>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex-1"
                    >
                      <AlertDialog.Description className="mt-2 text-xs text-gray-600 sm:text-sm">
                        {`Are you sure you want to delete "${ebookToDelete?.title}"? This action cannot be undone.`}
                      </AlertDialog.Description>
                    </motion.div>
                    <motion.div
                      className="mt-4 flex justify-end gap-2 sm:mt-6 sm:gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AlertDialog.Cancel asChild>
                        <motion.div
                          className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 sm:px-4 sm:py-2 sm:text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.div>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <motion.div
                          onClick={confirmDelete}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:bg-red-400 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: '#dc2626',
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isDeleting ? (
                            <motion.div
                              className="flex items-center gap-1.5 sm:gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <ClipLoader size={14} color="#fff" />
                              <span>Deleting...</span>
                            </motion.div>
                          ) : (
                            <>
                              <motion.div
                                whileHover={{ rotate: 20 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Trash2 className="size-3.5 sm:size-4" />
                              </motion.div>
                              <span>Delete</span>
                            </>
                          )}
                        </motion.div>
                      </AlertDialog.Action>
                    </motion.div>
                  </motion.div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
