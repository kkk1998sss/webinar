import React from 'react';
import { ClipLoader } from 'react-spinners';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Webinar } from '@/types/user';

interface WebinarTableProps {
  title: string;
  webinars: Webinar[];
  loading: boolean;
}

const WebinarTable: React.FC<WebinarTableProps> = ({
  title,
  webinars,
  loading,
}) => {
  const router = useRouter();

  return (
    <section className="mb-8 w-full">
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-300 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Title</th>
              <th className="p-3">Name</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Language</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Created At</th>
              <th className="p-3">Attendees</th>
              <th className="p-3">Registrants</th>
              <th className="p-3">Status</th>
              {/* <th className="p-3">Instant Watch</th>
              <th className="p-3">Just-In-Time</th>
              <th className="p-3">Password Protected</th>
              <th className="p-3">Sharing Enabled</th> */}
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? ( // Add loading state
              <tr>
                <td className="p-3 text-center" colSpan={15}>
                  <div className="flex items-center justify-center gap-2">
                    <ClipLoader size={18} color="#000" />
                    Loading webinars...
                  </div>
                </td>
              </tr>
            ) : webinars.length === 0 ? (
              <tr>
                <td className="p-3 italic text-gray-500" colSpan={15}>
                  No webinars found.
                </td>
              </tr>
            ) : (
              webinars.map((webinar, index) => (
                <tr key={webinar.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{webinar.webinarTitle}</td>
                  <td className="p-3">{webinar.webinarName}</td>
                  <td className="p-3">
                    {format(parseISO(webinar.webinarDate), 'yyyy-MM-dd')}
                  </td>
                  <td className="p-3">{webinar.webinarTime}</td>
                  <td className="p-3">{webinar.selectedLanguage}</td>
                  <td className="p-3">
                    {webinar.durationHours}h {webinar.durationMinutes}m{' '}
                    {webinar.durationSeconds}s
                  </td>
                  <td className="p-3">
                    {format(parseISO(webinar.createdAt), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="p-3">{webinar.webinarSettings.attendees}</td>
                  <td className="p-3">{webinar.webinarSettings.registrants}</td>
                  <td className="p-3">{webinar.webinarSettings.status}</td>
                  {/* <td className="p-3">
                    {webinar.instantWatchEnabled ? 'Yes' : 'No'}
                  </td>
                  <td className="p-3">
                    {webinar.justInTimeEnabled ? 'Yes' : 'No'}
                  </td>
                  <td className="p-3">
                    {webinar.passwordProtected ? 'Yes' : 'No'}
                  </td>
                  <td className="p-3">
                    {webinar.webinarSettings.sharingEnabled ? 'Yes' : 'No'}
                  </td> */}
                  <td>
                    <Button
                      onClick={() => router.push(`/webinar/${webinar.id}`)}
                      className="m-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Attend Webinar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default WebinarTable;
