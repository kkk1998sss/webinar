'use client';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { format, parseISO } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Webinar } from '@/types/user';

export default function WebinarViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  // State hooks
  const [webinars, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'resources' | 'chat'>(
    'video'
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWebinarStarted, setIsWebinarStarted] = useState(false);

  const safeTimeSplit = (timeString?: string) => {
    if (!timeString) return { hours: '00', minutes: '00' };

    // Handle numeric time formats (e.g., 1430 -> "14:30")
    const sanitized = String(timeString).padStart(4, '0');
    const hasColon = sanitized.includes(':');

    return {
      hours: hasColon ? sanitized.split(':')[0] : sanitized.slice(0, 2),
      minutes: hasColon ? sanitized.split(':')[1] : sanitized.slice(2, 4),
    };
  };
  // Effect hooks
  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const response = await fetch(`/api/webinar/${id}`);
        if (!response.ok) throw new Error('Failed to fetch webinar');
        const data = await response.json();
        setWebinar(data.webinar);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load webinar');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWebinar();
  }, [id]);

  useEffect(() => {
    const timeCheckInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeCheckInterval);
  }, []);

  useEffect(() => {
    if (!webinars) return;

    const safeTimeSplit = (timeString: string) => {
      const sanitized = String(timeString).padStart(4, '0');
      return {
        hours: sanitized.slice(0, 2),
        minutes: sanitized.slice(2, 4),
      };
    };

    const { hours, minutes } = safeTimeSplit(webinars.webinarTime);
    const webinarStartDate = parseISO(webinars.webinarDate);
    const webinarStartTime = new Date(
      webinarStartDate.getFullYear(),
      webinarStartDate.getMonth(),
      webinarStartDate.getDate(),
      parseInt(hours),
      parseInt(minutes)
    );

    const timeDifference = webinarStartTime.getTime() - currentTime.getTime();
    const isBeforeWebinar = timeDifference > 0;

    if (!isBeforeWebinar && !isWebinarStarted) {
      setIsWebinarStarted(true);
    }
  }, [currentTime, webinars, isWebinarStarted]);

  // Conditional returns
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ClipLoader size={40} color="#3B82F6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!webinars) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Webinar not found
      </div>
    );
  }

  const handleNoteSave = () => {
    // Implement note saving logic
    console.log('Notes Saved:', notes);
  };
  // Lock screen logic
  const webinarStartDate = parseISO(webinars.webinarDate);
  const { hours, minutes } = safeTimeSplit(webinars.webinarTime);
  const webinarStartTime = new Date(
    webinarStartDate.getFullYear(),
    webinarStartDate.getMonth(),
    webinarStartDate.getDate(),
    parseInt(hours),
    parseInt(minutes)
  );
  const timeDifference = webinarStartTime.getTime() - currentTime.getTime();
  console.log('isWebinarStarted', isWebinarStarted);

  if (isWebinarStarted) {
    const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesLeft = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Webinar Starts In</h2>
          <div className="font-mono text-6xl">
            {String(hoursLeft).padStart(2, '0')}:
            {String(minutesLeft).padStart(2, '0')}:
            {String(secondsLeft).padStart(2, '0')}
          </div>
          <p className="mt-4 text-lg">
            Please come back when the webinar starts
          </p>
          <Button
            onClick={() => router.push('/users/live-webinar')}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Main content return
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {webinars?.webinarName || 'Untitled Webinar'}
          </h1>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
            <div>
              <span className="font-medium">Date:</span>{' '}
              {webinars?.webinarDate
                ? format(parseISO(webinars.webinarDate), 'MMM dd, yyyy')
                : 'Date not set'}
            </div>
            <div>
              <span className="font-medium">Time:</span>{' '}
              {webinars?.webinarTime
                ? `${safeTimeSplit(webinars.webinarTime).hours}:${safeTimeSplit(webinars.webinarTime).minutes}`
                : 'Time not set'}
            </div>
            <div>
              <span className="font-medium">Duration:</span>{' '}
              {`${webinars?.durationHours || 0}h 
              ${webinars?.durationMinutes || 0}m 
              ${webinars?.durationSeconds || 0}s`}
            </div>
            <div>
              <span className="font-medium">Language:</span>{' '}
              {webinars?.selectedLanguage || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {(['video', 'resources', 'chat'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1 py-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6 lg:grid-cols-3">
          {activeTab === 'video' && (
            <>
              <div className="lg:col-span-2">
                <div className="relative aspect-video rounded-lg bg-black shadow-xl">
                  <video
                    controls
                    className="size-full rounded-lg"
                    src={webinars?.video.url || '/fallback-video.mp4'}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Notes Section */}
              <div className="lg:col-span-1">
                <div className="rounded-lg bg-white p-4 shadow">
                  <h2 className="mb-3 text-lg font-semibold">Session Notes</h2>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-48 w-full rounded border p-2"
                    placeholder="Write your notes here..."
                  />
                  <button
                    onClick={handleNoteSave}
                    className="mt-3 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Resources Section */}
          {activeTab === 'resources' && (
            <div className="lg:col-span-3">
              <div className="rounded-lg bg-white p-4 shadow">
                <h2 className="mb-4 text-xl font-semibold">Resources</h2>
                {webinars.resources?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {webinars.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center rounded border p-3 hover:bg-gray-50"
                      >
                        <span className="text-blue-600">
                          📄 {resource.name}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No resources available for this webinar
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Chat Section */}
          {activeTab === 'chat' && (
            <div className="lg:col-span-3">
              <div className="rounded-lg bg-white p-4 shadow">
                <h2 className="mb-4 text-xl font-semibold">Live Chat</h2>
                <div className="text-gray-500">
                  Live chat feature coming soon...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Webinar Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Attendees</div>
            <div className="text-2xl font-bold">
              {webinars?.webinarSettings?.attendees || 0}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Registrants</div>
            <div className="text-2xl font-bold">
              {webinars?.webinarSettings?.registrants || 0}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-2xl font-bold text-green-600">
              {webinars?.webinarSettings?.status || 'Unknown'}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Duration</div>
            <div className="text-2xl font-bold">
              {`${webinars?.durationHours || 0}h ${webinars?.durationMinutes || 0}m`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
