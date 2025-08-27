import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecordedCourse {
  id: string;
  fileid?: string; // pCloud file ID for streaming
  name: string;
  type: 'video' | 'audio' | 'document';
  path: string;
  size: number;
  contentType: string;
  created: string;
  modified: string;
  publicUrl: string;
  streamUrl: string;
  parentFolder?: string;
  fullPath?: string;
  category?: number;
  source?: string;
}

interface PCloudFile {
  fileid?: string;
  id?: string;
  name: string;
  isfolder: boolean;
  contents?: PCloudFile[];
  category?: number;
  contenttype?: string;
  size?: number;
  created?: number;
  modified?: number;
}

interface PCloudFolder {
  name: string;
  isfolder: boolean;
  contents?: PCloudFile[];
}

interface CourseSection {
  name: string;
  files: RecordedCourse[];
  icon: string;
  color: string;
}

const RecordedCoursesSection: React.FC = () => {
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to check if a file is a media file
  const isMediaFile = useCallback((file: PCloudFile): boolean => {
    // Check by category (pCloud uses categories: 1=image, 2=video, 3=audio, 4=document, 5=archive)
    if (file.category === 2 || file.category === 3) {
      return true;
    }

    // Check by file extension
    const fileName = file.name.toLowerCase();
    const videoExtensions = [
      '.mp4',
      '.avi',
      '.mov',
      '.mkv',
      '.flv',
      '.webm',
      '.m4v',
    ];
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'];

    return (
      videoExtensions.some((ext) => fileName.endsWith(ext)) ||
      audioExtensions.some((ext) => fileName.endsWith(ext))
    );
  }, []);

  // Function to organize files by sections based on folder structure
  const organizeFilesBySections = useCallback(
    (rootFolder: PCloudFolder): CourseSection[] => {
      const sections: CourseSection[] = [];

      if (!rootFolder.contents || !Array.isArray(rootFolder.contents)) {
        console.log('⚠️ No contents found in root folder');
        return sections;
      }

      console.log(
        `📁 Processing root folder: ${rootFolder.name} with ${rootFolder.contents.length} items`
      );

      for (const folder of rootFolder.contents) {
        if (folder.isfolder && folder.contents) {
          console.log(
            `📁 Processing section folder: ${folder.name} with ${folder.contents.length} items`
          );

          // Transform files in this section
          const sectionFiles = folder.contents
            .filter((item: PCloudFile) => !item.isfolder && isMediaFile(item))
            .map((file: PCloudFile) => ({
              id:
                file.fileid ||
                file.id ||
                Math.random().toString(36).substr(2, 9),
              fileid: file.fileid, // Preserve the original pCloud fileid
              name: file.name,
              type: (file.category === 2
                ? 'video'
                : file.category === 3
                  ? 'audio'
                  : 'document') as 'video' | 'audio' | 'document',
              path: file.name,
              size: file.size || 0,
              contentType:
                file.contenttype ||
                (file.category === 2
                  ? 'video/mp4'
                  : file.category === 3
                    ? 'audio/mp3'
                    : 'application/octet-stream'),
              created: file.created
                ? new Date(file.created).toISOString()
                : new Date().toISOString(),
              modified: file.modified
                ? new Date(file.modified).toISOString()
                : new Date().toISOString(),
              publicUrl: `https://u.pcloud.link/publink/show?code=kZkVPW5ZSUpOo2yY1t4WHD5oG7ONf8KnmtA7&fileid=${file.fileid}`,
              streamUrl: `https://u.pcloud.link/publink/show?code=kZkVPW5ZSUpOo2yY1t4WHD5oG7ONf8KnmtA7&fileid=${file.fileid}`,
              parentFolder: folder.name,
              fullPath: `${folder.name}/${file.name}`,
              category: file.category,
              source: 'Public Link',
            }));

          // Determine section properties based on folder name
          let sectionConfig = {
            name: folder.name,
            icon: '📁',
            color: 'emerald',
          };

          if (folder.name.includes('Meditation')) {
            sectionConfig = { name: folder.name, icon: '🧘‍♀️', color: 'purple' };
          } else if (folder.name.includes('Hanuman')) {
            sectionConfig = { name: folder.name, icon: '🐒', color: 'orange' };
          } else if (folder.name.includes('Kundalini')) {
            sectionConfig = { name: folder.name, icon: '🔥', color: 'red' };
          }

          sections.push({
            name: sectionConfig.name,
            files: sectionFiles,
            icon: sectionConfig.icon,
            color: sectionConfig.color,
          });
        }
      }

      return sections;
    },
    [isMediaFile]
  );

  // Function to scroll left for a specific section
  const scrollLeft = (sectionIndex: number) => {
    const scrollContainer = document.getElementById(
      `scroll-container-${sectionIndex}`
    );
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Function to scroll right for a specific section
  const scrollRight = (sectionIndex: number) => {
    const scrollContainer = document.getElementById(
      `scroll-container-${sectionIndex}`
    );
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchRecordedCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔗 Fetching data directly from pCloud public link...');

        // Fetch directly from the pCloud public link URL
        const response = await fetch(
          'https://u.pcloud.link/publink/show?code=kZkVPW5ZSUpOo2yY1t4WHD5oG7ONf8KnmtA7'
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const htmlContent = await response.text();
        console.log(
          '🔗 Successfully fetched HTML page from pCloud public link'
        );
        console.log(
          '📄 HTML Content Length:',
          htmlContent.length,
          'characters'
        );

        // Extract the publinkData from the JavaScript in the HTML
        const publinkDataMatch = htmlContent.match(
          /var publinkData = ({[\s\S]*?});/
        );

        if (!publinkDataMatch) {
          console.error('❌ Could not find publinkData in HTML');
          setError('Could not extract data from pCloud public link');
          return;
        }

        try {
          const publinkData = JSON.parse(publinkDataMatch[1]);
          console.log(
            '🔗 Successfully parsed publinkData from HTML:',
            publinkData
          );

          if (publinkData.result !== 0) {
            console.error('❌ Public link data error:', publinkData.error);
            setError(`pCloud error: ${publinkData.error}`);
            return;
          }

          // Organize files by sections based on the folder structure
          const sections = organizeFilesBySections(publinkData.metadata);

          console.log('🎬 Organized course sections:', sections);
          setCourseSections(sections);
        } catch (parseError) {
          console.error('❌ Failed to parse publinkData JSON:', parseError);
          setError('Failed to parse data from pCloud public link');
        }
      } catch (err) {
        console.error('❌ Error fetching recorded courses:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch recorded courses'
        );
        setCourseSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordedCourses();
  }, [organizeFilesBySections]);

  const handleFileAction = (file: RecordedCourse) => {
    // For pCloud files, use the fileid from the original data
    // This ensures we can properly stream the video
    const fileId = file.fileid || file.id;
    router.push(`/users/playing-area/recorded-course/${fileId}`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const getFileIcon = (file: RecordedCourse) => {
    if (file.contentType?.startsWith('video/')) {
      return '🎬';
    } else if (file.contentType?.startsWith('audio/')) {
      return '🎵';
    } else if (file.contentType?.startsWith('application/pdf')) {
      return '📄';
    }
    return '📁';
  };

  const getFileType = (file: RecordedCourse): string => {
    if (file.contentType?.startsWith('video/')) {
      return 'Video';
    } else if (file.contentType?.startsWith('audio/')) {
      return 'Audio';
    } else if (file.contentType?.startsWith('application/pdf')) {
      return 'PDF';
    }
    return 'File';
  };

  const getColorClasses = (color: string) => {
    const colorMap: {
      [key: string]: {
        bg: string;
        text: string;
        border: string;
        badge: string;
        badgeText: string;
        arrowBg: string;
        arrowHover: string;
      };
    } = {
      purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-800',
        border: 'border-purple-100',
        badge: 'bg-purple-100',
        badgeText: 'text-purple-700',
        arrowBg: 'bg-purple-500/80',
        arrowHover: 'hover:bg-purple-600/90',
      },
      orange: {
        bg: 'bg-orange-600',
        text: 'text-orange-800',
        border: 'border-orange-100',
        badge: 'bg-orange-100',
        badgeText: 'text-orange-700',
        arrowBg: 'bg-orange-500/80',
        arrowHover: 'hover:bg-orange-600/90',
      },
      red: {
        bg: 'bg-red-600',
        text: 'text-red-800',
        border: 'border-red-100',
        badge: 'bg-red-100',
        badgeText: 'text-red-700',
        arrowBg: 'bg-red-500/80',
        arrowHover: 'hover:bg-red-600/90',
      },
      emerald: {
        bg: 'bg-emerald-600',
        text: 'text-emerald-800',
        border: 'border-emerald-100',
        badge: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        arrowBg: 'bg-emerald-500/80',
        arrowHover: 'hover:bg-emerald-600/90',
      },
    };

    return colorMap[color] || colorMap.emerald;
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 p-6 shadow-lg">
        <div className="flex h-32 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-emerald-700">
            Fetching from pCloud public link...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-2 text-2xl text-red-600">⚠️</div>
          <h3 className="mb-2 font-semibold text-red-800">
            Error Loading Courses
          </h3>
          <p className="text-sm text-red-700">{error}</p>
          <p className="mt-2 text-xs text-red-600">
            Check browser console for detailed logs
          </p>
        </div>
      </div>
    );
  }

  if (courseSections.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 p-6 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-4xl text-emerald-600">🎓</div>
          <h3 className="mb-2 font-semibold text-emerald-800">
            No Course Sections Found
          </h3>
          <p className="text-sm text-emerald-700">
            No course sections found in the public link.
          </p>
          <p className="mt-2 text-xs text-emerald-600">
            Check browser console for detailed logs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 p-6 shadow-lg">
      {/* Main Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center space-x-3">
          <div className="rounded-xl bg-emerald-600 p-3 text-white">
            <BookOpen className="size-8" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-800">
            Recorded Courses
          </h2>
        </div>
        <p className="text-lg text-emerald-600">
          Transform your spiritual journey with our comprehensive course
          collection
        </p>
      </div>

      {/* Course Sections */}
      {courseSections.map((section, sectionIndex) => {
        const colors = getColorClasses(section.color);

        return (
          <div key={sectionIndex} className="mb-8">
            <div className="mb-6 flex items-center space-x-3">
              <div className={`${colors.bg} rounded-lg p-2 text-white`}>
                <span className="text-2xl">{section.icon}</span>
              </div>
              <h3 className={`text-xl font-bold ${colors.text}`}>
                {section.name}
              </h3>
              <div
                className={`${colors.badge} ${colors.badgeText} rounded-full px-3 py-1 text-xs font-medium`}
              >
                {section.files.length} Files
              </div>
            </div>

            <div className="relative">
              {/* Left Arrow Indicator */}
              <button
                onClick={() => scrollLeft(sectionIndex)}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${colors.arrowBg} text-white shadow-lg backdrop-blur-sm ${colors.arrowHover}`}
                >
                  <ChevronLeft className="size-5 animate-pulse" />
                </div>
              </button>

              {/* Right Arrow Indicator */}
              <button
                onClick={() => scrollRight(sectionIndex)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${colors.arrowBg} text-white shadow-lg backdrop-blur-sm ${colors.arrowHover}`}
                >
                  <ChevronRight className="size-5 animate-pulse" />
                </div>
              </button>

              <div
                id={`scroll-container-${sectionIndex}`}
                className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-16 pb-4"
              >
                {section.files.map((file) => (
                  <motion.div
                    key={file.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-[300px] shrink-0 snap-center rounded-lg border bg-white p-4 shadow-md ${colors.border} transition-all duration-200 hover:shadow-lg`}
                  >
                    {/* File Icon and Type */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-2xl">{getFileIcon(file)}</div>
                      <div
                        className={`${colors.badge} ${colors.badgeText} rounded-full px-2 py-1 text-xs font-medium`}
                      >
                        {getFileType(file)}
                      </div>
                    </div>

                    {/* File Name */}
                    <h4 className="mb-2 line-clamp-2 font-semibold text-gray-800">
                      {file.name}
                    </h4>

                    {/* File Details */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 size-4" />
                        <span>Created: {formatDate(file.created)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="mr-2 size-4" />
                        <span>Size: {formatFileSize(file.size)}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleFileAction(file)}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white transition-all duration-200 hover:from-emerald-600 hover:to-teal-600"
                    >
                      <Play className="size-4" />
                      <span>Start Learning</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-emerald-600">
          🎓 Access your spiritual learning materials anytime, anywhere
        </p>
        <p className="mt-2 text-xs text-emerald-500">
          Data fetched directly from pCloud public link
        </p>
      </div>
    </div>
  );
};

export default RecordedCoursesSection;
