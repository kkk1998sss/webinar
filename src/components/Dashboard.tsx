'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Calendar, Music, Play, Plus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import FourDayPlan from './FourDayPlan/FourDayPlan';

import WebinarView from '@/app/users/live-webinar/webinar-view';

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'video' | 'meditation' | 'ebook' | 'live';
}

type ViewType = 'dashboard' | 'fourDay' | 'webinar';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [premiumContentItems, setPremiumContentItems] = useState<ContentItem[]>(
    [
      {
        id: '6',
        title: 'Live Sunday Sessions',
        description: 'Join our weekly live events',
        type: 'live',
      },
      {
        id: '4',
        title: 'Daily Meditations',
        description: 'Guided meditation sessions',
        type: 'meditation',
      },
      {
        id: '2',
        title: 'Hanuman Chalisa Course',
        description: 'Complete course with detailed explanations',
        type: 'course',
      },
      {
        id: '3',
        title: 'Swar Vigyan',
        description: 'Learn the science of sound',
        type: 'course',
      },
      {
        id: '5',
        title: 'E-books Collection',
        description: 'Downloadable meditation guides',
        type: 'ebook',
      },
      {
        id: '7',
        title: 'All Videos Available Here',
        description: 'Access our complete video library',
        type: 'video',
      },
    ]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModule, setNewModule] = useState<ContentItem>({
    id: '',
    title: '',
    description: '',
    type: 'course',
  });

  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: '3-4 Days Webinar',
      description: 'Access all webinar recordings',
      type: 'video',
    },
    {
      id: '2',
      title: 'E-Books Collection',
      description: 'Access your collection of meditation e-books',
      type: 'ebook',
    },
  ];

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();

        if (data.subscriptions?.length > 0) {
          const activeSub = data.subscriptions.find(
            (sub: Subscription) => sub.isActive
          );
          setSubscription(activeSub);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (!subscription) {
    router.push('/');
    return null;
  }

  // Check if user is admin
  if (session?.user?.isAdmin) {
    return <WebinarView session={session} />;
  }

  // For new FOUR_DAY subscribers, show welcome page
  if (
    subscription.type === 'FOUR_DAY' &&
    new Date(subscription.startDate).getTime() >
      Date.now() - 24 * 60 * 60 * 1000
  ) {
    return <FourDayPlan />;
  }

  // Function to check if content is accessible based on subscription
  const isContentAccessible = (item: ContentItem) => {
    if (subscription.type === 'FOUR_DAY') {
      return item.title === '3-4 Days Webinar' || item.type === 'ebook';
    }
    return subscription.type === 'SIX_MONTH';
  };

  const handleStartLearning = (item: ContentItem) => {
    if (subscription.type === 'FOUR_DAY') {
      if (item.title === '3-4 Days Webinar') {
        setCurrentView('fourDay');
        return;
      }
      if (item.type === 'ebook') {
        router.push('/users/ebook199');
        return;
      }
      router.push('/');
      return;
    }

    if (subscription.type === 'SIX_MONTH') {
      if (item.title === '3-4 Days Webinar') {
        setCurrentView('webinar');
        return;
      }
      if (item.type === 'ebook') {
        router.push('/users/ebooks');
        return;
      }
      setCurrentView('webinar');
    }
  };

  // Add this function to handle adding new modules
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.title || !newModule.description) return;
    setPremiumContentItems([
      {
        ...newModule,
        id: Date.now().toString(),
      },
      ...premiumContentItems,
    ]);
    setShowAddModal(false);
    setNewModule({ id: '', title: '', description: '', type: 'course' });
  };

  // Render different views based on currentView state
  if (currentView === 'fourDay') {
    return <FourDayPlan />;
  }

  if (currentView === 'webinar') {
    return <WebinarView session={session!} />;
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Your Meditation Dashboard
          </h1>
          <p className="text-gray-600">
            {subscription.type === 'FOUR_DAY'
              ? 'Access to 3-4 Days Webinar'
              : 'Full access to all content'}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`rounded-lg px-6 py-2 font-medium transition-all ${
              activeTab === 'unlocked'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unlocked Content
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`rounded-lg px-6 py-2 font-medium transition-all ${
              activeTab === 'locked'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Premium Content
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {activeTab === 'unlocked'
            ? // Show 3-4 Days Webinar in unlocked content
              contentItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-white p-6 shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-3 ${
                        isContentAccessible(item)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Play className="size-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        {item.description}
                      </p>
                      {isContentAccessible(item) ? (
                        item.title === 'All Videos Available Here' ? (
                          <div className="w-full">
                            {' '}
                            {/* This wrapper maintains consistent width */}
                            <a
                              href="https://shreemahavidyashaktipeeth.com/subscription/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:shadow-xl"
                            >
                              <Play className="size-4" />
                              Start Learning
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartLearning(item)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:shadow-xl"
                          >
                            <Play className="size-4" />
                            Start Learning
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => router.push('/')}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:shadow-xl"
                        >
                          <Sparkles className="size-4" />
                          Upgrade to Unlock
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            : // Show premium content
              premiumContentItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-white p-6 shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-3 ${
                        isContentAccessible(item)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {item.type === 'course' ? (
                        <Book className="size-6" />
                      ) : item.type === 'meditation' ? (
                        <Music className="size-6" />
                      ) : item.type === 'live' ? (
                        <Calendar className="size-6" />
                      ) : (
                        <Book className="size-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        {item.description}
                      </p>
                      {isContentAccessible(item) ? (
                        item.title === 'All Videos Available Here' ? (
                          <a
                            href="https://shreemahavidyashaktipeeth.com/subscription/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:shadow-xl"
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href =
                                'https://shreemahavidyashaktipeeth.com/subscription/';
                            }}
                          >
                            <Play className="size-4" />
                            Start Learning
                          </a>
                        ) : (
                          <button
                            onClick={() => handleStartLearning(item)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:shadow-xl"
                          >
                            <Play className="size-4" />
                            Start Learning
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => router.push('/')}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:shadow-xl"
                        >
                          <Sparkles className="size-4" />
                          Upgrade to Unlock
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        {activeTab === 'locked' && session?.user?.isAdmin && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
              title="Add Module"
            >
              <Plus className="size-4" />
              Add Module
            </button>
          </div>
        )}

        {/* Add Module Modal */}
        {showAddModal && session?.user?.isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <form
              onSubmit={handleAddModule}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            >
              <h2 className="mb-4 text-lg font-bold">Add New Module</h2>
              <input
                className="mb-2 w-full rounded border px-3 py-2"
                placeholder="Title"
                value={newModule.title}
                onChange={(e) =>
                  setNewModule({ ...newModule, title: e.target.value })
                }
                required
              />
              <textarea
                className="mb-2 w-full rounded border px-3 py-2"
                placeholder="Description"
                value={newModule.description}
                onChange={(e) =>
                  setNewModule({ ...newModule, description: e.target.value })
                }
                required
              />
              <select
                className="mb-4 w-full rounded border px-3 py-2"
                value={newModule.type}
                onChange={(e) =>
                  setNewModule({
                    ...newModule,
                    type: e.target.value as ContentItem['type'],
                  })
                }
              >
                <option value="course">Course</option>
                <option value="meditation">Meditation</option>
                <option value="ebook">Ebook</option>
                <option value="live">Live</option>
                <option value="video">Video</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded bg-gray-200 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
