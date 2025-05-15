'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Check,
  Loader2,
  Settings,
  Video,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import WebinarStep1 from './webinarStep1';
import WebinarStep2 from './webinarStep2';
import WebinarStep3 from './webinarStep3';
import WebinarSettings from './webinarStep4';

import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProgressBar from '@/components/ui/ProgressBar';
import { WebinarFormData } from '@/types/user';

export default function WebinarSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<WebinarFormData>({
    webinarId: '',
    webinarName: '',
    webinarTitle: '',
    duration: { hours: 0, minutes: 0, seconds: 0 },
    attendeeSignIn: false,
    passwordProtected: false,
    webinarDate: '',
    webinarTime: '',
    selectedValue: '',
    brandImage: '',
    instantWatch: false,
    instantWatchSession: '',
    justInTime: false,
    justInTimeSession: '',
    scheduledDates: [],
    videoUploads: [],
    emailNotifications: {
      confirmation: true,
      oneDayReminder: true,
      thirtyMinuteReminder: true,
    },
    textNotifications: {
      confirmation: true,
      oneDayReminder: false,
      thirtyMinuteReminder: false,
    },
    integration: '',
    webinarSharing: {
      enabled: false,
      name: '',
      url: '',
    },
  });
  const { theme } = useTheme();

  const nextStep = async () => {
    if (currentStep === 3) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/webinar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setShowSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setError('Failed to create webinar. Please try again.');
        }
      } catch (error) {
        console.error(error);
        setError('Error submitting webinar. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Handle step click from progress bar
  const handleStepClick = (step: number) => {
    // Only allow moving to completed steps or the next available step
    if (step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };

  // Animation variants
  // const containerVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.1,
  //       delayChildren: 0.2,
  //     },
  //   },
  // };

  // const itemVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: {
  //     y: 0,
  //     opacity: 1,
  //     transition: {
  //       type: 'spring',
  //       stiffness: 100,
  //       damping: 10,
  //     },
  //   },
  // };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      scale: 1.02,
      boxShadow:
        theme === 'dark'
          ? '0 10px 25px rgba(0,0,0,0.3)'
          : '0 10px 25px rgba(0,0,0,0.1)',
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-lg bg-green-500 px-6 py-4 text-white shadow-lg dark:bg-green-600">
              <div className="flex size-8 items-center justify-center rounded-full bg-green-400 dark:bg-green-500">
                <Check className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">Success!</h3>
                <p className="text-sm">Webinar created successfully.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSuccess(false)}
                className="ml-4"
              >
                <X className="size-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-lg bg-red-500 px-6 py-4 text-white shadow-lg dark:bg-red-600">
              <div className="flex size-8 items-center justify-center rounded-full bg-red-400 dark:bg-red-500">
                <X className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setError(null)}
                className="ml-4"
              >
                <X className="size-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="p-4 md:p-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Breadcrumb>
          <BreadcrumbItem>
            <motion.button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </motion.button>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <motion.div
              className="mb-1 flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-md dark:from-blue-600 dark:to-purple-600">
                <Video className="size-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Webinar Setup
              </span>
            </motion.div>
            <motion.h1
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl dark:from-blue-400 dark:to-purple-400"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Create Your Webinar
            </motion.h1>
            <motion.p
              className="mt-1 max-w-md text-sm text-gray-500 dark:text-slate-400"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Fill in the details below to set up your webinar. You can
              customize settings in each step.
            </motion.p>
          </div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 flex items-center gap-3 md:mt-0"
          >
            <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/20">
              <Video className="size-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Step {currentStep + 1} of 4
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 shadow-sm dark:border-purple-500/30 dark:bg-purple-500/20">
              <Calendar className="size-4 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                {currentStep === 0
                  ? 'Basic Info'
                  : currentStep === 1
                    ? 'Content'
                    : currentStep === 2
                      ? 'Schedule'
                      : 'Settings'}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <ProgressBar currentStep={currentStep} onStepClick={handleStepClick} />
      </motion.div>

      <motion.div
        className="mx-4 mb-6 md:mx-6"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card>
          <div className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 dark:border-slate-700 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700/50">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg dark:from-blue-600 dark:to-purple-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentStep === 0 && (
                      <Video className="size-6 text-white" />
                    )}
                    {currentStep === 1 && (
                      <Video className="size-6 text-white" />
                    )}
                    {currentStep === 2 && (
                      <Calendar className="size-6 text-white" />
                    )}
                    {currentStep === 3 && (
                      <Settings className="size-6 text-white" />
                    )}
                  </motion.div>
                  <div>
                    <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                      {currentStep === 3
                        ? 'Additional Details'
                        : 'Webinar Details'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      {currentStep === 0 &&
                        'Set up your webinar name, title, and basic information'}
                      {currentStep === 1 &&
                        'Upload and manage your webinar content'}
                      {currentStep === 2 &&
                        'Schedule your webinar dates and times'}
                      {currentStep === 3 &&
                        'Configure additional settings and preferences'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 shadow-sm dark:bg-blue-500/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/30">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                        {currentStep + 1}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                      of 4
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 shadow-sm dark:bg-purple-500/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex size-7 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/30">
                      {currentStep === 0 && (
                        <Video className="size-4 text-purple-600 dark:text-purple-400" />
                      )}
                      {currentStep === 1 && (
                        <Video className="size-4 text-purple-600 dark:text-purple-400" />
                      )}
                      {currentStep === 2 && (
                        <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
                      )}
                      {currentStep === 3 && (
                        <Settings className="size-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                      {currentStep === 0
                        ? 'Basic Info'
                        : currentStep === 1
                          ? 'Content'
                          : currentStep === 2
                            ? 'Schedule'
                            : 'Settings'}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <CardContent>
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WebinarStep1 formData={formData} setFormData={setFormData} />
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WebinarStep2 formData={formData} setFormData={setFormData} />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WebinarStep3 />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WebinarSettings
                    formData={formData}
                    setFormData={setFormData}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="mt-8 flex justify-between"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Previous
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {currentStep === 3 ? 'Submitting...' : 'Loading...'}
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      <Check className="mr-2 size-4" />
                      Submit
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step indicators for mobile */}
      <motion.div
        className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-4 md:hidden dark:border-slate-700 dark:bg-slate-800"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="size-4 text-blue-500 dark:text-blue-400" />
            <span className="text-sm font-medium dark:text-slate-300">
              Step {currentStep + 1} of 4
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`size-2 rounded-full ${
                  currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: currentStep >= step ? 1 : 0.8,
                  backgroundColor:
                    currentStep >= step
                      ? theme === 'dark'
                        ? '#3b82f6'
                        : '#2563eb'
                      : theme === 'dark'
                        ? '#4b5563'
                        : '#d1d5db',
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
