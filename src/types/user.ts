import { ReactNode } from 'react';

export type TUser = {
  id: string;
  email: string;
  name: string;
  image: string;
  isActive?: boolean;
  stripeCustomerId?: string | null;
  phoneNumber?: string | null;
};

// types/webinar.ts

export type Duration = {
  hours: number;
  minutes: number;
  seconds: number;
};

export type ScheduledDate = {
  date: string;
  time: string;
  period: string;
  timeZone: string;
};

export type NotificationState = {
  confirmation: boolean;
  oneDayReminder: boolean;
  thirtyMinuteReminder: boolean;
};
export type VideoUploadData = {
  id: string;
  // file: File;
  title: string;
  url?: string;
  publicId?: string;
};
// types/user.ts
export type WebinarFormData = {
  webinarId: string;
  webinarName: string;
  webinarTitle: string;
  duration: { hours: number; minutes: number; seconds: number };
  attendeeSignIn: boolean;
  passwordProtected: boolean;
  webinarDate: string;
  webinarTime: string;
  selectedValue: string;
  brandImage: string;
  instantWatch: boolean;
  instantWatchSession: string;
  justInTime: boolean;
  justInTimeSession: string;
  scheduledDates: ScheduledDate[];
  emailNotifications: NotificationState;
  textNotifications: NotificationState;
  integration: string;
  webinarSharing: {
    enabled: boolean;
    name: string;
    url: string;
  };
  videoUploads: VideoUploadData[];
};

export interface Webinar {
  resources: Resource[];
  id: string;
  webinarName: string;
  webinarTitle: string;
  createdAt: string;
  webinarDate: string;
  selectedLanguage: string;
  webinarTime: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  brandImage: string;
  instantWatchEnabled: boolean;
  instantWatchSession: string;
  justInTimeEnabled: boolean;
  justInTimeSession: string;
  passwordProtected: boolean;
  isPaid: boolean;
  paidAmount: number | null;
  discountPercentage: number | null;
  discountAmount: number | null;
  description?: string;
  scheduledDates: {
    date: string;
    time: string;
    period: string;
    timeZone: string;
  }[];
  webinarSettings: {
    id: string;
    name: string;
    attendees: number;
    registrants: number;
    status: string;
    integration: string;
    emailNotifications: {
      confirmation: boolean;
      oneDayReminder: boolean;
      thirtyMinuteReminder: boolean;
    };
    textNotifications: {
      confirmation: boolean;
      oneDayReminder: boolean;
      thirtyMinuteReminder: boolean;
    };
    sharingEnabled: boolean;
    sharingName: string;
    sharingUrl: string;
  };
  video: {
    id: string;
    // file: File;
    title: string;
    url?: string;
    publicId?: string;
  };
  // Custom renderable fields
  title?: ReactNode;
  attendees?: ReactNode;
  status?: ReactNode;
  webinarPageUrl?: string; // optional if needed for dynamic redirect
}

export type Resource = {
  name: string;
  url: string;
  type?: 'pdf' | 'doc' | 'ppt' | 'image'; // Optional type specifier
};
