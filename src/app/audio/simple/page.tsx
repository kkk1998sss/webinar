'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

// Manual file list - add your Google Drive file IDs here
const audioFiles = [
  {
    name: 'Brain Activation',
    // File ID: 1v5tclXKS2uMzoGZ5X-hJveLaS4JLyFsL
    url: 'https://drive.google.com/uc?export=download&id=1v5tclXKS2uMzoGZ5X-hJveLaS4JLyFsL',
    embedUrl:
      'https://drive.google.com/file/d/1v5tclXKS2uMzoGZ5X-hJveLaS4JLyFsL/preview',
  },
  {
    name: 'Conciousness Meditation',
    // File ID: 1HPM-RUaxxK1y0lRaEOFHOEyy02ekZPCf
    url: 'https://drive.google.com/uc?export=download&id=1HPM-RUaxxK1y0lRaEOFHOEyy02ekZPCf',
    embedUrl:
      'https://drive.google.com/file/d/1HPM-RUaxxK1y0lRaEOFHOEyy02ekZPCf/preview',
  },
  {
    name: 'Continous Breath Meditation',
    // File ID: 12uvSxFvKFdRf3BQgT2jilmyQCr_QiOLf
    url: 'https://drive.google.com/uc?export=download&id=12uvSxFvKFdRf3BQgT2jilmyQCr_QiOLf',
    embedUrl:
      'https://drive.google.com/file/d/12uvSxFvKFdRf3BQgT2jilmyQCr_QiOLf/preview',
  },
  {
    name: 'Dhanyawad Meditation- be grateful',
    // File ID: 1ibhgLI0nhot1SpJEh2YQOS2nXWGYkLAi
    url: 'https://drive.google.com/uc?export=download&id=1ibhgLI0nhot1SpJEh2YQOS2nXWGYkLAi',
    embedUrl:
      'https://drive.google.com/file/d/1ibhgLI0nhot1SpJEh2YQOS2nXWGYkLAi/preview',
  },
  {
    name: 'Divine Essense Breath',
    // File ID: 1Gv6iWzv4wQyQAUsfjuePdWu0obuVgRym
    url: 'https://drive.google.com/uc?export=download&id=1Gv6iWzv4wQyQAUsfjuePdWu0obuVgRym',
    embedUrl:
      'https://drive.google.com/file/d/1Gv6iWzv4wQyQAUsfjuePdWu0obuVgRym/preview',
  },
  {
    name: 'Eternal Bliss Pranayam',
    // File ID: 182-JmhWUI58vTaT5V_vdf-AO4Y_Ksp3H
    url: 'https://drive.google.com/uc?export=download&id=182-JmhWUI58vTaT5V_vdf-AO4Y_Ksp3H',
    embedUrl:
      'https://drive.google.com/file/d/182-JmhWUI58vTaT5V_vdf-AO4Y_Ksp3H/preview',
  },
  {
    name: 'Fire breath to heal the body',
    // File ID: 19Ij4ZfgVBlM4xwv-LMgF9GkDP3pYC6Kk
    url: 'https://drive.google.com/uc?export=download&id=19Ij4ZfgVBlM4xwv-LMgF9GkDP3pYC6Kk',
    embedUrl:
      'https://drive.google.com/file/d/19Ij4ZfgVBlM4xwv-LMgF9GkDP3pYC6Kk/preview',
  },
  {
    name: 'OM meditation',
    // File ID: 1ojTB_G8Ec02yBOkqgeO_YCeNNxEOBNMZ
    url: 'https://drive.google.com/uc?export=download&id=1ojTB_G8Ec02yBOkqgeO_YCeNNxEOBNMZ',
    embedUrl:
      'https://drive.google.com/file/d/1ojTB_G8Ec02yBOkqgeO_YCeNNxEOBNMZ/preview',
  },
  {
    name: 'Pran Shakti Meditation',
    // File ID: 1knrzlxyI994EPatprAP2KuAWVCgkrhlo
    url: 'https://drive.google.com/uc?export=download&id=1knrzlxyI994EPatprAP2KuAWVCgkrhlo',
    embedUrl:
      'https://drive.google.com/file/d/1knrzlxyI994EPatprAP2KuAWVCgkrhlo/preview',
  },
  {
    name: 'Soul Alignment Meditation',
    // File ID: 1nO22fnQslZdXPi9KeF3WAjO6hQFRAeAJ
    url: 'https://drive.google.com/uc?export=download&id=1nO22fnQslZdXPi9KeF3WAjO6hQFRAeAJ',
    embedUrl:
      'https://drive.google.com/file/d/1nO22fnQslZdXPi9KeF3WAjO6hQFRAeAJ/preview',
  },
];

export default function SimpleAudioPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-gray-700 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-lg dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>
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

        <div className="grid gap-6 md:grid-cols-2">
          {audioFiles.map((audio, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800/80"
            >
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                {audio.name}
              </h2>

              <div className="mb-4">
                {/* Google Drive Embed Player */}
                <iframe
                  src={audio.embedUrl}
                  width="100%"
                  height="100"
                  allow="autoplay"
                  className="rounded-lg border-0 shadow-md"
                  title={`${audio.name} - Google Drive Player`}
                />
              </div>

              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href={audio.url}
                    download
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-purple-600 hover:to-pink-600"
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
                    href={audio.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-blue-600 hover:to-indigo-600"
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
                </div>

                <span className="self-end text-sm text-gray-500 sm:self-center dark:text-gray-400">
                  Track {idx + 1} of {audioFiles.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
