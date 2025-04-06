'use client';

import { useEffect, useState } from 'react';
import { MoreVertical } from 'lucide-react';

import WebinarSetupPage from './webinarsetup1';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Webinar {
  id: string;
  webinarName: string;
  webinarTitle: string;
  createdAt: string;
  webinarSettings: {
    registrants: number;
    attendees: number;
    status: string;
  };
}

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
                {`You haven't created any awesome webinars yet 😞`}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {webinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="relative rounded-lg bg-white p-4 shadow-md"
                >
                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit webinar</DropdownMenuItem>
                        <DropdownMenuItem>Get links</DropdownMenuItem>
                        <DropdownMenuItem>View analytics</DropdownMenuItem>
                        <DropdownMenuItem>View chat history</DropdownMenuItem>
                        <DropdownMenuItem>Edit tags</DropdownMenuItem>
                        <DropdownMenuItem>Clone webinar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete webinar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="text-xl font-semibold">
                    {webinar.webinarTitle}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {webinar.webinarSettings?.registrants || 0} registrants,{' '}
                    {webinar.webinarSettings?.attendees || 0} attendees
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      Automated
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {webinar.webinarSettings?.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))}
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
