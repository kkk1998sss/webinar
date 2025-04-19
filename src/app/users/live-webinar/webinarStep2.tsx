import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { ClipLoader } from 'react-spinners';
import * as Dialog from '@radix-ui/react-dialog';

import { VideoUploadData, WebinarFormData } from '@/types/user';

interface VideoUploadDataProps {
  formData: WebinarFormData;
  setFormData: Dispatch<SetStateAction<WebinarFormData>>;
}

const WebinarRegistrationPage = ({
  formData,
  setFormData,
}: VideoUploadDataProps) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tempFiles, setTempFiles] = React.useState<File[]>([]);
  const [titles, setTitles] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [deletingIndex, setDeletingIndex] = React.useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setTempFiles(fileList);
      setTitles(fileList.map((file) => file.name));
    }
  };

  const handleTitleChange = (index: number, value: string) => {
    const updatedTitles = [...titles];
    updatedTitles[index] = value;
    setTitles(updatedTitles);
  };

  const handleAddVideos = async () => {
    setLoading(true);

    const uploadedVideos: VideoUploadData[] = [];

    for (let i = 0; i < tempFiles.length; i++) {
      const formData = new FormData();
      formData.append('file', tempFiles[i]);
      formData.append('title', titles[i]);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('data', data);
      if (res.ok && data.video) {
        uploadedVideos.push({
          title: data.video.title,
          url: data.video.url,
          publicId: data.video.publicId,
          id: data.video.id,
        });
      }
    }

    setFormData((prev) => ({
      ...prev,
      videoUploads: [...(prev.videoUploads || []), ...uploadedVideos],
    }));

    setLoading(false);
    setDialogOpen(false);
    setTempFiles([]);
    setTitles([]);
  };

  const handleDelete = async (index: number) => {
    const video = formData.videoUploads[index];
    setDeletingIndex(index);

    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: video.publicId }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete video');
      }

      const updatedVideos = formData.videoUploads.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        videoUploads: updatedVideos,
      }));
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-semibold">Upload page</h2>
        <p className="text-gray-600">Upload your video page on webinarKit</p>
      </div>

      {/* Uploaded Videos Display */}
      {formData.videoUploads?.length > 0 && (
        <div className="mt-6 flex space-x-6 overflow-x-auto pb-4">
          {formData.videoUploads.map((video, index) => (
            <div
              key={index}
              className="w-[320px] min-w-[300px] shrink-0 rounded-lg bg-blue-100 p-4 shadow-md"
            >
              <h3 className="text-md truncate font-semibold text-blue-700">
                {video.title}
              </h3>
              <video controls className="mt-2 rounded-md" width="100%">
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button
                onClick={() => handleDelete(index)}
                disabled={deletingIndex === index}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md px-4 py-1 text-red-800 transition ${
                  deletingIndex === index
                    ? 'bg-red-400'
                    : 'bg-red-300 hover:bg-red-400'
                }`}
              >
                {deletingIndex === index ? (
                  <>
                    <ClipLoader size={18} color="#fff" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger asChild>
          <div className="max-w-8xl mt-6 w-full cursor-pointer rounded-lg bg-blue-600 p-6 text-center text-white shadow-lg transition hover:opacity-90">
            <h3 className="text-xl font-semibold">
              Add video on this page for webinarKit
            </h3>
            <p className="mt-1 text-sm">Click to open video uploader</p>
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[600px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-bold">
              Upload Videos
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Upload multiple videos and assign a title to each.
            </Dialog.Description>

            {loading ? (
              <div className="mt-6 flex justify-center">
                Uploading videos, please wait...
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <label
                    htmlFor="videoUpload"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Select Videos
                  </label>
                  <input
                    id="videoUpload"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                  />
                </div>

                {tempFiles.length > 0 && (
                  <div className="mt-4 max-h-60 space-y-4 overflow-y-auto">
                    {tempFiles.map((file, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">
                          Title for:{' '}
                          <span className="font-semibold">{file.name}</span>
                        </label>
                        <input
                          type="text"
                          value={titles[index] || ''}
                          onChange={(e) =>
                            handleTitleChange(index, e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  className="rounded-md bg-gray-300 px-4 py-2"
                  onClick={() => {
                    setTempFiles([]);
                    setTitles([]);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleAddVideos}
                disabled={tempFiles.length === 0 || loading}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading && <ClipLoader size={18} color="#fff" />}
                {loading ? 'Uploading...' : 'Add Videos'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Thank You Section */}
      <div className="mt-10 text-center">
        <h2 className="text-3xl font-semibold">Thank you page</h2>
        <p className="text-gray-600">Build your thank you page on WebinarKit</p>
      </div>

      <div className="max-w-8xl mt-6 w-full cursor-pointer rounded-lg bg-green-500 p-6 text-center text-white shadow-lg transition hover:opacity-90">
        <h3 className="text-xl font-semibold">
          Build and host your thank you page on WebinarKit
        </h3>
        <p className="mt-1 text-sm">Click to open page builder</p>
      </div>
    </div>
  );
};

export default WebinarRegistrationPage;
