'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

import { CustomDialog } from '../ui/custom-dialog';
import { Textarea } from '../ui/textarea';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VideoData {
  title: string;
  description: string;
  videoUrl: string;
  duration?: number;
}

interface AddVideoToSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  seriesTitle: string;
  onSuccess?: () => void;
}

// Add API function
const addVideoToSeries = async (seriesId: string, videoData: VideoData) => {
  const response = await fetch(`/api/series/${seriesId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(videoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add video to series');
  }

  return response.json();
};

export function AddVideoToSeriesModal({
  open,
  onOpenChange,
  seriesId,
  seriesTitle,
  onSuccess,
}: AddVideoToSeriesModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const autoFillFromYoutube = async () => {
    console.log('🎯 Auto-fill button clicked! Video URL:', videoUrl);

    if (!videoUrl) {
      toast.error('Please enter a YouTube URL first');
      return;
    }

    // Validate YouTube URL format
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    console.log('🚀 Starting YouTube API request...');
    toast.loading('Fetching video details from YouTube...', {
      id: 'youtube-fetch',
    });

    try {
      console.log('📡 Making fetch request to /api/video-metadata');
      const response = await fetch('/api/video-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok) {
        if (data.title) {
          console.log('✅ Setting title:', data.title);
          setTitle(data.title);
          if (data.duration) {
            console.log('⏱️ Setting duration:', data.duration);
            setDuration(data.duration);
          }
          toast.success('Video details fetched from YouTube!', {
            id: 'youtube-fetch',
          });
          console.log('🎉 YouTube metadata successfully applied:', data);
        } else {
          console.warn('⚠️ No title in response:', data);
          toast.error('Could not fetch video title from YouTube', {
            id: 'youtube-fetch',
          });
        }
      } else {
        console.error('❌ API error:', data);
        toast.error(data.error || 'Failed to fetch video metadata', {
          id: 'youtube-fetch',
        });
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      toast.error('Network error while fetching video details', {
        id: 'youtube-fetch',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!title || !videoUrl) {
        toast.error('Please fill in title and video URL');
        return;
      }

      // Validate YouTube URL
      if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        toast.error('Please enter a valid YouTube URL');
        return;
      }

      const videoData: VideoData = {
        title,
        description,
        videoUrl,
        duration,
      };

      await addVideoToSeries(seriesId, videoData);
      toast.success('Video added to series successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setDuration(undefined);

      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding video to series:', error);
      toast.error('Failed to add video to series');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setDuration(undefined);
    onOpenChange(false);
  };

  return (
    <CustomDialog
      isOpen={open}
      onClose={handleClose}
      title={`Add Video to "${seriesTitle}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* YouTube URL */}
        <div>
          <Label htmlFor="videoUrl" className="text-white">
            YouTube URL <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="flex-1 border-slate-700 bg-slate-800 text-white"
              required
            />
            <Button
              type="button"
              onClick={autoFillFromYoutube}
              className="whitespace-nowrap bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
              disabled={!videoUrl.trim()}
            >
              📊 Auto-fill
            </Button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Paste YouTube URL and click &quot;Auto-fill&quot; to get title
            automatically. If auto-fill doesn&apos;t work, you can enter the
            title manually below.
          </p>
        </div>

        {/* Video Title */}
        <div>
          <Label htmlFor="title" className="text-white">
            Video Title <span className="text-red-400">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title (or auto-fill from YouTube)"
            className="border-slate-700 bg-slate-800 text-white"
            required
          />
        </div>

        {/* Video Description */}
        <div>
          <Label htmlFor="description" className="text-white">
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            className="border-slate-700 bg-slate-800 text-white"
            rows={3}
          />
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <Plus className="mt-0.5 size-5 shrink-0 text-blue-400" />
            <div>
              <h4 className="mb-1 font-medium text-blue-400">
                Adding to Series
              </h4>
              <p className="text-sm text-blue-300">
                This video will be added to the end of &quot;{seriesTitle}&quot;
                series. You can reorder videos later if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
            disabled={isSubmitting || !title || !videoUrl}
          >
            {isSubmitting ? 'Adding Video...' : 'Add Video'}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
