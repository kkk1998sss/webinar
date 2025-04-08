'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type WebinarData = {
  id: string;
  webinarName: string;
  webinarTitle: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  webinarDate: string;
  attendeeSignIn: boolean;
  passwordProtected: boolean;
  webinarTime?: string;
  selectedLanguage?: string;
};

export default function EditWebinar() {
  const { id } = useParams();
  const [webinar, setWebinar] = useState<WebinarData | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/webinar/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setWebinar(data.webinar);
          }
        });
    }
  }, [id]);

  if (!webinar) {
    return <div className="p-6">Loading webinar data...</div>;
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">Edit Webinar</h1>
      <form className="space-y-4">
        <input
          defaultValue={webinar.webinarName}
          className="w-full rounded border p-2"
          placeholder="Webinar Name"
        />
        <input
          defaultValue={webinar.webinarTitle}
          className="w-full rounded border p-2"
          placeholder="Webinar Title"
        />
        <input
          type="date"
          defaultValue={
            new Date(webinar.webinarDate).toISOString().split('T')[0]
          }
          className="w-full rounded border p-2"
        />
        <input
          type="time"
          defaultValue={webinar.webinarTime || ''}
          className="w-full rounded border p-2"
        />
        <div className="flex space-x-2">
          <input
            type="number"
            defaultValue={webinar.durationHours}
            className="w-full rounded border p-2"
            placeholder="Hours"
          />
          <input
            type="number"
            defaultValue={webinar.durationMinutes}
            className="w-full rounded border p-2"
            placeholder="Minutes"
          />
          <input
            type="number"
            defaultValue={webinar.durationSeconds}
            className="w-full rounded border p-2"
            placeholder="Seconds"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="attendeeSignIn">Attendee Sign-In:</label>
          <input
            id="attendeeSignIn"
            type="checkbox"
            defaultChecked={webinar.attendeeSignIn}
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="passwordProtected">Password Protected:</label>
          <input
            id="passwordProtected"
            type="checkbox"
            defaultChecked={webinar.passwordProtected}
          />
        </div>

        <input
          defaultValue={webinar.selectedLanguage || ''}
          className="w-full rounded border p-2"
          placeholder="Selected Language"
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Update
        </button>
      </form>
    </div>
  );
}
