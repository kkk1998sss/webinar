'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import { CustomDialog } from '../ui/custom-dialog';
import { Textarea } from '../ui/textarea';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Video item type
// type VideoItem = {
//   id: string;
//   title: string;
//   url: string;
//   publicId?: string;
// };

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
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [paidAmount, setPaidAmount] = useState('');
  const [attendeeSignIn, setAttendeeSignIn] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [instantWatchEnabled, setInstantWatchEnabled] = useState(false);
  const [justInTimeEnabled, setJustInTimeEnabled] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (
        !title ||
        !description ||
        !startDate ||
        !endDate ||
        !time ||
        !duration
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Video validation removed - not needed for paid webinars
      // if (videos.length === 0) {
      //   toast.error('Please add at least one video');
      //   return;
      // }

      // Validate the dates
      if (isNaN(startDate!.getTime()) || isNaN(endDate!.getTime())) {
        toast.error('Invalid date');
        return;
      }

      // Check if end date is after start date
      if (endDate! <= startDate!) {
        toast.error('End date must be after start date');
        return;
      }

      const webinarData: WebinarData = {
        webinarName: title,
        webinarTitle: title,
        description,
        webinarStartDate: startDate!.toISOString(),
        webinarEndDate: endDate!.toISOString(),
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-white">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="text-white">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(new Date(e.target.value))}
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
            <div>
              <Label htmlFor="paidAmount" className="text-white">
                Amount (₹)
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
