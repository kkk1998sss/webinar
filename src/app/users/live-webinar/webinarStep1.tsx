import { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';

import InstantWatchModal from '@/components/Models/InstantWatchModal';
import JustInTimeModal from '@/components/Models/JustInTime';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import CustomSelect from '@/components/ui/CustomSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WebinarForm = () => {
  const [webinarName, setWebinarName] = useState('');
  const [webinarTitle, setWebinarTitle] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [attendeeSignIn, setAttendeeSignIn] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [webinarDate, setWebinarDate] = useState('');
  const [webinarTime, setWebinarTime] = useState('');
  const [selectedValue, setSelectedValue] = useState('Choose language');
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

  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [isInstantWatchModalOpen, setIsInstantWatchModalOpen] = useState(false);
  const [isJustInTimeModalOpen, setIsJustInTimeModalOpen] = useState(false);
  //   const [instantWatch, setInstantWatch] = useState<boolean>(true);
  //   const [justInTime, setJustInTime] = useState<boolean>(true);
  //   const [dateFormat, setDateFormat] = useState<string>(
  //     'English (United States)'
  //   );
  const [instantWatch] = useState<boolean>(true);
  const [justInTime] = useState<boolean>(true);
  const [dateFormat] = useState<string>('English (United States)');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setBrandImage(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const formData = {
      webinarName,
      webinarTitle,
      duration: { hours, minutes, seconds },
      attendeeSignIn,
      passwordProtected,
      webinarDate,
      webinarTime,
      selectedValue,
      brandImage: brandImage ? brandImage.name : null,
      scheduledDates,
    };
    console.log('Submitted Data:', formData);
  };

  return (
    <CardContent>
      <div className="space-y-6">
        <div>
          <Label htmlFor="webinar-name">Name</Label>
          <Input
            id="webinar-name"
            type="text"
            value={webinarName}
            onChange={(e) => setWebinarName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="webinar-title">Title</Label>
          <Input
            id="webinar-title"
            type="text"
            value={webinarTitle}
            onChange={(e) => setWebinarTitle(e.target.value)}
          />
        </div>

        {/* Webinar Duration */}
        <div>
          <Label>Webinar Duration</Label>
          <div className="grid grid-cols-3 gap-4">
            <Input
              id="hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              min="0"
              placeholder="Hours"
            />
            <Input
              id="minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value))}
              min="0"
              max="59"
              placeholder="Minutes"
            />
            <Input
              id="seconds"
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(parseInt(e.target.value))}
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
              value={webinarDate}
              onChange={(e) => setWebinarDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="webinar-time">Time</Label>
            <Input
              id="webinar-time"
              type="time"
              value={webinarTime}
              onChange={(e) => setWebinarTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>Attendee Sign-in</Label>
          <Switch
            checked={attendeeSignIn}
            onCheckedChange={setAttendeeSignIn}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Password Protection</Label>
          <Switch
            checked={passwordProtected}
            onCheckedChange={setPasswordProtected}
          />
        </div>

        <div>
          <Label htmlFor="brand-image">Brand Image</Label>
          <Input
            id="brand-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <span className="text-sm text-gray-500">
            {brandImage ? brandImage.name : 'No file chosen'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <Label>
              Instant Watch{' '}
              <Badge className="mr-2 rounded-full bg-blue-100 text-blue-800">
                {instantWatch ? 'Enabled' : 'Disabled'}
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
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>
              Just-in-time Sessions{' '}
              <Badge className="mr-2 rounded-full bg-blue-100 text-blue-800">
                {justInTime ? 'Enabled' : 'Disabled'}
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
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>
            Date format{' '}
            <Badge className="mr-2 rounded-full bg-blue-100 text-blue-800">
              {dateFormat}
            </Badge>
          </Label>
          <CustomSelect
            value={selectedValue}
            onChange={setSelectedValue}
            options={options}
            width="w-80"
          />
        </div>

        <div>
          <Label>Scheduled Webinar Dates</Label>
          {scheduledDates.length === 0 ? (
            <p className="text-sm text-gray-500">No dates scheduled.</p>
          ) : (
            <ul className="list-disc pl-5 text-gray-700">
              {scheduledDates.map((date, index) => (
                <li key={index}>{date}</li>
              ))}
            </ul>
          )}
          <Button
            variant="outline"
            className="mt-2"
            onClick={() =>
              setScheduledDates([...scheduledDates, new Date().toDateString()])
            }
          >
            Add Date
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="gap-3">
            <Button className=" bg-red-200 text-red-700 hover:bg-red-600 hover:text-white">
              Delete
            </Button>
            <Button className="bg-green-200 text-green-700 hover:bg-green-600 hover:text-white">
              Clone
            </Button>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-200 hover:text-blue-600"
            onClick={handleSubmit}
          >
            Save Webinar
          </Button>
        </div>
      </div>
    </CardContent>
  );
};

export default WebinarForm;
