'use client';

import { useEffect, useState } from 'react';

interface Session {
  user?: {
    name?: string;
    isAdmin?: boolean;
  };
}
export default function WebinarView({ session }: { session: Session }) {
  const [countdown, setCountdown] = useState(30);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      if (countdown === 0) setIsLive(true);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Live Webinar</h1>
      <p className="mt-2 text-lg">Welcome, {session.user?.name}</p>

      {session.user?.isAdmin && (
        <p className="mt-2 text-green-400">You are an admin.</p>
      )}

      {!isLive ? (
        <div className="mt-5 rounded-lg bg-red-500 px-4 py-2 text-center">
          <h2 className="text-xl font-semibold">
            Webinar starts in: {countdown}s
          </h2>
        </div>
      ) : (
        <VideoPlayer />
      )}

      {session.user?.isAdmin && <AdminChat />}
    </div>
  );
}

function VideoPlayer() {
  return (
    <div className="mt-5 flex w-full justify-center">
      <video
        controls={false}
        autoPlay
        className="w-4/5 max-w-3xl rounded-lg border-2 border-gray-600 shadow-lg"
      >
        <source src="your-live-stream-url.mp4" type="video/mp4" />
        <track
          src="captions.mp4"
          kind="subtitles"
          srcLang="en"
          label="English"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function AdminChat() {
  return (
    <div className="mt-5 w-3/4 max-w-lg rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h2 className="text-lg font-semibold">Admin Chat</h2>
      <textarea
        className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-900 p-2"
        placeholder="Type a message..."
      ></textarea>
      <button className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-500">
        Send
      </button>
    </div>
  );
}
