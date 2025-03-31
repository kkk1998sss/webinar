'use client';

import { useState } from 'react';

import WebinarSetupPage from './webinarsetup1';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Session {
  user?: {
    name?: string;
    isAdmin?: boolean;
  };
}

export default function WebinarDashboard({ session }: { session: Session }) {
  const [webinars, setWebinars] = useState<string[]>([]);

  const handleNewWebinar = (type: string) => {
    alert(`Creating a ${type}`);
    setWebinars([...webinars, type]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Webinars</h2>

          {/* Search & Dropdown */}
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

            {/* Admin-Only New Webinar Button */}
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

        {/* Webinar List */}
        {webinars.length > 0 ? (
          <div className="rounded-md bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-semibold">Your Webinars</h3>
            <ul className="space-y-2">
              {webinars.map((webinar, index) => (
                <li
                  key={index}
                  className="rounded-md border bg-gray-50 p-3 shadow-sm"
                >
                  {/* {webinar} */}
                  <WebinarSetupPage />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          // Empty State
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
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        <a href="/Terms&services" className="hover:underline">
          Terms of Service
        </a>{' '}
        |
        <a href="/Privacy" className="hover:underline">
          {' '}
          Privacy Policy
        </a>{' '}
        |
        <a href="/copyright" className="hover:underline">
          {' '}
          DMCA & Copyright Policy
        </a>
        <p className="mt-2">&copy; 2024 WebinarKit. All rights reserved.</p>
      </footer>
    </div>
  );
}
