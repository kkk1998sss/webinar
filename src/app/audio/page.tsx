'use client';
import React, { useEffect, useState } from 'react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webContentLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

function getStreamingUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function getEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function getDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export default function AudioPage() {
  const [audioFiles, setAudioFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/google-drive');
        const data = await response.json();

        if (data.success && Array.isArray(data.files)) {
          setAudioFiles(data.files);
        } else {
          setError(data.error || 'Failed to load audio files');
        }
      } catch (err) {
        setError('Failed to load audio files');
        console.error('Error loading audio files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading audio files...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Error Loading Audio
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
            🎵 Bonus Audio Meditations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Listen to exclusive spiritual audio content and guided sessions
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {audioFiles.length} audio files available
          </p>
        </div>

        {audioFiles.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl text-gray-400">🎵</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No Audio Files Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please ensure your Google Drive folder contains audio files and is
              properly configured.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {audioFiles.map((audio, idx) => (
              <div
                key={audio.id}
                className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800/80"
              >
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  {audio.name}
                </h2>

                <div className="mb-4">
                  <audio
                    controls
                    className="h-12 w-full rounded-lg"
                    preload="metadata"
                    crossOrigin="anonymous"
                  >
                    <source src={getStreamingUrl(audio.id)} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      File size:{' '}
                      {audio.size
                        ? `${(parseInt(audio.size) / 1024 / 1024).toFixed(1)} MB`
                        : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href={getDownloadUrl(audio.id)}
                    download
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-medium text-white transition-all duration-300 hover:from-purple-600 hover:to-pink-600"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download
                  </a>

                  <a
                    href={getEmbedUrl(audio.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 font-medium text-white transition-all duration-300 hover:from-blue-600 hover:to-indigo-600"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open in Drive
                  </a>

                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Track {idx + 1} of {audioFiles.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
