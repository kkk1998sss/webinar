'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Folder,
  PlayCircle,
  Plus,
  Trash2,
  Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { AddVideoToSeriesModal } from '@/components/Models/AddVideoToSeriesModal';
import { Series } from '@/types/user';

interface SeriesSectionProps {
  handlePlaySeries?: (seriesId: string) => void;
}

export function SeriesSection({ handlePlaySeries }: SeriesSectionProps) {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin || false;

  const fetchSeries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/series');
      const data = await response.json();
      if (data.success) {
        // Show all series for admin, only published series for normal users
        if (isAdmin) {
          setSeries(data.series);
        } else {
          setSeries(data.series.filter((s: Series) => s.isPublished));
        }
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleSeriesClick = (seriesId: string) => {
    router.push(`/users/series/${seriesId}`);
  };

  const handlePlayAllClick = (e: React.MouseEvent, seriesId: string) => {
    e.stopPropagation();
    if (handlePlaySeries) {
      handlePlaySeries(seriesId);
    } else {
      router.push(`/users/series/${seriesId}/player`);
    }
  };

  const handleAddVideoClick = (e: React.MouseEvent, series: Series) => {
    e.stopPropagation();
    setSelectedSeries(series);
    setShowAddVideoModal(true);
  };

  const handleAddVideoSuccess = () => {
    fetchSeries(); // Refresh the series list
    setShowAddVideoModal(false);
    setSelectedSeries(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, series: Series) => {
    e.stopPropagation();
    setSeriesToDelete(series);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!seriesToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/series/${seriesToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Series deleted successfully!');
        fetchSeries(); // Refresh the series list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete series');
      }
    } catch (error) {
      console.error('Error deleting series:', error);
      toast.error('Failed to delete series');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSeriesToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSeriesToDelete(null);
  };

  const handleTogglePublished = async (e: React.MouseEvent, series: Series) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/series/${series.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: series.title,
          description: series.description,
          thumbnail: series.thumbnail,
          isPublished: !series.isPublished,
        }),
      });

      if (response.ok) {
        toast.success(
          `Series ${!series.isPublished ? 'published' : 'unpublished'} successfully!`
        );
        fetchSeries(); // Refresh the series list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update series');
      }
    } catch (error) {
      console.error('Error updating series:', error);
      toast.error('Failed to update series');
    }
  };

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="mb-8 flex justify-center">
          <div className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-2 text-3xl font-bold text-white shadow-xl">
            📁 Web Series
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-slate-600 dark:bg-slate-700"
            >
              <div className="mb-3 h-4 rounded bg-gray-300 dark:bg-slate-600"></div>
              <div className="mb-2 h-3 rounded bg-gray-300 dark:bg-slate-600"></div>
              <div className="h-3 w-2/3 rounded bg-gray-300 dark:bg-slate-600"></div>
            </div>
          ))}
        </div>
      </motion.section>
    );
  }

  if (series.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="mb-8 flex justify-center">
          <h2 className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-2 text-3xl font-bold text-white shadow-xl">
            📁 Web Series
          </h2>
        </div>
        <div className="flex justify-center p-12">
          <div className="text-center text-gray-500 dark:text-slate-400">
            <div className="mb-4 text-6xl">📁</div>
            <h3 className="mb-2 text-xl font-semibold">
              No web series available
            </h3>
            <p className="text-sm">
              Check back later for new series or create one if you&apos;re an
              admin
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="mb-8 flex items-center justify-center gap-4">
          <h2 className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-2 text-3xl font-bold text-white shadow-xl">
            📁 Webinar Series
          </h2>
          {/* Temporary sync button to fix video counts */}
          {/* <button
          onClick={handleSyncSeries}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sync video counts"
        >
          <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Counts'}
        </button> */}
        </div>

        {/* Navigation arrows for more than 3 series */}
        {series.length > 3 && (
          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl dark:border-slate-600 dark:bg-slate-800"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5 text-gray-600 dark:text-slate-400" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl dark:border-slate-600 dark:bg-slate-800"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5 text-gray-600 dark:text-slate-400" />
            </button>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className={`${
            series.length > 3
              ? 'scrollbar-hide flex gap-4 overflow-x-auto pb-4'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          }`}
          style={
            series.length > 3
              ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
              : {}
          }
        >
          {series.map((seriesItem) => (
            <motion.div
              key={seriesItem.id}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-green-300 hover:shadow-lg dark:border-slate-600 dark:bg-slate-700 dark:hover:border-green-500 ${
                series.length > 3 ? 'w-80 shrink-0' : ''
              }`}
              onClick={() => handleSeriesClick(seriesItem.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Folder Icon Background */}
              <div className="absolute right-3 top-3 opacity-20 transition-opacity group-hover:opacity-30">
                <Folder className="size-12 text-green-500" />
              </div>

              {/* Action Buttons - Top Right (Admin Only) */}
              {isAdmin && (
                <div className="absolute right-2 top-2 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => handleTogglePublished(e, seriesItem)}
                    className={`flex size-8 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-110 ${
                      seriesItem.isPublished
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                    title={
                      seriesItem.isPublished
                        ? 'Unpublish series'
                        : 'Publish series'
                    }
                  >
                    {seriesItem.isPublished ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleAddVideoClick(e, seriesItem)}
                    className="flex size-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-green-600"
                    title="Add video to series"
                  >
                    <Plus className="size-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, seriesItem)}
                    className="flex size-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-600"
                    title="Delete entire series"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}

              <div className="p-4">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="line-clamp-2 font-semibold text-gray-800 dark:text-slate-100">
                        {seriesItem.title}
                      </h4>
                      {isAdmin && !seriesItem.isPublished && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                          Draft
                        </span>
                      )}
                    </div>
                    {seriesItem.description && (
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-slate-400">
                        {seriesItem.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Video className="size-4" />
                    <span>{seriesItem.videos?.length || 0} videos</span>
                  </div>
                  {seriesItem.totalDuration > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      <span>{formatDuration(seriesItem.totalDuration)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handlePlayAllClick(e, seriesItem.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                  >
                    <PlayCircle className="size-4" />
                    Play All
                  </button>
                  <button
                    onClick={() => handleSeriesClick(seriesItem.id)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    <Eye className="size-4" />
                    Browse
                  </button>
                </div>

                {/* Progress Bar Placeholder */}
                <div className="mt-3 h-1 rounded-full bg-gray-200 dark:bg-slate-600">
                  <div
                    className="h-1 rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: '0%' }} // TODO: Implement progress tracking
                  />
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-green-500/5 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-green-400/5" />
            </motion.div>
          ))}
        </div>

        {/* Add Video Modal */}
        {selectedSeries && (
          <AddVideoToSeriesModal
            open={showAddVideoModal}
            onOpenChange={setShowAddVideoModal}
            seriesId={selectedSeries.id}
            seriesTitle={selectedSeries.title}
            onSuccess={handleAddVideoSuccess}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && seriesToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <Trash2 className="size-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Delete Series
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-slate-300">
                  Are you sure you want to delete{' '}
                  <strong>&quot;{seriesToDelete.title}&quot;</strong>? This will
                  permanently delete the series and all{' '}
                  {seriesToDelete.videos?.length || 0} videos in it.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Delete Series
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.section>
    </>
  );
}
