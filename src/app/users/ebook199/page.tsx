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
import { useSession } from 'next-auth/react';

// Add LoadingScreen component
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-y-2 border-blue-600"></div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Loading E-Books...
        </p>
      </div>
    </div>
  );
};

interface EBook199 {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  thumbnail?: string;
  downloads: number;
}

export default function EBook199Page() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [ebooks, setEbooks] = useState<EBook199[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    thumbnail: null as File | null,
  });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EBook199 | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState<EBook199 | null>(null);
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

      // If user is admin, redirect to admin ebooks page
      if (isAdmin) {
        window.location.href = '/users/ebooks';
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

        // If user has SIX_MONTH plan, redirect to ebooks page
        if (hasSixMonthPlan) {
          window.location.href = '/users/ebooks';
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
        const response = await fetch('/api/ebook199');
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

      console.log('Sending form data:', {
        title: formData.title,
        description: formData.description,
        fileType: formData.file.type,
        fileSize: formData.file.size,
        hasThumbnail: !!formData.thumbnail,
      });

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

      const response = await fetch('/api/ebook199', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        throw new Error(
          errorData.error || errorData.details || 'Failed to create ebook'
        );
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

  const handleDelete = (ebook: EBook199): void => {
    setEbookToDelete(ebook);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!ebookToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ebook199/${ebookToDelete.id}`, {
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

  const handleDownload = async (ebook: EBook199): Promise<void> => {
    try {
      const response = await fetch(`/api/ebook199/${ebook.id}/download`, {
        method: 'POST',
      });
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

  const handlePreview = (ebook: EBook199): void => {
    setSelectedEbook(ebook);
    setPreviewModalOpen(true);
  };

  if (status === 'loading' || !hasAccess || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </motion.button>
          <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
            E-Book 199 Collection
          </h1>
        </div>
        {isAdmin && (
          <motion.button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="size-4 sm:size-5" />
            <span>Add E-Book</span>
          </motion.button>
        )}
      </div>

      {/* E-Books Grid */}
      <AnimatePresence>
        {ebooks.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {ebooks.map((ebook, index) => (
              <motion.div
                key={ebook.id}
                className="group relative overflow-hidden rounded-lg bg-white p-2 shadow-md transition-all duration-300 hover:shadow-lg sm:p-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                layout
              >
                <motion.div
                  className="relative aspect-[3/4] overflow-hidden rounded-md bg-gray-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {ebook.fileUrl ? (
                    <iframe
                      src={`${ebook.fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                      className="size-full"
                      title={`${ebook.title} preview`}
                      style={{ border: 'none' }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <FileText className="size-5 text-gray-400 sm:size-6" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
                <div className="mt-2">
                  <motion.h3
                    className="line-clamp-2 text-xs font-medium text-gray-800 sm:text-sm"
                    whileHover={{ color: '#2563eb' }}
                  >
                    {ebook.title}
                  </motion.h3>
                  {ebook.description && (
                    <motion.p
                      className="mt-0.5 line-clamp-2 text-[10px] text-gray-600 sm:text-xs"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {ebook.description}
                    </motion.p>
                  )}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 sm:text-xs">
                    <span>{Math.round(ebook.fileSize / 1024 / 1024)} MB</span>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1"
                    >
                      <Download className="size-2.5 sm:size-3" />
                      {ebook.downloads}
                    </motion.span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 sm:gap-1.5">
                    <motion.button
                      onClick={() => handlePreview(ebook)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-50 px-1.5 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-100 sm:gap-1.5 sm:px-2 sm:py-1.5 sm:text-xs"
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: '#93c5fd',
                        color: '#1e40af',
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Eye className="size-3 sm:size-3.5" />
                      </motion.div>
                      <span>Preview</span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleDownload(ebook)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-50 px-1.5 py-1 text-[10px] font-medium text-green-600 hover:bg-green-100 sm:gap-1.5 sm:px-2 sm:py-1.5 sm:text-xs"
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: '#86efac',
                        color: '#166534',
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Download className="size-3 sm:size-3.5" />
                      </motion.div>
                      <span>Download</span>
                    </motion.button>
                    {isAdmin && (
                      <motion.button
                        onClick={() => handleDelete(ebook)}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-1 rounded-md bg-red-50 px-1.5 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100 sm:gap-1.5 sm:px-2 sm:py-1.5 sm:text-xs"
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: '#fca5a5',
                          color: '#991b1b',
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
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
                            <ClipLoader size={12} color="#dc2626" />
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ rotate: 20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Trash2 className="size-3 sm:size-3.5" />
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
            className="mt-8 flex flex-col items-center justify-center rounded-xl bg-white p-4 text-center shadow-lg sm:mt-12 sm:p-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mb-4 flex size-16 items-center justify-center rounded-full bg-blue-50 sm:mb-6 sm:size-24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 360 }}
            >
              <BookOpen className="size-8 text-blue-500 sm:size-12" />
            </motion.div>
            <motion.h3
              className="mb-2 text-lg font-semibold text-gray-800 sm:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              No E-Books Available
            </motion.h3>
            <motion.p
              className="max-w-md text-sm text-gray-600 sm:text-base"
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
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:mt-6 sm:w-auto sm:gap-2 sm:px-6 sm:py-3 sm:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#2563eb',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Upload className="size-4 sm:size-5" />
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

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
                      <iframe
                        src={`${selectedEbook.fileUrl}#view=FitH&toolbar=0`}
                        className="size-full"
                        title={selectedEbook.title}
                        style={{ border: 'none' }}
                      />
                    )}
                  </motion.div>
                  <div className="mt-3 flex justify-end space-x-2 sm:mt-4">
                    <motion.button
                      onClick={() => setPreviewModalOpen(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 sm:px-4 sm:py-2 sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                    <motion.button
                      onClick={() =>
                        selectedEbook && handleDownload(selectedEbook)
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                      whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="size-3.5 sm:size-4" />
                      Download
                    </motion.button>
                  </div>
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
                    <AlertDialog.Cancel>
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
                        whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
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
  );
}
