import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface VimeoVideo {
  uri: string;
  name: string;
  description: string;
  duration: number;
  created_time: string;
  modified_time: string;
  link: string;
  player_embed_url: string;
  pictures: {
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
  privacy: {
    view: string;
  };
}

interface CourseSection {
  name: string;
  videos: VimeoVideo[];
  icon: string;
  color: string;
}

const RecordedCoursesSection: React.FC = () => {
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to categorize videos by name/content
  const categorizeVideos = useCallback(
    (videos: VimeoVideo[]): CourseSection[] => {
      const sections: CourseSection[] = [];
      const categorizedVideos: { [key: string]: VimeoVideo[] } = {};

      // Categorize videos based on their names
      videos.forEach((video) => {
        const name = video.name.toLowerCase();
        let category = 'General Courses';

        if (name.includes('meditation') || name.includes('dhyan')) {
          category = 'Meditation & Dhyan';
        } else if (name.includes('hanuman') || name.includes('bajrang')) {
          category = 'Hanuman & Bajrang';
        } else if (name.includes('kundalini') || name.includes('chakra')) {
          category = 'Kundalini & Chakras';
        } else if (name.includes('mantra') || name.includes('chanting')) {
          category = 'Mantras & Chanting';
        } else if (name.includes('yoga') || name.includes('asana')) {
          category = 'Yoga & Asanas';
        } else if (name.includes('spiritual') || name.includes('sadhana')) {
          category = 'Spiritual Sadhana';
        }

        if (!categorizedVideos[category]) {
          categorizedVideos[category] = [];
        }
        categorizedVideos[category].push(video);
      });

      // Convert to sections with appropriate styling
      Object.entries(categorizedVideos).forEach(([category, videos]) => {
        let sectionConfig = {
          name: category,
          icon: '📚',
          color: 'emerald',
        };

        switch (category) {
          case 'Meditation & Dhyan':
            sectionConfig = { name: category, icon: '🧘‍♀️', color: 'purple' };
            break;
          case 'Hanuman & Bajrang':
            sectionConfig = { name: category, icon: '🐒', color: 'orange' };
            break;
          case 'Kundalini & Chakras':
            sectionConfig = { name: category, icon: '🔥', color: 'red' };
            break;
          case 'Mantras & Chanting':
            sectionConfig = { name: category, icon: '🕉️', color: 'blue' };
            break;
          case 'Yoga & Asanas':
            sectionConfig = { name: category, icon: '🧘‍♂️', color: 'green' };
            break;
          case 'Spiritual Sadhana':
            sectionConfig = { name: category, icon: '✨', color: 'indigo' };
            break;
          default:
            sectionConfig = { name: category, icon: '📚', color: 'emerald' };
        }

        sections.push({
          name: sectionConfig.name,
          videos: videos,
          icon: sectionConfig.icon,
          color: sectionConfig.color,
        });
      });

      return sections;
    },
    []
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
    const fetchVimeoVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎬 Fetching Vimeo videos for recorded courses...');

        // Fetch videos from our Vimeo API
        const response = await fetch('/api/vimeo/public');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch videos');
        }

        console.log('🎬 Successfully fetched Vimeo videos:', data.data);

        // Categorize videos into sections
        const sections = categorizeVideos(data.data.data);

        console.log('🎬 Organized course sections:', sections);
        setCourseSections(sections);
      } catch (err) {
        console.error('❌ Error fetching Vimeo videos:', err);
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

    fetchVimeoVideos();
  }, [categorizeVideos]);

  const handleVideoAction = (video: VimeoVideo) => {
    // Extract video ID from URI
    const videoId = video.uri.replace('/videos/', '');
    router.push(`/users/playing-area/vimeo/${videoId}`);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const getThumbnail = (pictures: VimeoVideo['pictures']): string => {
    if (pictures.sizes && pictures.sizes.length > 0) {
      // Get the largest thumbnail
      const sortedSizes = pictures.sizes.sort((a, b) => b.width - a.width);
      return sortedSizes[0].link;
    }
    return '/placeholder-video.jpg';
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
      blue: {
        bg: 'bg-blue-600',
        text: 'text-blue-800',
        border: 'border-blue-100',
        badge: 'bg-blue-100',
        badgeText: 'text-blue-700',
        arrowBg: 'bg-blue-500/80',
        arrowHover: 'hover:bg-blue-600/90',
      },
      green: {
        bg: 'bg-green-600',
        text: 'text-green-800',
        border: 'border-green-100',
        badge: 'bg-green-100',
        badgeText: 'text-green-700',
        arrowBg: 'bg-green-500/80',
        arrowHover: 'hover:bg-green-600/90',
      },
      indigo: {
        bg: 'bg-indigo-600',
        text: 'text-indigo-800',
        border: 'border-indigo-100',
        badge: 'bg-indigo-100',
        badgeText: 'text-indigo-700',
        arrowBg: 'bg-indigo-500/80',
        arrowHover: 'hover:bg-indigo-600/90',
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
            Fetching Vimeo videos...
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
            No Course Videos Found
          </h3>
          <p className="text-sm text-emerald-700">
            No videos found in your Vimeo account.
          </p>
          <p className="mt-2 text-xs text-emerald-600">
            Upload some videos to your Vimeo account to get started
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
          collection from Vimeo
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
                {section.videos.length} Videos
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
                {section.videos.map((video) => (
                  <motion.div
                    key={video.uri}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-[300px] shrink-0 snap-center rounded-lg border bg-white p-4 shadow-md ${colors.border} transition-all duration-200 hover:shadow-lg`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative mb-3">
                      <Image
                        src={getThumbnail(video.pictures)}
                        alt={video.name}
                        width={300}
                        height={160}
                        className="h-40 w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all duration-300 hover:bg-black/20">
                        <div className="opacity-0 transition-opacity duration-300 hover:opacity-100">
                          <div className="flex size-12 items-center justify-center rounded-full bg-white/90">
                            <Play className="size-6 text-gray-800" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs text-white">
                        {formatDuration(video.duration)}
                      </div>
                    </div>

                    {/* Video Name */}
                    <h4 className="mb-2 line-clamp-2 font-semibold text-gray-800">
                      {video.name}
                    </h4>

                    {/* Video Details */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 size-4" />
                        <span>Created: {formatDate(video.created_time)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-2 size-4" />
                        <span>Duration: {formatDuration(video.duration)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Video className="mr-2 size-4" />
                        <span className="capitalize">{video.privacy.view}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleVideoAction(video)}
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
        <p className="mt-2 text-xs text-emerald-500">Videos powered by Vimeo</p>
      </div>
    </div>
  );
};

export default RecordedCoursesSection;
