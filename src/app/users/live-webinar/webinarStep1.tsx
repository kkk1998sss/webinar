import React from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Trash } from 'lucide-react';

import AddDateModal from '@/components/Models/AddDateModal';
import InstantWatchModal from '@/components/Models/InstantWatchModal';
import JustInTimeModal from '@/components/Models/JustInTime';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import CustomSelect from '@/components/ui/CustomSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScheduledDate, WebinarFormData } from '@/types/user';

type WebinarFormProps = {
  formData: WebinarFormData;
  setFormData: React.Dispatch<React.SetStateAction<WebinarFormData>>;
};
const WebinarForm = ({ formData, setFormData }: WebinarFormProps) => {
  const [isDateModalOpen, setIsDateModalOpen] = React.useState(false);
  const [isInstantWatchModalOpen, setIsInstantWatchModalOpen] =
    React.useState(false);
  const [isJustInTimeModalOpen, setIsJustInTimeModalOpen] =
    React.useState(false);

  const options = [
    'English',
    'Spanish',
    'Mandarin Chinese',
    'Hindi',
    'Arabic',
    'French',
    'Bengali',
    'Russian',
    'Portuguese',
    'Urdu',
    'Indonesian',
    'German',
    'Japanese',
    'Swahili',
    'Marathi',
    'Telugu',
    'Turkish',
    'Korean',
    'Tamil',
    'Vietnamese',
  ];

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files;
  //   if (files && files.length > 0) {
  //     const file = files[0];
  //     setFormData(
  //       (prev: WebinarFormData): WebinarFormData => ({
  //         ...prev,
  //         brandImage: file.name,
  //       })
  //     );
  //   }
  // };

  const handleDeleteSchedule = (index: number) => {
    const updated = formData.scheduledDates.filter((_, i) => i !== index);
    setFormData(
      (prev: WebinarFormData): WebinarFormData => ({
        ...prev,
        scheduledDates: updated,
      })
    );
  };

  return (
    <CardContent>
      <div className="space-y-6">
        <div>
          <Label htmlFor="webinar-name">Name</Label>
          <Input
            id="webinar-name"
            type="text"
            value={formData.webinarName || ''}
            onChange={(e) =>
              setFormData((prev: WebinarFormData) => ({
                ...prev,
                webinarName: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label htmlFor="webinar-title">Title</Label>
          <Input
            id="webinar-title"
            type="text"
            value={formData.webinarTitle || ''}
            onChange={(e) =>
              setFormData((prev: WebinarFormData) => ({
                ...prev,
                webinarTitle: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label>Webinar Duration</Label>
          <div className="grid grid-cols-3 gap-4">
            <Input
              id="hours"
              type="number"
              value={formData.duration?.hours || 0}
              onChange={(e) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  duration: {
                    ...prev.duration,
                    hours: parseInt(e.target.value) || 0,
                  },
                }))
              }
              min="0"
              placeholder="Hours"
            />
            <Input
              id="minutes"
              type="number"
              value={formData.duration?.minutes || 0}
              onChange={(e) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  duration: {
                    ...prev.duration,
                    minutes: parseInt(e.target.value) || 0,
                  },
                }))
              }
              min="0"
              max="59"
              placeholder="Minutes"
            />
            <Input
              id="seconds"
              type="number"
              value={formData.duration?.seconds || 0}
              onChange={(e) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  duration: {
                    ...prev.duration,
                    seconds: parseInt(e.target.value) || 0,
                  },
                }))
              }
              min="0"
              max="59"
              placeholder="Seconds"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="webinar-date">Date</Label>
            <Input
              id="webinar-date"
              type="date"
              value={formData.webinarDate || ''}
              onChange={(e) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  webinarDate: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="webinar-time">Time</Label>
            <Input
              id="webinar-time"
              type="time"
              value={formData.webinarTime || ''}
              onChange={(e) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  webinarTime: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between rounded-lg bg-blue-100 p-4">
            <Label className="font-medium text-gray-700">
              Attendee Sign-in
            </Label>
            <div className="flex items-center gap-3">
              <Badge
                className={`rounded-full px-3 py-1 ${formData.attendeeSignIn ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
              >
                {formData.attendeeSignIn ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={formData.attendeeSignIn}
                onCheckedChange={(checked) => {
                  //  setAttendeeSignIn(checked);
                  setFormData((prev: WebinarFormData) => ({
                    ...prev,
                    attendeeSignIn: checked,
                  }));
                }}
                className="relative h-6 w-12 rounded-full data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-blue-100 p-4">
            <Label className="font-medium text-gray-700">
              Password Protection
            </Label>
            <div className="flex items-center gap-3">
              <Badge
                className={`rounded-full px-3 py-1 ${formData.passwordProtected ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
              >
                {formData.passwordProtected ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={formData.passwordProtected}
                onCheckedChange={(checked) => {
                  // setPasswordProtected(checked);
                  setFormData((prev: WebinarFormData) => ({
                    ...prev,
                    passwordProtected: checked,
                  }));
                }}
                className="relative h-6 w-12 rounded-full data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="brand-image">Brand Image</Label>
          {/* <Input
            id="brand-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          /> */}
          <span className="text-sm text-gray-500">
            {formData.brandImage || 'No file chosen'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <Label>
              Instant Watch{' '}
              <Badge className="mr-2 rounded-full bg-blue-100 text-blue-800">
                {formData.instantWatch ? 'Enabled' : 'Disabled'}
              </Badge>
            </Label>
            <Button
              onClick={() => setIsInstantWatchModalOpen(true)}
              className="bg-yellow-200 text-yellow-700 hover:bg-yellow-600 hover:text-white"
            >
              Edit
            </Button>
            <InstantWatchModal
              open={isInstantWatchModalOpen}
              onClose={() => setIsInstantWatchModalOpen(false)}
              onSave={(data) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  instantWatch: data.instantWatchEnabled,
                  instantWatchSession: data.selectedSession,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>
              Just-in-time Sessions{' '}
              <Badge className="mr-2 rounded-full bg-blue-100 text-blue-800">
                {formData.justInTime ? 'Enabled' : 'Disabled'}
              </Badge>
            </Label>
            <Button
              onClick={() => setIsJustInTimeModalOpen(true)}
              className="bg-yellow-200 text-yellow-700 hover:bg-yellow-600 hover:text-white"
            >
              Edit
            </Button>
            <JustInTimeModal
              open={isJustInTimeModalOpen}
              onClose={() => setIsJustInTimeModalOpen(false)}
              onSave={(data) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  justInTime: data.justInTimeEnabled,
                  justInTimeSession: data.selectedSession,
                }))
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>Date format</Label>
          <CustomSelect
            value={formData.selectedValue || 'Choose language'}
            onChange={(value) =>
              setFormData((prev: WebinarFormData) => ({
                ...prev,
                selectedValue: value,
              }))
            }
            options={options}
            width="w-80"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Scheduled Webinar Dates</Label>
          <Button
            onClick={() => setIsDateModalOpen(true)}
            className="bg-yellow-200 text-yellow-700 hover:bg-yellow-600 hover:text-white"
          >
            Add Date
          </Button>
          <AddDateModal
            open={isDateModalOpen}
            onClose={() => setIsDateModalOpen(false)}
            onSave={(newDate: ScheduledDate) => {
              const updated = [...(formData.scheduledDates || []), newDate];
              setFormData((prev: WebinarFormData) => ({
                ...prev,
                scheduledDates: updated,
              }));
            }}
          />
        </div>

        <div>
          {formData.scheduledDates?.length > 0 ? (
            <div className="w-full rounded-lg bg-blue-100 p-4 shadow-sm">
              <ul className="space-y-2">
                {formData.scheduledDates.map(
                  (schedule: ScheduledDate, index: number) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm"
                    >
                      <span className="text-md font-medium text-gray-700">
                        {schedule.date} - {schedule.time} {schedule.period} (
                        {schedule.timeZone})
                      </span>
                      <button
                        onClick={() => handleDeleteSchedule(index)}
                        className="text-red-600 transition duration-200 hover:text-red-800"
                      >
                        <Trash size={18} />
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : (
            <p className="w-full rounded-lg bg-blue-100 p-4 text-center text-gray-600 shadow-sm">
              No dates scheduled.
            </p>
          )}
        </div>
      </div>
    </CardContent>
  );
};

export default WebinarForm;
