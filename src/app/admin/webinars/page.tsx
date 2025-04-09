'use client';

import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { PlusIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import * as Separator from '@radix-ui/react-separator';
import Link from 'next/link';

type ScheduledDate = {
  date: string;
  time: string;
  period: string;
  timeZone: string;
};

type Webinar = {
  id: string;
  webinarName: string;
  webinarTitle: string;
  webinarDate: string;
  selectedLanguage?: string;
  scheduledDates?: ScheduledDate[];
  createdAt: string;
};

export default function WebinarList() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWebinars() {
      try {
        const res = await fetch('/api/webinar');
        const data = await res.json();

        if (data.success && Array.isArray(data.webinars)) {
          setWebinars(data.webinars);
        } else {
          console.error('Unexpected API response', data);
        }
      } catch (err) {
        console.error('Failed to fetch webinars', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWebinars();
  }, []);
  const deleteUser = async (id: string) => {
    await fetch(`/api/webinar/${id}`, { method: 'DELETE' });
    setWebinars(webinars.filter((u) => u.id !== id));
  };
  return (
    <div className="space-y-4 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">📅 Webinars</h1>
        <Link
          href="/users/live-webinar"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          <PlusIcon />
          Create
        </Link>
      </div>
      <Separator.Root className="h-px w-full bg-gray-200" />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-md border bg-white text-sm shadow-md">
            <thead>
              <tr className="bg-gray-100 text-xs uppercase text-gray-700">
                <th className="p-3 text-left">S.No</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Webinar Date</th>
                <th className="p-3 text-left">Language</th>
                <th className="p-3 text-left">Schedule(s)</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webinars.map((webinar, index) => (
                <tr
                  key={webinar.id}
                  className="border-t transition hover:bg-gray-50"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{webinar.webinarTitle}</td>
                  <td className="p-3">{webinar.webinarName}</td>
                  <td className="p-3">
                    {new Date(webinar.webinarDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">{webinar.selectedLanguage || '—'}</td>

                  <td className="whitespace-pre-wrap p-3">
                    {Array.isArray(webinar.scheduledDates)
                      ? webinar.scheduledDates
                          .map(
                            (s: ScheduledDate) =>
                              `${s.date} ${s.time} ${s.period} (${s.timeZone})`
                          )
                          .join('\n')
                      : '—'}
                  </td>
                  <td className="flex items-center gap-4 p-3">
                    <Link
                      href={`/admin/webinars/${webinar.id}/edit`}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <FaEdit />
                      {/* <Pencil1Icon /> */}
                      {/* Edit */}
                    </Link>

                    {/* Delete Confirmation Popover */}
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button className="flex items-center gap-1 text-red-600 hover:text-red-700">
                          <FaTrash />
                          {/* <TrashIcon /> */}
                          {/* Delete */}
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="top"
                          align="center"
                          className="z-50 w-64 rounded border bg-white p-4 text-sm shadow-lg"
                        >
                          <p className="mb-3 text-gray-800">
                            Are you sure you want to delete this webinar?
                          </p>
                          <div className="flex justify-end gap-2">
                            <Popover.Close asChild>
                              <button className="text-gray-500 hover:underline">
                                Cancel
                              </button>
                            </Popover.Close>
                            <button
                              className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                              onClick={() => deleteUser(webinar.id)}
                            >
                              Confirm
                            </button>
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </td>
                </tr>
              ))}
              {webinars.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
