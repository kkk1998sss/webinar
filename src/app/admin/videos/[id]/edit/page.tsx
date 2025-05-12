'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type Video = {
  id: string;
  title: string;
  url: string;
  publicId: string;
  createdAt: string;
  webinarDetails?: {
    webinarName: string;
    webinarTitle: string;
  };
};

export default function EditVideo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { id } = use(params);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(`/api/videos/${id}`);
        const data = await res.json();

        if (data.success) {
          setVideo(data.video);
          setTitle(data.video.title);
        } else {
          setError('Failed to fetch video details');
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to fetch video details');
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        throw new Error('Failed to update video');
      }

      router.push('/admin/videos');
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <FaSpinner className="animate-spin text-blue-600" />
          <span className="text-gray-600">Loading video details...</span>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Error</h2>
          <p className="mt-2 text-gray-500">{error || 'Video not found'}</p>
          <button
            onClick={() => router.push('/admin/videos')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Videos
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-semibold text-transparent">
        Edit Video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Video Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="videoUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Video URL
          </label>
          <div className="mt-1">
            <a
              id="videoUrl"
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {video.url}
            </a>
          </div>
        </div>

        {video.webinarDetails && (
          <div>
            <label
              htmlFor="webinarDetails"
              className="block text-sm font-medium text-gray-700"
            >
              Linked Webinar
            </label>
            <div id="webinarDetails" className="mt-1">
              <p className="font-medium">{video.webinarDetails.webinarName}</p>
              <p className="text-sm text-gray-500">
                {video.webinarDetails.webinarTitle}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
