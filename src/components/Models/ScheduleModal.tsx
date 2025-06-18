'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import { CheckCircle2, Link, Trash } from 'lucide-react';

import { CustomDialog } from '../ui/custom-dialog';
import { Textarea } from '../ui/textarea';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Video item type
type VideoItem = {
  id: string;
  title: string;
  url: string;
  publicId?: string;
};

interface WebinarData {
  webinarName: string;
  webinarTitle: string;
  description: string;
  webinarDate: string;
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
  videoUploads: {
    title: string;
    url: string;
    publicId: string;
  }[];
}

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinarType: 'Automated Webinar' | 'Webinar Series';
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
}: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [attendeeSignIn, setAttendeeSignIn] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [instantWatchEnabled, setInstantWatchEnabled] = useState(false);
  const [justInTimeEnabled, setJustInTimeEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Video states
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [showUrlSuccess, setShowUrlSuccess] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const handleAddUrl = async () => {
    if (!videoUrl || !videoTitle) {
      toast.error('Please provide both video title and URL');
      return;
    }
    setIsAddingUrl(true);
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitle,
          url: videoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add video URL');
      }

      const data = await response.json();
      if (data.video) {
        setVideos((prev) => [
          ...prev,
          {
            id: data.video.id,
            title: data.video.title,
            url: data.video.url,
          },
        ]);
        setShowUrlSuccess(true);
        setTimeout(() => {
          setShowUrlSuccess(false);
          setVideoTitle('');
          setVideoUrl('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding video URL:', error);
      toast.error('Failed to add video URL');
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleDelete = async (index: number) => {
    const video = videos[index];
    try {
      const res = await fetch('/api/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: video.id }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete video');
      }

      setVideos((prev) => prev.filter((_, i) => i !== index));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete video');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!title || !description || !date || !time || !duration) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (videos.length === 0) {
        toast.error('Please add at least one video');
        return;
      }

      // Create a valid date object by combining date and time
      const [hours, minutes] = time.split(':').map(Number);
      const dateTime = new Date(date);
      dateTime.setHours(hours, minutes, 0, 0);

      // Validate the date
      if (isNaN(dateTime.getTime())) {
        toast.error('Invalid date or time');
        return;
      }

      const webinarData: WebinarData = {
        webinarName: title,
        webinarTitle: title,
        description,
        webinarDate: dateTime.toISOString(),
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
        videoUploads: videos.map((video) => ({
          title: video.title,
          url: video.url,
          publicId: video.publicId || '',
        })),
      };

      await createWebinar(webinarData);
      toast.success('Webinar scheduled successfully');
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
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter webinar title"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter webinar description"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-white">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date ? date.toISOString().split('T')[0] : ''}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-white">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration" className="text-white">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter duration in minutes"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>
        </div>

        {/* Video Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Videos</h3>

          {/* Uploaded Videos Display */}
          {videos.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-slate-800 p-4 shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-700">
                    <div className="flex size-full items-center justify-center bg-slate-700 p-4">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {video.title} (External Link)
                      </a>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="truncate text-lg font-semibold text-white">
                      {video.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-800/50 px-4 py-2 text-sm font-medium text-red-200 transition-all duration-300 hover:bg-red-800"
                    >
                      <Trash className="size-4" />
                      <span>Delete Video</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* URL Input Section */}
          <div className="mt-6 space-y-4 rounded-xl bg-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white">Add Video URL</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="videoTitle" className="text-white">
                  Video Title
                </Label>
                <Input
                  id="videoTitle"
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label htmlFor="videoUrl" className="text-white">
                  Video URL
                </Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                />
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!videoUrl || !videoTitle || isAddingUrl}
                className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700"
              >
                {isAddingUrl ? (
                  <>
                    <ClipLoader size={16} color="#fff" />
                    <span>Adding URL...</span>
                  </>
                ) : showUrlSuccess ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>URL Added Successfully!</span>
                  </>
                ) : (
                  <>
                    <Link className="size-4" />
                    <span>Add Video URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            aria-pressed={isPaid}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPaid ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
            onClick={() => setIsPaid(!isPaid)}
            onKeyDown={(e) => handleToggleKeyDown(e, () => setIsPaid(!isPaid))}
          >
            <motion.span
              className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${isPaid ? 'translate-x-5' : 'translate-x-0'}`}
            />
            <div className="ml-14 text-white">
              <Label>Paid Webinar</Label>
            </div>
          </div>
          {isPaid && (
            <div>
              <Label htmlFor="paidAmount" className="text-white">
                Amount
              </Label>
              <Input
                id="paidAmount"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="Enter amount"
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            aria-pressed={attendeeSignIn}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${attendeeSignIn ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
            onClick={() => setAttendeeSignIn(!attendeeSignIn)}
            onKeyDown={(e) =>
              handleToggleKeyDown(e, () => setAttendeeSignIn(!attendeeSignIn))
            }
          >
            <motion.span
              className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${attendeeSignIn ? 'translate-x-5' : 'translate-x-0'}`}
            />
            <div className="ml-14 text-white">
              <Label>Require Attendee Sign In</Label>
            </div>
          </div>

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
            <div className="ml-14 text-white">
              <Label>Password Protected</Label>
            </div>
          </div>

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
            <div className="ml-14 text-white">
              <Label>Enable Instant Watch</Label>
            </div>
          </div>

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
            <div className="ml-14 text-white">
              <Label>Enable Just In Time</Label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule'}
        </Button>
      </form>
    </CustomDialog>
  );
}
