import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  fileName: string;
  fileSize: number;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadProgress({
  progress,
  fileName,
  fileSize,
  status = 'uploading',
  error,
}: UploadProgressProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      className="w-full space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
          <Upload className="size-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-700">
            {fileName}
          </p>
          <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {status === 'uploading'
            ? `${Math.round(progress)}%`
            : status === 'success'
              ? 'Complete'
              : status === 'error'
                ? 'Failed'
                : ''}
        </div>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="absolute left-0 top-0 h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </motion.div>
  );
}
