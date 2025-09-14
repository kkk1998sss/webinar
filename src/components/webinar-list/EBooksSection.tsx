'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  X,
} from 'lucide-react';
import Image from 'next/image';

interface EBook {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  downloads: number;
  createdAt: string;
  thumbnailUrl?: string;
}

interface EBookResponse {
  success: boolean;
  ebooks: EBook[];
  error?: string;
}

const EBooksSection: React.FC = () => {
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewEbook, setPreviewEbook] = useState<EBook | null>(null);

  useEffect(() => {
    fetchEBooks();
  }, [currentPage]);

  const fetchEBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📚 Fetching ebooks...');

      const response = await fetch('/api/ebooks');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EBookResponse = await response.json();

      console.log('📚 Raw API response:', data);

      if (data.success) {
        console.log('📚 Successfully fetched ebooks:', data.ebooks);
        setEbooks(data.ebooks || []);
        setTotalPages(Math.ceil((data.ebooks || []).length / 12));
      } else {
        setError(data.error || 'Failed to fetch ebooks');
        console.error('❌ Error fetching ebooks:', data.error);
      }
    } catch (err) {
      console.error('❌ Error fetching ebooks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ebooks');
    } finally {
      setLoading(false);
    }
  };

  const handleReadClick = (ebook: EBook, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('📚 Opening ebook preview:', ebook.title);
    setPreviewEbook(ebook);
  };

  const closePreview = () => {
    setPreviewEbook(null);
  };

  const handleDownload = async (ebook: EBook, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/ebooks/${ebook.id}/download`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ebook.title}.${ebook.fileType.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const scrollLeft = () => {
    const scrollContainer = document.getElementById('ebooks-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const scrollContainer = document.getElementById('ebooks-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-lg">
        <div className="flex h-32 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <span className="ml-3 text-green-700">Loading ebooks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-2 text-2xl text-red-600">⚠️</div>
          <h3 className="mb-2 font-semibold text-red-800">
            Error Loading Ebooks
          </h3>
          <p className="text-sm text-red-700">
            {error || 'Unknown error occurred'}
          </p>
          <button
            onClick={fetchEBooks}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (ebooks.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-4xl text-green-600">📚</div>
          <h3 className="mb-2 font-semibold text-green-800">No Ebooks Found</h3>
          <p className="text-sm text-green-700">
            No ebooks available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center space-x-3">
          <div className="rounded-xl bg-green-600 p-3 text-white">
            <BookOpen className="size-8" />
          </div>
          <h2 className="text-3xl font-bold text-green-800">
            Ebooks Collection
          </h2>
        </div>
        <p className="text-lg text-green-600">
          Spiritual texts and meditation guides
        </p>
        <p className="mt-2 text-sm text-green-500">
          {ebooks.length} ebooks available
        </p>
      </div>

      {/* Ebook Grid */}
      <div className="relative">
        {/* Navigation arrows */}
        {ebooks.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-green-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-green-600/90">
                <ChevronLeft className="size-5 animate-pulse" />
              </div>
            </button>

            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-green-500/80 text-white shadow-lg backdrop-blur-sm hover:bg-green-600/90">
                <ChevronRight className="size-5 animate-pulse" />
              </div>
            </button>
          </>
        )}

        <div
          id="ebooks-scroll-container"
          className={`${
            ebooks.length > 3
              ? 'scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-16 pb-4'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          }`}
          style={
            ebooks.length > 3
              ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
              : {}
          }
        >
          {ebooks.map((ebook) => (
            <motion.div
              key={ebook.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative cursor-pointer overflow-hidden rounded-lg border border-green-200 bg-white p-4 shadow-md transition-all duration-200 hover:border-green-300 hover:shadow-lg ${
                ebooks.length > 3 ? 'w-[300px] shrink-0 snap-center' : ''
              }`}
              onClick={(e) => handleReadClick(ebook, e)}
            >
              {/* Ebook Thumbnail */}
              <div className="mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                {ebook.thumbnailUrl ? (
                  <Image
                    src={ebook.thumbnailUrl}
                    alt={ebook.title}
                    width={300}
                    height={400}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">📚</div>
                      <div className="text-sm text-green-600">PDF Preview</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ebook Info */}
              <div className="mb-3 flex items-center justify-between">
                <div className="text-2xl">📚</div>
                <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  PDF
                </div>
              </div>

              {/* Ebook Name */}
              <h4 className="mb-2 line-clamp-2 font-semibold text-gray-800">
                {ebook.title}
              </h4>

              {/* Ebook Details */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 size-4" />
                  <span>Added: {formatDate(ebook.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="mr-2 size-4" />
                  <span>Size: {formatFileSize(ebook.fileSize)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Download className="mr-2 size-4" />
                  <span>Downloads: {ebook.downloads}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-sm text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-600"
                  onClick={(e) => handleReadClick(ebook, e)}
                >
                  <Eye className="mr-1 inline size-3" />
                  Read
                </button>
                <button
                  className="rounded-lg border border-green-300 bg-white px-3 py-2 text-sm text-green-600 transition-all duration-200 hover:bg-green-50"
                  onClick={(e) => handleDownload(ebook, e)}
                  title="Download PDF"
                >
                  <Download className="size-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-green-300 bg-white px-3 py-2 text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="flex items-center px-3 py-2 text-green-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-green-300 bg-white px-3 py-2 text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-green-600">
          📚 Access spiritual texts and meditation guides
        </p>
      </div>

      {/* PDF Preview Modal */}
      {previewEbook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closePreview}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closePreview();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-h-[90vh] w-full max-w-4xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {previewEbook.title}
                </h3>
                <p className="text-sm text-gray-600">
                  PDF Preview • {formatFileSize(previewEbook.fileSize)}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="h-[70vh] overflow-hidden">
              <iframe
                src={previewEbook.fileUrl}
                className="size-full border-0"
                title={`Preview of ${previewEbook.title}`}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 p-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📚 {previewEbook.downloads} downloads</span>
                <span>📅 Added: {formatDate(previewEbook.createdAt)}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    closePreview();
                    handleDownload(previewEbook, e);
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <Download className="mr-2 inline size-4" />
                  Download PDF
                </button>
                <button
                  onClick={closePreview}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EBooksSection;
