'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { CustomDialog } from '../ui/custom-dialog';
import { Textarea } from '../ui/textarea';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Video item type for bucket videos
interface BucketVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  lastModified: string;
}

interface WebinarData {
  webinarName: string;
  webinarTitle: string;
  description: string;
  webinarStartDate: string;
  webinarEndDate: string;
  webinarTime: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  attendeeSignIn: boolean;
  passwordProtected: boolean;
  instantWatchEnabled: boolean;
  justInTimeEnabled: boolean;
  isPaid: boolean;
  paidAmount: number;
  discountPercentage?: number;
  discountAmount?: number;
  youtubeLink?: string;
  showThankYouPage: boolean;
  videoUploads: {
    title: string;
    url: string;
    publicId: string;
  }[];
}

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinarType: 'Automated Webinar' | 'Paid Webinar' | 'Paid Webinar';
  onSuccess?: () => void;
}

// Add API functions
const createWebinar = async (webinarData: WebinarData) => {
  const response = await fetch('/api/webinar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webinarData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create webinar');
  }

  return response.json();
};

export function ScheduleModal({
  open,
  onOpenChange,
  webinarType,
  onSuccess,
}: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [paidAmount, setPaidAmount] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [attendeeSignIn, setAttendeeSignIn] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [instantWatchEnabled, setInstantWatchEnabled] = useState(false);
  const [justInTimeEnabled, setJustInTimeEnabled] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState('');
  const [bucketVideos, setBucketVideos] = useState<BucketVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [showThankYouPage, setShowThankYouPage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Video states (removed - not needed for paid webinars)
  // const [videoUrl, setVideoUrl] = useState('');
  // const [videoTitle, setVideoTitle] = useState('');
  // const [isAddingUrl, setIsAddingUrl] = useState(false);
  // const [showUrlSuccess, setShowUrlSuccess] = useState(false);
  // const [videos, setVideos] = useState<VideoItem[]>([]);

  // Video functions removed - not needed for paid webinars
  // const handleAddUrl = async () => { ... };
  // const handleDelete = async (index: number) => { ... };

  // Auto thumbnail generation function
  const generateThumbnail = async (videoUrl: string) => {
    if (!videoUrl) return null;

    try {
      const response = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();
      if (data.success && data.thumbnailUrl) {
        console.log('✅ Thumbnail generated:', data.thumbnailUrl);
        return data.thumbnailUrl;
      }
    } catch (error) {
      console.error('❌ Failed to generate thumbnail:', error);
    }
    return null;
  };

  // Fetch bucket videos when modal opens
  const fetchBucketVideos = async () => {
    setLoadingVideos(true);
    try {
      console.log('🎬 Fetching bucket videos...');
      const response = await fetch('/api/bucket-videos');
      const data = await response.json();

      console.log('🎬 Bucket videos response:', data);

      if (data.success && Array.isArray(data.videos)) {
        setBucketVideos(data.videos);
        console.log(
          `✅ Loaded ${data.videos.length} videos from bucket:`,
          data.videos
        );
      } else {
        console.error('Failed to fetch bucket videos:', data);
        toast.error('Failed to load videos from bucket');
      }
    } catch (error) {
      console.error('Error fetching bucket videos:', error);
      toast.error('Failed to load videos from bucket');
    } finally {
      setLoadingVideos(false);
    }
  };

  // Fetch video metadata to get duration
  const fetchVideoMetadata = async (videoUrl: string) => {
    try {
      const response = await fetch('/api/video-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      if (response.ok) {
        const metadata = await response.json();
        return metadata;
      } else {
        console.error('Failed to fetch video metadata');
        return null;
      }
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return null;
    }
  };

  // Set initial date on client side to avoid hydration mismatch
  useEffect(() => {
    const now = new Date();
    if (!startDate) setStartDate(now);
  }, [startDate]);

  // Fetch videos when modal opens
  useEffect(() => {
    if (open) {
      fetchBucketVideos();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('🎬 Form submission started...');
      console.log('🎬 Form data:', {
        title,
        description,
        startDate,
        time,
        duration,
        selectedVideoId,
        bucketVideos: bucketVideos.length,
      });

      if (!title || !description || !startDate || !time || !duration) {
        console.log('❌ Missing required fields:', {
          title: !!title,
          description: !!description,
          startDate: !!startDate,
          time: !!time,
          duration: !!duration,
        });
        toast.error('Please fill in all required fields');
        return;
      }

      if (!selectedVideoId) {
        console.log(
          '❌ No video selected. Available videos:',
          bucketVideos.map((v) => ({ id: v.id, title: v.title }))
        );
        toast.error('Please select a video from the bucket');
        return;
      }

      // Video validation removed - not needed for paid webinars
      // if (videos.length === 0) {
      //   toast.error('Please add at least one video');
      //   return;
      // }

      // Validate the date
      if (isNaN(startDate!.getTime())) {
        console.log('❌ Invalid date:', startDate);
        toast.error('Invalid date');
        return;
      }

      const selectedVideo = bucketVideos.find((v) => v.id === selectedVideoId);
      console.log('🎬 Selected video for submission:', selectedVideo);

      const webinarData: WebinarData = {
        webinarName: title,
        webinarTitle: title,
        description,
        webinarStartDate: startDate!.toISOString(),
        webinarEndDate: startDate!.toISOString(), // Using same date for start and end
        webinarTime: time,
        durationHours: Math.floor(parseInt(duration) / 60),
        durationMinutes: parseInt(duration) % 60,
        durationSeconds: 0,
        attendeeSignIn,
        passwordProtected,
        instantWatchEnabled,
        justInTimeEnabled,
        isPaid,
        paidAmount: isPaid ? parseFloat(paidAmount) : 0,
        discountPercentage:
          isPaid && discountPercentage
            ? parseFloat(discountPercentage)
            : undefined,
        discountAmount:
          isPaid && discountAmount ? parseFloat(discountAmount) : undefined,
        youtubeLink: selectedVideoId
          ? bucketVideos.find((v) => v.id === selectedVideoId)?.url
          : undefined,
        showThankYouPage,
        videoUploads: [], // No videos needed for paid webinars
      };

      await createWebinar(webinarData);
      toast.success('Webinar scheduled successfully');
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving webinar:', error);
      toast.error('Failed to save webinar');
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
      title={`Schedule ${webinarType}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Selection from Zata AI Bucket */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="videoSelect" className="text-white">
                Select Video from Bucket <span className="text-red-400">*</span>
              </Label>
              <Button
                type="button"
                onClick={fetchBucketVideos}
                disabled={loadingVideos}
                className="rounded-md bg-slate-700 px-3 py-1 text-xs text-white transition-colors duration-200 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingVideos ? (
                  <div className="flex items-center space-x-1">
                    <div className="size-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <svg
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Refresh</span>
                  </div>
                )}
              </Button>
            </div>
            <div className="relative">
              <select
                value={selectedVideoId || ''}
                onChange={async (e) => {
                  const value = e.target.value;
                  console.log('🎬 Video selected:', value);
                  setSelectedVideoId(value);
                  const selectedVideo = bucketVideos.find(
                    (v) => v.id === value
                  );
                  console.log('🎬 Selected video object:', selectedVideo);

                  if (selectedVideo) {
                    console.log('🎬 Auto-filling title and thumbnail...');
                    // Auto-fill title and thumbnail
                    if (!title) {
                      setTitle(selectedVideo.title);
                      console.log('🎬 Title set to:', selectedVideo.title);
                    }

                    // Try to generate thumbnail if not already available
                    let thumbnailUrl = selectedVideo.thumbnailUrl || '';
                    if (!thumbnailUrl && selectedVideo.url) {
                      console.log(
                        '🎬 Generating thumbnail for:',
                        selectedVideo.url
                      );
                      thumbnailUrl =
                        (await generateThumbnail(selectedVideo.url)) || '';
                    }

                    setSelectedThumbnailUrl(thumbnailUrl);
                    console.log('🎬 Thumbnail URL set to:', thumbnailUrl);

                    // Auto-fill duration by fetching video metadata
                    try {
                      setLoadingMetadata(true);
                      toast.loading('Fetching video duration...', {
                        id: 'video-metadata',
                      });
                      const metadata = await fetchVideoMetadata(
                        selectedVideo.url
                      );

                      if (metadata && metadata.duration) {
                        // Convert seconds to minutes and set duration
                        const durationInMinutes = Math.ceil(
                          metadata.duration / 60
                        );
                        setDuration(durationInMinutes.toString());
                        console.log(
                          '🎬 Duration set to:',
                          durationInMinutes,
                          'minutes'
                        );

                        toast.success(
                          `Title and duration updated: ${Math.floor(metadata.duration / 60)}m ${metadata.duration % 60}s`,
                          { id: 'video-metadata' }
                        );
                      } else {
                        console.log('🎬 No duration found in metadata');
                        toast.error(
                          'Could not fetch video duration. Please enter manually.',
                          { id: 'video-metadata' }
                        );
                      }
                    } catch (error) {
                      console.error('Error fetching video metadata:', error);
                      toast.error(
                        'Failed to fetch video duration. Please enter manually.',
                        { id: 'video-metadata' }
                      );
                    } finally {
                      setLoadingMetadata(false);
                    }
                  } else {
                    console.log('🎬 No video found with ID:', value);
                  }
                }}
                disabled={loadingVideos || loadingMetadata}
                className="h-12 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white shadow-sm transition-all duration-200 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {loadingVideos
                    ? '🔄 Loading videos...'
                    : loadingMetadata
                      ? '📊 Fetching duration...'
                      : '📹 Select a video from bucket'}
                </option>
                {bucketVideos.map((video) => (
                  <option
                    key={video.id}
                    value={video.id}
                    className="bg-slate-800 text-white"
                  >
                    {video.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Thumbnail Generation Button */}
            {selectedVideoId && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={async () => {
                    const selectedVideo = bucketVideos.find(
                      (v) => v.id === selectedVideoId
                    );
                    if (selectedVideo && selectedVideo.url) {
                      toast.loading('Generating thumbnail...', {
                        id: 'thumbnail-gen',
                      });
                      const thumbnailUrl = await generateThumbnail(
                        selectedVideo.url
                      );
                      if (thumbnailUrl) {
                        setSelectedThumbnailUrl(thumbnailUrl);
                        toast.success('Thumbnail generated successfully!', {
                          id: 'thumbnail-gen',
                        });
                      } else {
                        toast.error('Failed to generate thumbnail', {
                          id: 'thumbnail-gen',
                        });
                      }
                    }
                  }}
                  className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                >
                  🖼️ Generate Thumbnail
                </Button>
              </div>
            )}

            <div className="mt-2 space-y-1">
              {/* Debug Information */}
              <div className="rounded border bg-slate-900/50 p-2 text-xs text-slate-500">
                <div>Debug Info:</div>
                <div>Selected Video ID: {selectedVideoId || 'None'}</div>
                <div>Videos Loaded: {bucketVideos.length}</div>
                <div>Loading Videos: {loadingVideos ? 'Yes' : 'No'}</div>
                <div>Loading Metadata: {loadingMetadata ? 'Yes' : 'No'}</div>
                <div>
                  Selected Thumbnail: {selectedThumbnailUrl ? 'Yes' : 'No'}
                </div>
                {bucketVideos.length > 0 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🧪 Testing video selection...');
                        const firstVideo = bucketVideos[0];
                        console.log('🧪 Selecting first video:', firstVideo);
                        setSelectedVideoId(firstVideo.id);
                        if (!title) {
                          setTitle(firstVideo.title);
                        }
                        setSelectedThumbnailUrl(firstVideo.thumbnailUrl || '');
                        console.log('🧪 Video selection test completed');
                      }}
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    >
                      Test Select First Video
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🧪 Testing manual video selection...');
                        // Manually set a video ID to test if the state is working
                        const testVideoId =
                          bucketVideos[0]?.id || 'test-video-id';
                        console.log('🧪 Setting test video ID:', testVideoId);
                        setSelectedVideoId(testVideoId);
                        console.log('🧪 Manual selection completed');
                      }}
                      className="ml-2 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                    >
                      Manual Set Video ID
                    </button>
                  </div>
                )}
              </div>
              {loadingVideos && (
                <div className="flex items-center space-x-2 text-xs text-blue-400">
                  <div className="size-3 animate-spin rounded-full border border-blue-400 border-t-transparent"></div>
                  <span>Loading videos from Zata AI bucket...</span>
                </div>
              )}
              {loadingMetadata && (
                <div className="flex items-center space-x-2 text-xs text-blue-400">
                  <div className="size-3 animate-spin rounded-full border border-blue-400 border-t-transparent"></div>
                  <span>Fetching video duration...</span>
                </div>
              )}
              {bucketVideos.length === 0 && !loadingVideos && (
                <div className="flex items-center space-x-2 rounded-lg border border-yellow-600/30 bg-yellow-900/20 px-3 py-2 text-xs text-yellow-400">
                  <svg
                    className="size-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    No videos found in bucket. Please upload videos to
                    &quot;shrelivewebinars&quot; bucket first.
                  </span>
                </div>
              )}
              {selectedVideoId && (
                <div className="flex items-center space-x-2 rounded-lg border border-green-600/30 bg-green-900/20 px-3 py-2 text-xs text-green-400">
                  <svg
                    className="size-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Video selected:{' '}
                    <strong>
                      {
                        bucketVideos.find((v) => v.id === selectedVideoId)
                          ?.title
                      }
                    </strong>{' '}
                    {selectedThumbnailUrl && 'with thumbnail'}
                  </span>
                </div>
              )}
              {bucketVideos.length > 0 &&
                !selectedVideoId &&
                !loadingVideos && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <svg
                      className="size-4 text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {bucketVideos.length} video
                      {bucketVideos.length !== 1 ? 's' : ''} available in bucket
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Thumbnail Preview */}
        {selectedThumbnailUrl && (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Video Thumbnail</Label>
              <div className="mt-2 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="flex items-center space-x-4">
                  <div className="shrink-0">
                    <Image
                      src={selectedThumbnailUrl}
                      alt="Video thumbnail"
                      width={80}
                      height={48}
                      className="h-12 w-20 rounded-lg border border-slate-600 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      Thumbnail automatically generated from video
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      This thumbnail will be used for the webinar preview
                    </p>
                  </div>
                  <div className="shrink-0">
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={async () => {
                          const selectedVideo = bucketVideos.find(
                            (v) => v.id === selectedVideoId
                          );
                          if (selectedVideo && selectedVideo.url) {
                            toast.loading('Regenerating thumbnail...', {
                              id: 'thumbnail-regen',
                            });
                            const thumbnailUrl = await generateThumbnail(
                              selectedVideo.url
                            );
                            if (thumbnailUrl) {
                              setSelectedThumbnailUrl(thumbnailUrl);
                              toast.success('Thumbnail regenerated!', {
                                id: 'thumbnail-regen',
                              });
                            } else {
                              toast.error('Failed to regenerate thumbnail', {
                                id: 'thumbnail-regen',
                              });
                            }
                          }
                        }}
                        className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        🔄
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setSelectedThumbnailUrl('')}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter webinar title"
              className="border-slate-700 bg-slate-800 text-white"
              required
            />
            {title && selectedVideoId && (
              <p className="mt-1 text-xs text-green-400">
                ✅ Title, duration, and thumbnail automatically filled from
                selected video
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter webinar description"
              className="border-slate-700 bg-slate-800 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-white">
                Date <span className="text-red-400">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="border-slate-700 bg-slate-800 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-white">
                Time <span className="text-red-400">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-slate-700 bg-slate-800 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration" className="text-white">
              Duration (minutes) <span className="text-red-400">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration in minutes"
                className="flex-1 border-slate-700 bg-slate-800 text-white"
                required
              />
              {duration && selectedVideoId && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>✅</span>
                  <span>Auto-filled</span>
                </div>
              )}
            </div>
            {duration && selectedVideoId && (
              <p className="mt-1 text-xs text-yellow-400">
                ⚠️ Duration automatically fetched from selected video - please
                confirm the duration once as it may not be correct
              </p>
            )}
          </div>
        </div>

        {/* Video Section removed - not needed for paid webinars */}

        {/* Toggle Switches */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isPaid}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPaid ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                onClick={() => setIsPaid(!isPaid)}
                onKeyDown={(e) =>
                  handleToggleKeyDown(e, () => setIsPaid(!isPaid))
                }
              >
                <motion.span
                  className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${isPaid ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </div>
              <Label className="cursor-pointer text-white">Paid Webinar</Label>
            </div>
          </div>

          {isPaid && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="paidAmount" className="text-white">
                  Original Amount (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white">
                    ₹
                  </span>
                  <Input
                    id="paidAmount"
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="border-slate-700 bg-slate-800 pl-8 text-white"
                  />
                </div>
              </div>

              {/* Discount Section */}
              <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                <h4 className="mb-3 text-sm font-medium text-white">
                  Discount Options
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="discountPercentage"
                      className="text-sm text-white"
                    >
                      Discount Percentage (%)
                    </Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discountPercentage}
                      onChange={(e) => {
                        setDiscountPercentage(e.target.value);
                        // Auto-calculate discount amount if original price is set
                        if (e.target.value && paidAmount) {
                          const percentage = parseFloat(e.target.value);
                          const originalPrice = parseFloat(paidAmount);
                          const calculatedAmount =
                            (originalPrice * percentage) / 100;
                          setDiscountAmount(calculatedAmount.toFixed(2));
                        }
                      }}
                      placeholder="0"
                      className="border-slate-700 bg-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="discountAmount"
                      className="text-sm text-white"
                    >
                      Discount Amount (₹)
                    </Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) => {
                        setDiscountAmount(e.target.value);
                        // Auto-calculate discount percentage if original price is set
                        if (e.target.value && paidAmount) {
                          const amount = parseFloat(e.target.value);
                          const originalPrice = parseFloat(paidAmount);
                          const calculatedPercentage =
                            (amount / originalPrice) * 100;
                          setDiscountPercentage(
                            calculatedPercentage.toFixed(2)
                          );
                        }
                      }}
                      placeholder="0.00"
                      className="border-slate-700 bg-slate-800 text-white"
                    />
                  </div>
                </div>

                {/* Final Price Display */}
                {paidAmount && (discountPercentage || discountAmount) && (
                  <div className="mt-3 rounded-lg border border-green-600/30 bg-green-900/30 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Original Price:</span>
                      <span className="text-slate-300 line-through">
                        ₹{paidAmount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400">Final Price:</span>
                      <span className="font-bold text-green-400">
                        ₹
                        {(() => {
                          const original = parseFloat(paidAmount);
                          const discount = parseFloat(discountAmount) || 0;
                          return Math.max(0, original - discount).toFixed(0);
                        })()}
                      </span>
                    </div>
                    {discountPercentage && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-400">Discount:</span>
                        <span className="font-bold text-red-400">
                          -{discountPercentage}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={attendeeSignIn}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${attendeeSignIn ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                onClick={() => setAttendeeSignIn(!attendeeSignIn)}
                onKeyDown={(e) =>
                  handleToggleKeyDown(e, () =>
                    setAttendeeSignIn(!attendeeSignIn)
                  )
                }
              >
                <motion.span
                  className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${attendeeSignIn ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </div>
              <Label className="cursor-pointer text-white">
                Require Attendee Sign In
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={passwordProtected}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${passwordProtected ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                onClick={() => setPasswordProtected(!passwordProtected)}
                onKeyDown={(e) =>
                  handleToggleKeyDown(e, () =>
                    setPasswordProtected(!passwordProtected)
                  )
                }
              >
                <motion.span
                  className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${passwordProtected ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </div>
              <Label className="cursor-pointer text-white">
                Password Protected
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={instantWatchEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${instantWatchEnabled ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                onClick={() => setInstantWatchEnabled(!instantWatchEnabled)}
                onKeyDown={(e) =>
                  handleToggleKeyDown(e, () =>
                    setInstantWatchEnabled(!instantWatchEnabled)
                  )
                }
              >
                <motion.span
                  className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${instantWatchEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </div>
              <Label className="cursor-pointer text-white">
                Enable Instant Watch
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={justInTimeEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${justInTimeEnabled ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                onClick={() => setJustInTimeEnabled(!justInTimeEnabled)}
                onKeyDown={(e) =>
                  handleToggleKeyDown(e, () =>
                    setJustInTimeEnabled(!justInTimeEnabled)
                  )
                }
              >
                <motion.span
                  className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${justInTimeEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </div>
              <Label className="cursor-pointer text-white">
                Enable Just In Time
              </Label>
            </div>
          </div>

          {/* YouTube Video Display Option */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={!showThankYouPage}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!showThankYouPage ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                  onClick={() => setShowThankYouPage(!showThankYouPage)}
                  onKeyDown={(e) =>
                    handleToggleKeyDown(e, () =>
                      setShowThankYouPage(!showThankYouPage)
                    )
                  }
                >
                  <motion.span
                    className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${!showThankYouPage ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </div>
                <Label className="cursor-pointer text-white">
                  Show Bucket Video
                </Label>
              </div>
            </div>

            {showThankYouPage && (
              <div className="rounded-lg border border-yellow-600/30 bg-yellow-900/30 p-3">
                <div className="flex items-center space-x-2">
                  <svg
                    className="size-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-yellow-400">
                    Thank you page will be displayed instead of video
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full text-white transition-all duration-200 ${
            !title ||
            !description ||
            !startDate ||
            !time ||
            !duration ||
            !selectedVideoId
              ? 'cursor-not-allowed bg-gray-500 hover:bg-gray-500'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={
            isSubmitting ||
            !title ||
            !description ||
            !startDate ||
            !time ||
            !duration ||
            !selectedVideoId
          }
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Scheduling...</span>
            </div>
          ) : !title ||
            !description ||
            !startDate ||
            !time ||
            !duration ||
            !selectedVideoId ? (
            <div className="flex items-center space-x-2">
              <svg
                className="size-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Complete all fields to schedule</span>
            </div>
          ) : (
            'Schedule Webinar'
          )}
        </Button>

        {/* Validation Status */}
        <div className="space-y-1 text-xs text-slate-400">
          <div
            className={`flex items-center space-x-2 ${title ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{title ? '✅' : '❌'}</span>
            <span>Title: {title || 'Required'}</span>
          </div>
          <div
            className={`flex items-center space-x-2 ${description ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{description ? '✅' : '❌'}</span>
            <span>Description: {description ? 'Provided' : 'Required'}</span>
          </div>
          <div
            className={`flex items-center space-x-2 ${startDate ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{startDate ? '✅' : '❌'}</span>
            <span>
              Date: {startDate ? startDate.toLocaleDateString() : 'Required'}
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 ${time ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{time ? '✅' : '❌'}</span>
            <span>Time: {time || 'Required'}</span>
          </div>
          <div
            className={`flex items-center space-x-2 ${duration ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{duration ? '✅' : '❌'}</span>
            <span>
              Duration: {duration ? `${duration} minutes` : 'Required'}
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 ${selectedVideoId ? 'text-green-400' : 'text-red-400'}`}
          >
            <span>{selectedVideoId ? '✅' : '❌'}</span>
            <span>Video: {selectedVideoId ? 'Selected' : 'Required'}</span>
          </div>
        </div>
      </form>
    </CustomDialog>
  );
}
