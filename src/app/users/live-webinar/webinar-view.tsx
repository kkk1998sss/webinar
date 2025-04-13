'use client';

import { useEffect, useState } from 'react';
import {
  compareAsc,
  compareDesc,
  differenceInSeconds,
  format,
  isFuture,
  isPast,
  isToday,
  isValid,
  parse,
  parseISO,
} from 'date-fns';
import { useRouter } from 'next/navigation';

import WebinarSetupPage from './webinarsetup1';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import WebinarTable from '@/components/WebinarTable';
import { Webinar } from '@/types/user';

interface Session {
  user?: {
    name?: string;
    isAdmin?: boolean;
  };
}

export default function WebinarDashboard({ session }: { session: Session }) {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWebinars, setOpenWebinars] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<string>('');
  const router = useRouter();
  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const res = await fetch('/api/webinar');
        const data = await res.json();
        if (data.success) {
          setWebinars(data.webinars);
        }
      } catch (error) {
        console.error('Error fetching webinars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinars();
  }, []);

  const handleNewWebinar = (type: string) => {
    alert(`Creating a ${type}`);
    setOpenWebinars((prev) => [...prev, type]);
  };

  const todaysWebinars = webinars
    .filter((w) => isToday(parseISO(w.webinarDate)))
    .sort((a, b) =>
      compareAsc(parseISO(a.webinarDate), parseISO(b.webinarDate))
    );

  const upcomingWebinars = webinars
    .filter(
      (w) =>
        isFuture(parseISO(w.webinarDate)) && !isToday(parseISO(w.webinarDate))
    )
    .sort((a, b) =>
      compareAsc(parseISO(a.webinarDate), parseISO(b.webinarDate))
    );

  const pastWebinars = webinars
    .filter(
      (w) =>
        isPast(parseISO(w.webinarDate)) && !isToday(parseISO(w.webinarDate))
    )
    .sort((a, b) =>
      compareDesc(parseISO(a.webinarDate), parseISO(b.webinarDate))
    );

  // Countdown timer logic
  const getCountdown = (webinarDate: string, webinarTime: string) => {
    const parsedDate = parseISO(webinarDate);
    const datePart = format(parsedDate, 'yyyy-MM-dd');
    const combined = `${datePart} ${webinarTime}`;
    const finalDate = parse(combined, 'yyyy-MM-dd HH:mm', new Date());

    if (!isValid(finalDate)) {
      return 'Invalid webinar date/time';
    }

    const now = new Date();
    const diffSeconds = differenceInSeconds(finalDate, now);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    const remainingSeconds = diffSeconds % 60;

    if (diffSeconds <= 0) {
      return 'Already started';
    }

    return `${diffHours}:${remainingMinutes}:${remainingSeconds}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (todaysWebinars.length > 0) {
        setCountdown(
          getCountdown(
            todaysWebinars[0].webinarDate,
            todaysWebinars[0].webinarTime
          )
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [todaysWebinars]);

  const handleJoinWebinar = (id: string) => {
    // Redirect to the webinar page or open a modal
    router.push(`/playing-area/${id}`); // assuming you're using Next.js
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Webinars</h2>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="rounded-md border px-4 py-2 text-sm shadow-sm"
            />
            <select className="rounded-md border px-4 py-2 text-sm shadow-sm">
              <option>Newest</option>
              <option>Oldest</option>
            </select>

            {session.user?.isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    New Webinar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleNewWebinar('Automated Webinar')}
                  >
                    New Automated Webinar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleNewWebinar('Webinar Series')}
                  >
                    New Webinar Series
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Conditionally show this block if openWebinars > 0 */}
        {openWebinars.length > 0 && (
          <div className="rounded-md bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-semibold">Your Webinars</h3>
            <ul className="space-y-2">
              {openWebinars.map((webinar, index) => (
                <li
                  key={index}
                  className="rounded-md border bg-gray-50 p-3 shadow-sm"
                >
                  <WebinarSetupPage />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Show this only if openWebinars is empty */}
        {openWebinars.length === 0 &&
          (!loading && webinars.length === 0 ? (
            <div className="rounded-md border bg-white py-20 text-center shadow-md">
              <p className="text-lg text-gray-700">
                {`You haven't created any awesome webinars yet 😞`}{' '}
              </p>
              <p className="mt-2 text-gray-500">
                All your webinars will appear on this screen. Try creating a new
                webinar by clicking the button below.
              </p>

              {session.user?.isAdmin && (
                <Button
                  onClick={() => handleNewWebinar('General Webinar')}
                  className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                >
                  New Webinar
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="p-6">
                {/* Calendar-style date header */}
                <div className="flex w-full">
                  {/* Left 1/3 */}
                  <div className="w-1/3">
                    <div className="mb-6 text-center">
                      <h2 className="text-3xl font-bold text-gray-800">
                        {format(new Date(), 'eeee, MMMM do yyyy')}
                      </h2>
                      <p className="text-gray-500">Webinar Schedule</p>
                    </div>
                  </div>

                  {/* Right 2/3 */}
                  <div className="w-2/3 space-y-4 px-4 text-sm">
                    {/* Today's Webinars */}
                    {todaysWebinars.length > 0 && (
                      <section>
                        <h3 className="mb-3 text-xl font-semibold text-blue-600">
                          {`Today's Webinars`}
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {todaysWebinars.map((webinar) => (
                            <div
                              key={webinar.id}
                              className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:w-1/2 md:w-1/3"
                            >
                              <h3 className="text-xl font-semibold text-gray-800">
                                {webinar.webinarTitle}
                              </h3>
                              <p className="flex justify-between gap-2">
                                <span className="font-medium">Time:</span>
                                <span className="text-blue-600">
                                  {webinar.webinarTime}
                                </span>
                              </p>
                              <p className="flex justify-between gap-2">
                                <span className="font-medium">Starts in:</span>
                                <span className="text-blue-400">
                                  {getCountdown(
                                    webinar.webinarDate,
                                    webinar.webinarTime
                                  )}
                                </span>
                                <span className="text-blue-500">
                                  {countdown}
                                </span>
                              </p>

                              {/* Join Now Button */}
                              <button
                                className="mt-4 w-full rounded bg-green-300 px-4 py-2 font-semibold text-green-800 hover:bg-green-400"
                                onClick={() => handleJoinWebinar(webinar.id)}
                              >
                                Join Now
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {/* Tables */}
                <WebinarTable
                  title="📅 Today’s Webinars"
                  webinars={todaysWebinars}
                />
                <WebinarTable
                  title="🔮 Upcoming Webinars"
                  webinars={upcomingWebinars}
                />
                <WebinarTable
                  title="🕰 Past Webinars"
                  webinars={pastWebinars}
                />
              </div>
            </div>
          ))}
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        <a href="/Terms&services" className="hover:underline">
          Terms of Service
        </a>{' '}
        |{' '}
        <a href="/Privacy" className="hover:underline">
          Privacy Policy
        </a>{' '}
        |{' '}
        <a href="/copyright" className="hover:underline">
          DMCA & Copyright Policy
        </a>
        <p className="mt-2">&copy; 2024 WebinarKit. All rights reserved.</p>
      </footer>
    </div>
  );
}
