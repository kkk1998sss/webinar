'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Webinar {
  id: string;
  webinarTitle: string;
  webinarTakenBy: string;
  webinarOutcome: string;
  videoUrl: string;
  resources: { name: string; url: string }[];
}

export default function WebinarViewPage() {
  const params = useParams();
  const id = params?.id as string;

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'resources' | 'chat'>(
    'video'
  );

  useEffect(() => {
    if (id) {
      const fetchWebinar = async () => {
        const data: Webinar = {
          id: id as string,
          webinarTitle: 'Advanced React Patterns',
          webinarTakenBy: 'John Doe',
          webinarOutcome:
            'Understand render props, HOCs, and custom hooks in React.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          resources: [
            { name: 'React Patterns PDF', url: '/files/react-patterns.pdf' },
            { name: 'Slide Deck', url: '/files/slides.pdf' },
          ],
        };
        setWebinar(data);
      };

      fetchWebinar();
    }
  }, [id]);

  const handleNoteSave = () => {
    console.log('Notes Saved:', notes);
  };

  if (!webinar) return <p className="p-8 text-gray-600">Loading webinar...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800">
          {webinar.webinarTitle}
        </h1>
        <p className="text-sm text-gray-600">
          Taken by:{' '}
          <span className="font-medium">{webinar.webinarTakenBy}</span>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Outcome: <span>{webinar.webinarOutcome}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="mx-auto mb-4 flex max-w-5xl gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'video'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Video
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'resources'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'chat'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Live Chat / Q&A
        </button>
      </div>

      {/* Tab Content */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {activeTab === 'video' && (
          <>
            {/* Video */}
            <div className="rounded-lg bg-white p-4 shadow">
              <video controls className="w-full rounded">
                <source src={webinar.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Notes */}
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-2 text-xl font-semibold text-gray-700">
                Take Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-60 w-full resize-none rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Write your notes here..."
              />
              <button
                onClick={handleNoteSave}
                className="mt-3 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Save Notes
              </button>
            </div>
          </>
        )}

        {activeTab === 'resources' && (
          <div className="col-span-2 rounded-lg bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Resources
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              {webinar.resources.map((res, i) => (
                <li key={i}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {res.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="col-span-2 rounded-lg bg-white p-4 shadow">
            <h2 className="mb-2 text-xl font-semibold text-gray-700">
              Live Chat / Q&A
            </h2>
            <div className="italic text-gray-500">
              This feature is coming soon...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
