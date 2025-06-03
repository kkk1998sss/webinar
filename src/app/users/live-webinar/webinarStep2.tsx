import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { ClipLoader } from 'react-spinners';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Link,
  Trash,
  Upload,
  Video,
  Video as VideoIcon,
} from 'lucide-react';

import UploadProgress from '@/components/ui/UploadProgress';
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
  const [uploadProgress, setUploadProgress] = React.useState<{
    [key: string]: number;
  }>({});
  const [uploadErrors, setUploadErrors] = React.useState<{
    [key: string]: string;
  }>({});
  const [urlTitle, setUrlTitle] = React.useState('');
  const [urlInput, setUrlInput] = React.useState('');

  // Simplified meeting state
  const [meetingTitle, setMeetingTitle] = React.useState('');
  const [meetingUrl, setMeetingUrl] = React.useState('');
  const [meetingType, setMeetingType] = React.useState<'google' | 'zoom' | ''>(
    ''
  );

  // Add new state variables for loading and success states
  const [isAddingUrl, setIsAddingUrl] = React.useState(false);
  const [isAddingMeeting, setIsAddingMeeting] = React.useState(false);
  const [showUrlSuccess, setShowUrlSuccess] = React.useState(false);
  const [showMeetingSuccess, setShowMeetingSuccess] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setTempFiles(fileList);
      setTitles(fileList.map((file) => file.name));
      setUploadProgress({});
      setUploadErrors({});
    }
  };

  const handleTitleChange = (index: number, value: string) => {
    const updatedTitles = [...titles];
    updatedTitles[index] = value;
    setTitles(updatedTitles);
  };

  const uploadFile = async (file: File, title: string, index: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setUploadProgress((prev) => ({
          ...prev,
          [index]: progress,
        }));
      }
    });

    return new Promise<VideoUploadData>((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (data.video) {
            resolve({
              title: data.video.title,
              url: data.video.url,
              publicId: data.video.publicId,
              id: data.video.id,
            });
          } else {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(xhr.responseText));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const handleAddVideos = async () => {
    setLoading(true);
    setUploadProgress({});
    setUploadErrors({});

    const uploadedVideos: VideoUploadData[] = [];

    for (let i = 0; i < tempFiles.length; i++) {
      try {
        const video = await uploadFile(tempFiles[i], titles[i], i);
        uploadedVideos.push(video);
      } catch (error) {
        console.error(`Error uploading file ${i}:`, error);
        setUploadErrors((prev) => ({
          ...prev,
          [i]: error instanceof Error ? error.message : 'Upload failed',
        }));
      }
    }

    if (uploadedVideos.length > 0) {
      setFormData((prev) => ({
        ...prev,
        videoUploads: [...(prev.videoUploads || []), ...uploadedVideos],
      }));
    }

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

  const handleAddUrl = async () => {
    if (!urlInput || !urlTitle) {
      return;
    }
    setIsAddingUrl(true);
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: urlTitle,
          url: urlInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add video URL');
      }

      const data = await response.json();
      if (data.video) {
        setFormData((prev) => ({
          ...prev,
          videoUploads: [
            ...prev.videoUploads,
            {
              id: data.video.id,
              title: data.video.title,
              url: data.video.url,
            },
          ],
        }));
        // Show success animation
        setShowUrlSuccess(true);
        setTimeout(() => {
          setShowUrlSuccess(false);
          // Reset form
          setUrlTitle('');
          setUrlInput('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding video URL:', error);
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingTitle || !meetingUrl) {
      return;
    }
    setIsAddingMeeting(true);
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meetingTitle,
          url: meetingUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add meeting URL');
      }

      const data = await response.json();
      if (data.video) {
        setFormData((prev) => ({
          ...prev,
          videoUploads: [
            ...prev.videoUploads,
            {
              id: data.video.id,
              title: data.video.title,
              url: data.video.url,
            },
          ],
        }));
        // Show success animation
        setShowMeetingSuccess(true);
        setTimeout(() => {
          setShowMeetingSuccess(false);
          // Reset form
          setMeetingTitle('');
          setMeetingUrl('');
          setMeetingType('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding meeting URL:', error);
    } finally {
      setIsAddingMeeting(false);
    }
  };

  const handlePlatformSelect = (type: 'google' | 'zoom') => {
    setMeetingType(type);
    // Open the respective platform in a new tab
    if (type === 'google') {
      window.open('https://meet.google.com/', '_blank');
    } else if (type === 'zoom') {
      window.open('https://zoom.us/start', '_blank');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Upload Your Webinar Content
        </h2>
        <p className="mt-2 text-gray-600">
          Add videos to make your webinar engaging and informative
        </p>
      </motion.div>

      {/* Uploaded Videos Display */}
      {formData.videoUploads?.length > 0 && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Uploaded Videos
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formData.videoUploads.map((video, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                  {video.publicId ? (
                    <video
                      controls
                      className="size-full object-cover"
                      poster="/video-placeholder.png"
                    >
                      <source src={video.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gray-50 p-4">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        {video.title} (External Link)
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="truncate text-lg font-semibold text-gray-800">
                    {video.title}
                  </h3>
                  <motion.button
                    onClick={() => handleDelete(index)}
                    disabled={deletingIndex === index}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      deletingIndex === index
                        ? 'bg-red-100 text-red-600'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {deletingIndex === index ? (
                      <>
                        <ClipLoader size={16} color="#DC2626" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash className="size-4" />
                        <span>Delete Video</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger asChild>
          <motion.div
            className="group relative mt-6 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/10">
                <Upload className="size-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Add Videos to Your Webinar</h3>
              <p className="mt-2 text-sm text-white/80">
                Click to upload your webinar videos
              </p>
            </div>
          </motion.div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[600px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Upload Videos
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Upload multiple videos and assign a title to each. Supported
              formats: MP4, WebM
            </Dialog.Description>

            {loading ? (
              <motion.div
                className="mt-8 flex flex-col items-center justify-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-blue-50">
                  <ClipLoader size={32} color="#3B82F6" />
                </div>
                <p className="text-center text-gray-600">
                  Uploading your videos...
                  <br />
                  <span className="text-sm text-gray-500">
                    This may take a few moments
                  </span>
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="videoUpload"
                    aria-label="Upload video files"
                    className="group relative block cursor-pointer"
                  >
                    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50/50">
                      <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                        <Upload className="size-6" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-600">
                        Click to select videos
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        or drag and drop your files here
                      </p>
                    </div>
                    <input
                      id="videoUpload"
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                  </label>
                </motion.div>

                <motion.div
                  className="mt-6 max-h-60 space-y-4 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {tempFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                          <Video className="size-5 text-blue-600" />
                        </div>
                        <div className="flex-1 truncate">
                          <input
                            type="text"
                            value={titles[index]}
                            onChange={(e) =>
                              handleTitleChange(index, e.target.value)
                            }
                            className="w-full truncate rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Enter video title"
                          />
                          <p className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <UploadProgress
                        progress={uploadProgress[index] || 0}
                        fileName={file.name}
                        fileSize={file.size}
                        status={
                          uploadErrors[index]
                            ? 'error'
                            : loading
                              ? 'uploading'
                              : 'success'
                        }
                        error={uploadErrors[index]}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-6 flex justify-end">
                  <motion.button
                    onClick={handleAddVideos}
                    disabled={tempFiles.length === 0 || loading}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <ClipLoader size={16} color="#fff" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        <span>Upload Videos</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="mt-6 space-y-6">
        {/* Live Meeting Integration Section */}
        <motion.div
          className="rounded-xl bg-white p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Add Live Meeting
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="meetingTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Meeting Title
              </label>
              <input
                id="meetingTitle"
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Enter meeting title"
              />
            </div>

            <div>
              <fieldset className="mb-2 block text-sm font-medium text-gray-700">
                <legend className="mb-2 block text-sm font-medium text-gray-700">
                  Select Platform
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => handlePlatformSelect('google')}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      meetingType === 'google'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <VideoIcon className="size-5" />
                    <span>Google Meet</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handlePlatformSelect('zoom')}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      meetingType === 'zoom'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <VideoIcon className="size-5" />
                    <span>Zoom</span>
                  </motion.button>
                </div>
              </fieldset>
            </div>

            <div>
              <label
                htmlFor="meetingUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Meeting URL
              </label>
              <input
                id="meetingUrl"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder={`Paste your ${meetingType === 'google' ? 'Google Meet' : meetingType === 'zoom' ? 'Zoom' : 'meeting'} URL here`}
              />
            </div>

            <motion.button
              onClick={handleCreateMeeting}
              disabled={
                !meetingTitle || !meetingUrl || !meetingType || isAddingMeeting
              }
              className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAddingMeeting ? (
                <>
                  <ClipLoader size={16} color="#fff" />
                  <span>Adding Meeting...</span>
                </>
              ) : showMeetingSuccess ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Meeting Added Successfully!</span>
                </>
              ) : (
                <>
                  <VideoIcon className="size-4" />
                  <span>Add Meeting</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* URL Input Section */}
        <motion.div
          className="rounded-xl bg-white p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Add Video URL
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="videoTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Video Title
              </label>
              <input
                id="videoTitle"
                type="text"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                placeholder="Enter video title"
              />
            </div>
            <div>
              <label
                htmlFor="videoUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Video URL
              </label>
              <input
                id="videoUrl"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              />
            </div>
            <motion.button
              onClick={handleAddUrl}
              disabled={!urlInput || !urlTitle || isAddingUrl}
              className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAddingUrl ? (
                <>
                  <ClipLoader size={16} color="#fff" />
                  <span>Adding URL...</span>
                </>
              ) : showUrlSuccess ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>URL Added Successfully!</span>
                </>
              ) : (
                <>
                  <Link className="size-4" />
                  <span>Add Video URL</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WebinarRegistrationPage;
