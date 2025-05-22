'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import UploadProgress from '@/components/ui/UploadProgress';

const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export default function UploadVideo() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadProgress(0);
    }
  };

  const uploadChunk = async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number
  ): Promise<Response> => {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('title', `${title}_part${chunkIndex + 1}`);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    return fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    try {
      setIsUploading(true);
      setError(null);

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadPromises: Promise<Response>[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        uploadPromises.push(uploadChunk(chunk, i, totalChunks));

        // Update progress after each chunk starts uploading
        setUploadProgress(((i + 1) / totalChunks) * 100);
      }

      const responses = await Promise.all(uploadPromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      // Handle the results (you might want to combine the chunks or handle them separately)
      console.log('Upload results:', results);

      router.push('/admin/videos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white p-8 shadow-xl"
        >
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Upload Video
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="video-title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Video Title
              </label>
              <input
                id="video-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="video-file"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Video File
              </label>
              <input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {file && (
              <UploadProgress
                progress={uploadProgress}
                fileName={file.name}
                fileSize={file.size}
                status={isUploading ? 'uploading' : error ? 'error' : 'success'}
                error={error || undefined}
              />
            )}

            <button
              type="submit"
              disabled={isUploading || !file || !title}
              className={`w-full rounded-md px-4 py-3 font-medium text-white ${
                isUploading || !file || !title
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
