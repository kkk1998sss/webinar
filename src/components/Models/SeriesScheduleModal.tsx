'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, Play, Plus, Trash2 } from 'lucide-react';

import { CustomDialog } from '../ui/custom-dialog';
import { Textarea } from '../ui/textarea';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SeriesVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  orderIndex: number;
  duration?: number;
}

interface SeriesData {
  title: string;
  description: string;
  thumbnail?: string;
  isPublished: boolean;
  videos: Omit<SeriesVideo, 'id'>[];
}

interface SeriesScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Add bulk URLs state
interface BulkUrlsState {
  show: boolean;
  urls: string;
}

// Add API function
const createSeries = async (seriesData: SeriesData) => {
  const response = await fetch('/api/series', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seriesData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create series');
  }

  return response.json();
};

export function SeriesScheduleModal({
  open,
  onOpenChange,
  onSuccess,
}: SeriesScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [videos, setVideos] = useState<SeriesVideo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkUrls, setBulkUrls] = useState<BulkUrlsState>({
    show: false,
    urls: '',
  });

  // Video management
  const addVideo = () => {
    const newVideo: SeriesVideo = {
      id: Date.now().toString(),
      title: '',
      description: '',
      videoUrl: '',
      orderIndex: videos.length,
    };
    setVideos([...videos, newVideo]);
  };

  const addBulkUrls = () => {
    const urls = bulkUrls.urls
      .split('\n')
      .map((url) => url.trim())
      .filter(
        (url) =>
          url && (url.includes('youtube.com') || url.includes('youtu.be'))
      );

    if (urls.length === 0) {
      toast.error('Please enter valid YouTube URLs (one per line)');
      return;
    }

    const newVideos = urls.map((url, index) => ({
      id: (Date.now() + index).toString(),
      title: `Video ${videos.length + index + 1}`, // Default title
      description: '',
      videoUrl: url,
      orderIndex: videos.length + index,
    }));

    setVideos([...videos, ...newVideos]);
    setBulkUrls({ show: false, urls: '' });
    toast.success(
      `Added ${urls.length} videos! You can now auto-fill titles for each.`
    );
  };

  const autoFillAllTitles = async () => {
    if (videos.length === 0) return;

    toast('Fetching titles from YouTube... This may take a moment.', {
      icon: 'ℹ️',
    });

    const updatedVideos = [...videos];
    let successCount = 0;

    for (let i = 0; i < updatedVideos.length; i++) {
      const video = updatedVideos[i];
      if (!video.videoUrl) continue;

      try {
        const response = await fetch('/api/video-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: video.videoUrl }),
        });

        if (response.ok) {
          const metadata = await response.json();
          if (metadata.title) {
            updatedVideos[i] = { ...video, title: metadata.title };
            successCount++;
          }
          if (metadata.duration) {
            updatedVideos[i] = {
              ...updatedVideos[i],
              duration: metadata.duration,
            };
          }
        }
      } catch (error) {
        console.error(`Error fetching metadata for video ${i + 1}:`, error);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setVideos(updatedVideos);
    toast.success(`Successfully fetched ${successCount} titles from YouTube!`);
  };

  const updateVideo = (
    id: string,
    field: keyof SeriesVideo,
    value: string | number
  ) => {
    setVideos(
      videos.map((video) =>
        video.id === id ? { ...video, [field]: value } : video
      )
    );
  };

  const removeVideo = (videoId: string) => {
    const newVideos = videos.filter((video) => video.id !== videoId);
    // Reorder indices
    const reorderedVideos = newVideos.map((video, index) => ({
      ...video,
      orderIndex: index,
    }));
    setVideos(reorderedVideos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!title || !description) {
        toast.error('Please fill in title and description');
        return;
      }

      if (videos.length === 0) {
        toast.error('Please add at least one video');
        return;
      }

      // Validate all videos have required fields
      const invalidVideo = videos.find(
        (video) => !video.title || !video.videoUrl
      );
      if (invalidVideo) {
        toast.error('Please fill in title and URL for all videos');
        return;
      }

      const seriesData: SeriesData = {
        title,
        description,
        thumbnail: thumbnail || undefined,
        isPublished,
        videos: videos.map(({ id, ...video }) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _ = id;
          return video;
        }),
      };

      await createSeries(seriesData);
      toast.success('Series created successfully');

      // Reset form
      setTitle('');
      setDescription('');
      setThumbnail('');
      setIsPublished(false);
      setVideos([]);
      setBulkUrls({ show: false, urls: '' });

      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating series:', error);
      toast.error('Failed to create series');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accessibility: handle keyboard for toggles
  const handleToggleKeyDown = (
    e: React.KeyboardEvent,
    toggleFn: () => void
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFn();
    }
  };

  return (
    <CustomDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Create Web Series"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[80vh] space-y-6 overflow-y-auto"
      >
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">
              Series Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter series title"
              className="border-slate-700 bg-slate-800 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter series description"
              className="border-slate-700 bg-slate-800 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="thumbnail" className="text-white">
              Thumbnail URL (Optional)
            </Label>
            <Input
              id="thumbnail"
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isPublished}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                onClick={() => setIsPublished(!isPublished)}
                onKeyDown={(e) =>
                  handleToggleKeyDown(e, () => setIsPublished(!isPublished))
                }
              >
                <motion.span
                  className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${isPublished ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </div>
              <Label className="cursor-pointer text-white">
                Publish Immediately
              </Label>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Videos</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() =>
                  setBulkUrls({ ...bulkUrls, show: !bulkUrls.show })
                }
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                📋 Bulk Add URLs
              </Button>
              <Button
                type="button"
                onClick={addVideo}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Plus className="mr-2 size-4" />
                Add Single Video
              </Button>
            </div>
          </div>

          {/* Bulk URLs Input */}
          {bulkUrls.show && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4"
            >
              <Label className="mb-2 block text-white">
                Add Multiple YouTube URLs (one per line)
              </Label>
              <Textarea
                value={bulkUrls.urls}
                onChange={(e) =>
                  setBulkUrls({ ...bulkUrls, urls: e.target.value })
                }
                placeholder={`https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/ABC123
https://www.youtube.com/watch?v=XYZ456`}
                className="mb-3 border-slate-700 bg-slate-800 text-white"
                rows={5}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addBulkUrls}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  ✅ Add All URLs
                </Button>
                <Button
                  type="button"
                  onClick={() => setBulkUrls({ show: false, urls: '' })}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
              <p className="mt-2 text-xs text-blue-400">
                💡 Tip: After adding URLs, use &quot;Auto-fill&quot; buttons to
                fetch titles from YouTube
              </p>
            </motion.div>
          )}

          {/* Auto-fill All Titles Button */}
          {videos.length > 1 &&
            videos.some(
              (v) => v.videoUrl && !v.title.includes('Auto-filled')
            ) && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={autoFillAllTitles}
                  variant="outline"
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                >
                  🎬 Auto-fill All Titles from YouTube
                </Button>
              </div>
            )}

          <AnimatePresence>
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-lg border border-slate-600 bg-slate-800/50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-2 flex flex-col items-center gap-2">
                    <GripVertical className="size-4 cursor-move text-slate-400" />
                    <span className="text-xs text-slate-400">#{index + 1}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-white">
                          YouTube URL <span className="text-red-400">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={video.videoUrl}
                            onChange={(e) =>
                              updateVideo(video.id, 'videoUrl', e.target.value)
                            }
                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                            className="flex-1 border-slate-700 bg-slate-800 text-white"
                          />
                          <Button
                            type="button"
                            onClick={async () => {
                              if (!video.videoUrl) {
                                toast.error('Please enter a YouTube URL first');
                                return;
                              }

                              try {
                                const response = await fetch(
                                  '/api/video-metadata',
                                  {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      videoUrl: video.videoUrl,
                                    }),
                                  }
                                );

                                if (response.ok) {
                                  const metadata = await response.json();
                                  if (metadata.title) {
                                    updateVideo(
                                      video.id,
                                      'title',
                                      metadata.title
                                    );
                                    toast.success(
                                      'Title fetched from YouTube!'
                                    );
                                  }
                                  if (metadata.duration) {
                                    updateVideo(
                                      video.id,
                                      'duration',
                                      metadata.duration
                                    );
                                  }
                                } else {
                                  toast.error('Failed to fetch video metadata');
                                }
                              } catch (error) {
                                console.error(
                                  'Error fetching metadata:',
                                  error
                                );
                                toast.error('Network error');
                              }
                            }}
                            className="bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
                            disabled={!video.videoUrl.trim()}
                          >
                            📊 Auto-fill
                          </Button>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Paste YouTube URL and click &quot;Auto-fill&quot; to
                          get title automatically
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm text-white">
                          Video Title <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          value={video.title}
                          onChange={(e) =>
                            updateVideo(video.id, 'title', e.target.value)
                          }
                          placeholder="Enter video title (or auto-fill from YouTube)"
                          className="border-slate-700 bg-slate-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-white">Description</Label>
                      <Textarea
                        value={video.description}
                        onChange={(e) =>
                          updateVideo(video.id, 'description', e.target.value)
                        }
                        placeholder="Enter video description"
                        className="border-slate-700 bg-slate-800 text-white"
                        rows={2}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(video.id)}
                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {videos.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <Play className="mx-auto mb-3 size-12 opacity-50" />
              <p>No videos added yet</p>
              <p className="text-sm">
                Click &quot;Add Video&quot; to get started
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-green-600 text-white hover:bg-green-700"
          disabled={isSubmitting || videos.length === 0}
        >
          {isSubmitting ? 'Creating Series...' : 'Create Series'}
        </Button>
      </form>
    </CustomDialog>
  );
}
