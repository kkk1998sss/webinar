export type TUser = {
  id: string;
  email: string;
  name: string;
  image: string;
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
};
