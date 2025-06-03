'use client';

import * as React from 'react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [ebooks, setEbooks] = useState<EBook[]>([]);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEbooks = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch('/api/ebooks');
        if (!response.ok) throw new Error('Failed to fetch ebooks');
        const data = await response.json();
        if (data.ebooks) setEbooks(data.ebooks);
      } catch (error) {
        console.error('Error fetching ebooks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEbooks();
  }, []);

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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="ml-4 text-lg text-gray-700">Loading e-books...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">E-Books</h1>
        {isAdmin && (
          <motion.button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="size-5" />
            <span>Add E-Book</span>
          </motion.button>
        )}
      </div>

      {/* E-Books Grid */}
      {ebooks.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ebooks.map((ebook) => (
            <motion.div
              key={ebook.id}
              className="group relative overflow-hidden rounded-lg bg-white p-2 shadow-md transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -3 }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-gray-100">
                {ebook.fileUrl ? (
                  <iframe
                    src={`${ebook.fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                    className="size-full"
                    title={`${ebook.title} preview`}
                    style={{ border: 'none' }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-50">
                    <FileText className="size-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h3 className="line-clamp-2 text-sm font-medium text-gray-800">
                  {ebook.title}
                </h3>
                {ebook.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                    {ebook.description}
                  </p>
                )}
                <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
                  <span>{Math.round(ebook.fileSize / 1024 / 1024)} MB</span>
                  <span>{ebook.downloads} downloads</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <motion.button
                    onClick={() => handlePreview(ebook)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="size-3.5" />
                    <span>Preview</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleDownload(ebook)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-green-50 px-2 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </motion.button>
                  {isAdmin && (
                    <motion.button
                      onClick={() => handleDelete(ebook)}
                      disabled={isDeleting}
                      className="flex items-center justify-center gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isDeleting && ebookToDelete?.id === ebook.id ? (
                        <ClipLoader size={14} color="#dc2626" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className="mt-12 flex flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-6 flex size-24 items-center justify-center rounded-full bg-blue-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <BookOpen className="size-12 text-blue-500" />
          </motion.div>
          <motion.h3
            className="mb-2 text-2xl font-semibold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            No E-Books Available
          </motion.h3>
          <motion.p
            className="max-w-md text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isAdmin
              ? 'Start by adding your first e-book using the &quot;Add E-Book&quot; button above.'
              : "Check back later for new e-books. We're constantly adding new content!"}
          </motion.p>
          {isAdmin && (
            <motion.button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="size-5" />
              <span>Add Your First E-Book</span>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Upload Modal - Only show if admin */}
      {isAdmin && (
        <Dialog.Root
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 w-[600px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  Upload E-Book
                </Dialog.Title>
                <Dialog.Close className="rounded-lg p-1 hover:bg-gray-100">
                  <X className="size-5 text-gray-500" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="ebook-title"
                    className="block text-sm font-medium text-gray-700"
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
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="ebook-description"
                    className="block text-sm font-medium text-gray-700"
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
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label
                    htmlFor="ebook-file"
                    className="block text-sm font-medium text-gray-700"
                  >
                    E-Book File (PDF, EPUB)
                  </label>
                  <input
                    id="ebook-file"
                    type="file"
                    accept=".pdf,.epub"
                    onChange={handleFileChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="ebook-thumbnail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Thumbnail (Optional)
                  </label>
                  <input
                    id="ebook-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
                {showError && (
                  <motion.div
                    className="mt-4 rounded bg-red-100 px-4 py-2 text-red-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    Failed to create ebook. Please try again.
                  </motion.div>
                )}

                <div className="mt-6 flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={isUploading || !formData.file}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isUploading ? (
                      <>
                        <ClipLoader size={16} color="#fff" />
                        <span>Uploading...</span>
                      </>
                    ) : showSuccess ? (
                      <>
                        <CheckCircle2 className="size-5" />
                        <span>Uploaded Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-5" />
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
      <Dialog.Root open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-[60%] h-[60vh] w-[80vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold text-gray-800">
                {selectedEbook?.title}
              </Dialog.Title>
              <Dialog.Close className="rounded-lg p-1 hover:bg-gray-100">
                <X className="size-5 text-gray-500" />
              </Dialog.Close>
            </div>
            <div className="h-[calc(60vh-8rem)] w-full overflow-hidden rounded-lg border border-gray-200">
              {selectedEbook && (
                <iframe
                  src={`${selectedEbook.fileUrl}#view=FitH&toolbar=0`}
                  className="size-full"
                  title={selectedEbook.title}
                  style={{ border: 'none' }}
                />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={!!ebookToDelete}
        onOpenChange={(open) => !open && setEbookToDelete(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[400px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <AlertDialog.Title className="text-xl font-bold text-gray-800">
              Delete E-Book
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-gray-600">
              {`Are you sure you want to delete "${ebookToDelete?.title}"? This action cannot be undone.`}
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <motion.button
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <motion.button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-400"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isDeleting ? (
                    <>
                      <ClipLoader size={16} color="#fff" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      <span>Delete</span>
                    </>
                  )}
                </motion.button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
