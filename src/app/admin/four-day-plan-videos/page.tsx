'use client';

import { useEffect, useState } from 'react';
import {
  FaEdit,
  FaFilter,
  FaPlus,
  FaSearch,
  FaTrash,
  FaVideo,
} from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

type FourDayPlanVideo = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  day: number;
  createdAt: string;
};

export default function FourDayPlanVideosPage() {
  const [videos, setVideos] = useState<FourDayPlanVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    day: 1,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit dialog state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    day: 1,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setFormError(null);
    try {
      const res = await fetch('/api/four-day');
      const data = await res.json();
      if (Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        setFormError(data.message || 'Failed to fetch videos');
      }
    } catch {
      setFormError('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = filterDay === 'all' || video.day === filterDay;
    return matchesSearch && matchesDay;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(false);
    try {
      const res = await fetch('/api/four-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.video)) {
        setFormSuccess(true);
        setForm({ title: '', description: '', videoUrl: '', day: 1 });
        fetchVideos();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess(false);
        }, 1200);
      } else {
        setFormError(data.message || 'Failed to add video');
      }
    } catch {
      setFormError('Failed to add video');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    setFormError(null);
    try {
      const res = await fetch('/api/four-day', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      } else {
        setFormError(data.error || 'Failed to delete video');
      }
    } catch {
      setFormError('Failed to delete video');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Remove unused handleEdit function
  // const handleEdit = async (id: string) => { ... } // <-- DELETE THIS FUNCTION

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.h1
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Four Day Plan Videos
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-4"
        >
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaPlus /> Add Video
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              <FaFilter /> Filter
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="w-48 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              sideOffset={5}
            >
              <div className="space-y-2">
                <button
                  onClick={() => setFilterDay('all')}
                  className={`w-full rounded px-3 py-2 text-left text-sm ${
                    filterDay === 'all'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Days
                </button>
                {[1, 2, 3, 4].map((day) => (
                  <button
                    key={day}
                    onClick={() => setFilterDay(day)}
                    className={`w-full rounded px-3 py-2 text-left text-sm ${
                      filterDay === day
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </motion.div>

      {loading ? (
        <motion.div
          className="flex items-center justify-center p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="size-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Loading videos...
          </span>
        </motion.div>
      ) : (
        <div className="w-full overflow-auto rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
          <ScrollArea.Root className="w-full">
            <ScrollArea.Viewport className="w-full">
              <motion.table
                className="w-full min-w-[800px] text-xs text-gray-700 dark:text-gray-300"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <thead>
                  <tr>
                    <th className="w-12 p-2 text-center font-medium text-gray-500 dark:text-gray-400">
                      S.No
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Day
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Title
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Video URL
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Created At
                    </th>
                    <th className="p-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-400">
                        No videos found.
                      </td>
                    </tr>
                  ) : (
                    filteredVideos.map((video, index) => (
                      <motion.tr
                        key={video.id}
                        variants={itemVariants}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="p-2 text-center">{index + 1}</td>
                        <td className="p-2">{video.day}</td>
                        <td className="flex items-center gap-2 p-2 font-medium">
                          <FaVideo className="text-blue-400" /> {video.title}
                        </td>
                        <td className="p-2">
                          <p className="line-clamp-2">{video.description}</p>
                        </td>
                        <td className="p-2">
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            View
                          </a>
                        </td>
                        <td className="p-2">
                          {new Date(video.createdAt).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
                              onClick={() => {
                                setDeleteId(video.id);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={deleteLoading}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                            <button
                              className="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50"
                              onClick={() => {
                                setEditId(video.id);
                                setEditForm({
                                  title: video.title,
                                  description: video.description,
                                  videoUrl: video.videoUrl,
                                  day: video.day,
                                });
                                setEditDialogOpen(true);
                              }}
                              disabled={editLoading}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </motion.table>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="horizontal"
              className="flex h-2.5 touch-none select-none bg-gray-100 p-0.5 dark:bg-gray-700"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      )}

      {/* Add Video Dialog */}
      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          setFormError(null);
          setFormSuccess(false);
          setForm({ title: '', description: '', videoUrl: '', day: 1 });
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="mb-4 text-lg font-bold text-gray-800">
              Add Four Day Plan Video
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="day"
                  className="block text-sm font-medium text-gray-700"
                >
                  Day
                </label>
                <input
                  id="day"
                  type="number"
                  min={1}
                  max={4}
                  value={form.day}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, day: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="videoUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Video URL
                </label>
                <input
                  id="videoUrl"
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, videoUrl: e.target.value }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={formLoading || formSuccess}
                  whileHover={{ scale: formLoading || formSuccess ? 1 : 1.03 }}
                  whileTap={{ scale: formLoading || formSuccess ? 1 : 0.97 }}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : formSuccess ? (
                    <>
                      <CheckCircle2 className="size-5 text-green-300" />
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="text-green-600"
                      >
                        Saved!
                      </motion.span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </motion.button>
              </div>
              <AnimatePresence>
                {formError && (
                  <motion.div
                    className="mt-2 flex items-center gap-2 rounded bg-red-100 px-3 py-2 text-sm text-red-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <XCircle className="size-4" />
                    {formError}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="mb-2 text-lg font-bold text-gray-800">
              Confirm Delete
            </Dialog.Title>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete this video? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setDeleteDialogOpen(false)}
                type="button"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={() => {
                  if (deleteId) {
                    handleDelete(deleteId);
                  }
                }}
                type="button"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader2 className="inline size-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Video Dialog */}
      <Dialog.Root
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          setFormError(null);
          setFormSuccess(false);
          setEditForm({ title: '', description: '', videoUrl: '', day: 1 });
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="mb-4 text-lg font-bold text-gray-800">
              Edit Four Day Plan Video
            </Dialog.Title>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editId) return;
                setEditLoading(true);
                setFormError(null);
                try {
                  const res = await fetch('/api/four-day', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editId, ...editForm }),
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    setEditDialogOpen(false);
                    setEditId(null);
                    fetchVideos();
                  } else {
                    setFormError(data.message || 'Failed to update video');
                  }
                } catch {
                  setFormError('Failed to update video');
                } finally {
                  setEditLoading(false);
                }
              }}
            >
              <div>
                <label
                  htmlFor="edit-day"
                  className="block text-sm font-medium text-gray-700"
                >
                  Day
                </label>
                <input
                  id="edit-day"
                  type="number"
                  min={1}
                  max={4}
                  value={editForm.day}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, day: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-videoUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Video URL
                </label>
                <input
                  id="edit-videoUrl"
                  type="url"
                  value={editForm.videoUrl}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, videoUrl: e.target.value }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <Loader2 className="inline size-4 animate-spin" />
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
              <AnimatePresence>
                {formError && (
                  <motion.div
                    className="mt-2 flex items-center gap-2 rounded bg-red-100 px-3 py-2 text-sm text-red-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <XCircle className="size-4" />
                    {formError}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
