import React, { useEffect, useRef, useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Globe,
  ImageIcon,
  Lock,
  Plus,
  Search,
  Shield,
  Trash,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import AddDateModal from '@/components/Models/AddDateModal';
import InstantWatchModal from '@/components/Models/InstantWatchModal';
import JustInTimeModal from '@/components/Models/JustInTime';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScheduledDate, WebinarFormData } from '@/types/user';

type WebinarFormProps = {
  formData: WebinarFormData;
  setFormData: React.Dispatch<React.SetStateAction<WebinarFormData>>;
};

const WebinarForm = ({ formData, setFormData }: WebinarFormProps) => {
  const [isDateModalOpen, setIsDateModalOpen] = React.useState(false);
  const [isInstantWatchModalOpen, setIsInstantWatchModalOpen] =
    React.useState(false);
  const [isJustInTimeModalOpen, setIsJustInTimeModalOpen] =
    React.useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(
    formData.webinarTime || '12:00'
  );
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  const options = [
    'English',
    'Spanish',
    'Mandarin Chinese',
    'Hindi',
    'Arabic',
    'French',
    'Bengali',
    'Russian',
    'Portuguese',
    'Urdu',
    'Indonesian',
    'German',
    'Japanese',
    'Swahili',
    'Marathi',
    'Telugu',
    'Turkish',
    'Korean',
    'Tamil',
    'Vietnamese',
  ];

  // Filter languages based on search
  const filteredLanguages = options.filter((language) =>
    language.toLowerCase().includes(languageSearch.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target as Node)
      ) {
        setIsTimePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate calendar days
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Generate time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  const handleDeleteSchedule = (index: number) => {
    const updated = formData.scheduledDates.filter((_, i) => i !== index);
    setFormData(
      (prev: WebinarFormData): WebinarFormData => ({
        ...prev,
        scheduledDates: updated,
      })
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <CardContent>
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Name and Title in one row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <div>
            <Label
              htmlFor="webinar-name"
              className="mb-1 flex items-center text-xs font-medium text-gray-700"
            >
              <Users className="mr-1 size-3 text-blue-500" />
              Name
            </Label>
            <div className="relative">
              <Input
                id="webinar-name"
                type="text"
                value={formData.webinarName || ''}
                onChange={(e) =>
                  setFormData((prev: WebinarFormData) => ({
                    ...prev,
                    webinarName: e.target.value,
                  }))
                }
                className="h-9 rounded-lg border-gray-300 pl-8 transition-all duration-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter webinar name"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <Users className="size-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <Label
              htmlFor="webinar-title"
              className="mb-1 flex items-center text-xs font-medium text-gray-700"
            >
              <Globe className="mr-1 size-3 text-purple-500" />
              Title
            </Label>
            <div className="relative">
              <Input
                id="webinar-title"
                type="text"
                value={formData.webinarTitle || ''}
                onChange={(e) =>
                  setFormData((prev: WebinarFormData) => ({
                    ...prev,
                    webinarTitle: e.target.value,
                  }))
                }
                className="h-9 rounded-lg border-gray-300 pl-8 transition-all duration-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter webinar title"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <Globe className="size-4 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Duration */}
        <motion.div variants={itemVariants}>
          <Label className="mb-1 flex items-center text-xs font-medium text-gray-700">
            <Clock className="mr-1 size-3 text-blue-500" />
            Webinar Duration
          </Label>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex flex-col space-y-4">
              {/* Duration Input Fields */}
              <div className="grid grid-cols-3 gap-3">
                {/* Hours */}
                <div className="relative">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      max="12"
                      value={formData.duration?.hours || 0}
                      onChange={(e) => {
                        const value = Math.min(
                          12,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        setFormData((prev: WebinarFormData) => ({
                          ...prev,
                          duration: {
                            ...prev.duration,
                            hours: value,
                          },
                        }));
                      }}
                      className="pr-8 text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      h
                    </span>
                  </div>
                </div>

                {/* Minutes */}
                <div className="relative">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.duration?.minutes || 0}
                      onChange={(e) => {
                        const value = Math.min(
                          59,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        setFormData((prev: WebinarFormData) => ({
                          ...prev,
                          duration: {
                            ...prev.duration,
                            minutes: value,
                          },
                        }));
                      }}
                      className="pr-8 text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      m
                    </span>
                  </div>
                </div>

                {/* Seconds */}
                <div className="relative">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.duration?.seconds || 0}
                      onChange={(e) => {
                        const value = Math.min(
                          59,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        setFormData((prev: WebinarFormData) => ({
                          ...prev,
                          duration: {
                            ...prev.duration,
                            seconds: value,
                          },
                        }));
                      }}
                      className="pr-8 text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      s
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Duration Display */}
              <div className="flex items-center justify-center">
                <div className="rounded-lg bg-blue-50 px-4 py-2 text-center">
                  <span className="text-xs text-gray-500">Total Duration:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {formData.duration?.hours || 0}h{' '}
                    {formData.duration?.minutes || 0}m{' '}
                    {formData.duration?.seconds || 0}s
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 0 &&
                    formData.duration?.minutes === 15 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 0, minutes: 15, seconds: 0 },
                    }))
                  }
                >
                  15m
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 0 &&
                    formData.duration?.minutes === 30 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 0, minutes: 30, seconds: 0 },
                    }))
                  }
                >
                  30m
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 1 &&
                    formData.duration?.minutes === 0 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 1, minutes: 0, seconds: 0 },
                    }))
                  }
                >
                  1h
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 1 &&
                    formData.duration?.minutes === 30 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 1, minutes: 30, seconds: 0 },
                    }))
                  }
                >
                  1h 30m
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 2 &&
                    formData.duration?.minutes === 0 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 2, minutes: 0, seconds: 0 },
                    }))
                  }
                >
                  2h
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 0 &&
                    formData.duration?.minutes === 45 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 0, minutes: 45, seconds: 0 },
                    }))
                  }
                >
                  45m
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 1 &&
                    formData.duration?.minutes === 15 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 1, minutes: 15, seconds: 0 },
                    }))
                  }
                >
                  1h 15m
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 1 &&
                    formData.duration?.minutes === 45 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 1, minutes: 45, seconds: 0 },
                    }))
                  }
                >
                  1h 45m
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 2 &&
                    formData.duration?.minutes === 30 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 2, minutes: 30, seconds: 0 },
                    }))
                  }
                >
                  2h 30m
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 3 &&
                    formData.duration?.minutes === 0 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 3, minutes: 0, seconds: 0 },
                    }))
                  }
                >
                  3h
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 4 &&
                    formData.duration?.minutes === 0 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 4, minutes: 0, seconds: 0 },
                    }))
                  }
                >
                  4h
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    formData.duration?.hours === 6 &&
                    formData.duration?.minutes === 0 &&
                    formData.duration?.seconds === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() =>
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      duration: { hours: 6, minutes: 0, seconds: 0 },
                    }))
                  }
                >
                  6h
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Date and Time in one row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <div>
            <Label
              htmlFor="webinar-date"
              className="mb-1 flex items-center text-xs font-medium text-gray-700"
            >
              <Calendar className="mr-1 size-3 text-blue-500" />
              Date
            </Label>
            <div className="relative" ref={datePickerRef}>
              <div
                className="flex h-9 cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 transition-all duration-300 hover:border-blue-400"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsDatePickerOpen(!isDatePickerOpen);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center">
                  {formData.webinarDate ? (
                    <span className="text-xs text-gray-800">
                      {format(new Date(formData.webinarDate), 'MMMM d, yyyy')}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Select a date</span>
                  )}
                </div>
                <div className="flex items-center">
                  {formData.webinarDate && (
                    <motion.button
                      className="mr-1 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev: WebinarFormData) => ({
                          ...prev,
                          webinarDate: '',
                        }));
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="size-3" />
                    </motion.button>
                  )}
                  <Calendar className="size-4 text-gray-400" />
                </div>
              </div>

              <AnimatePresence>
                {isDatePickerOpen && (
                  <motion.div
                    className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <motion.button
                        className="rounded-full p-0.5 hover:bg-gray-100"
                        onClick={() =>
                          setCurrentMonth(subMonths(currentMonth, 1))
                        }
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronLeft className="size-4 text-gray-500" />
                      </motion.button>
                      <h3 className="text-xs font-medium text-gray-700">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <motion.button
                        className="rounded-full p-0.5 hover:bg-gray-100"
                        onClick={() =>
                          setCurrentMonth(addMonths(currentMonth, 1))
                        }
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronRight className="size-4 text-gray-500" />
                      </motion.button>
                    </div>

                    <div className="mb-1 grid grid-cols-7 gap-0.5">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div
                          key={`day-${index}`}
                          className="py-0.5 text-center text-[10px] font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {days.map((day, index) => {
                        const isSelected =
                          formData.webinarDate &&
                          isSameDay(new Date(formData.webinarDate), day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isCurrentDay = isToday(day);

                        return (
                          <motion.button
                            key={index}
                            className={`
                              flex size-5 items-center justify-center rounded-full text-[10px]
                              ${isSelected ? 'bg-blue-500 text-white' : ''}
                              ${!isCurrentMonth ? 'text-gray-300' : ''}
                              ${isCurrentDay && !isSelected ? 'border-2 border-blue-500 text-blue-500' : ''}
                              ${isCurrentMonth && !isSelected ? 'hover:bg-gray-100' : ''}
                            `}
                            onClick={() => {
                              setFormData((prev: WebinarFormData) => ({
                                ...prev,
                                webinarDate: format(day, 'yyyy-MM-dd'),
                              }));
                              setIsDatePickerOpen(false);
                            }}
                            whileHover={{ scale: isCurrentMonth ? 1.1 : 1 }}
                            whileTap={{ scale: isCurrentMonth ? 0.9 : 1 }}
                            disabled={!isCurrentMonth}
                          >
                            {format(day, 'd')}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div>
            <Label
              htmlFor="webinar-time"
              className="mb-1 flex items-center text-xs font-medium text-gray-700"
            >
              <Clock className="mr-1 size-3 text-purple-500" />
              Time
            </Label>
            <div className="relative" ref={timePickerRef}>
              <div
                className="flex h-9 cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 transition-all duration-300 hover:border-purple-400"
                onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsTimePickerOpen(!isTimePickerOpen);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center">
                  {selectedTime ? (
                    <span className="text-xs text-gray-800">
                      {selectedTime}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Select a time</span>
                  )}
                </div>
                <div className="flex items-center">
                  {selectedTime && (
                    <motion.button
                      className="mr-1 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTime('');
                        setFormData((prev: WebinarFormData) => ({
                          ...prev,
                          webinarTime: '',
                        }));
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="size-3" />
                    </motion.button>
                  )}
                  <Clock className="size-4 text-gray-400" />
                </div>
              </div>

              <AnimatePresence>
                {isTimePickerOpen && (
                  <motion.div
                    className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-1 text-center">
                      <h3 className="text-xs font-medium text-gray-700">
                        Select Time
                      </h3>
                    </div>

                    <ScrollArea className="h-[150px]">
                      <div className="grid grid-cols-2 gap-1 p-1">
                        {timeSlots.map((time) => (
                          <motion.button
                            key={time}
                            className={`
                              rounded-md p-1 text-center text-xs
                              ${selectedTime === time ? 'bg-purple-500 text-white' : 'hover:bg-gray-100'}
                            `}
                            onClick={() => {
                              setSelectedTime(time);
                              setFormData((prev: WebinarFormData) => ({
                                ...prev,
                                webinarTime: time,
                              }));
                              setIsTimePickerOpen(false);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Attendee Sign-in and Password Protection in one row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <motion.div
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-2 shadow-sm transition-all duration-300 hover:shadow-md"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <div className="mr-2 flex size-8 items-center justify-center rounded-full bg-blue-100">
                <UserCheck className="size-4 text-blue-600" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700">
                  Attendee Sign-in
                </Label>
                <p className="text-[10px] text-gray-500">
                  Require attendees to sign in
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`rounded-full px-2 py-0.5 text-[10px] ${formData.attendeeSignIn ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
              >
                {formData.attendeeSignIn ? 'Enabled' : 'Disabled'}
              </Badge>
              <div className="relative">
                <Switch
                  checked={formData.attendeeSignIn}
                  onCheckedChange={(checked) => {
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      attendeeSignIn: checked,
                    }));
                  }}
                  className="relative h-5 w-10 rounded-full bg-gray-200 transition-colors duration-300 data-[state=checked]:bg-blue-500"
                >
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                      x: formData.attendeeSignIn ? 15 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <motion.div
                      className="size-4 rounded-full bg-white shadow-md"
                      initial={false}
                      animate={{
                        boxShadow: formData.attendeeSignIn
                          ? '0 0 0 0 rgba(59, 130, 246, 0.5)'
                          : '0 0 0 0 rgba(156, 163, 175, 0.5)',
                      }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence>
                        {formData.attendeeSignIn && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Check className="size-2.5 text-blue-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </Switch>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-2 shadow-sm transition-all duration-300 hover:shadow-md"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <div className="mr-2 flex size-8 items-center justify-center rounded-full bg-purple-100">
                <Shield className="size-4 text-purple-600" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700">
                  Password Protection
                </Label>
                <p className="text-[10px] text-gray-500">Secure your webinar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`rounded-full px-2 py-0.5 text-[10px] ${formData.passwordProtected ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
              >
                {formData.passwordProtected ? 'Enabled' : 'Disabled'}
              </Badge>
              <div className="relative">
                <Switch
                  checked={formData.passwordProtected}
                  onCheckedChange={(checked) => {
                    setFormData((prev: WebinarFormData) => ({
                      ...prev,
                      passwordProtected: checked,
                    }));
                  }}
                  className="relative h-5 w-10 rounded-full bg-gray-200 transition-colors duration-300 data-[state=checked]:bg-purple-500"
                >
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                      x: formData.passwordProtected ? 15 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <motion.div
                      className="size-4 rounded-full bg-white shadow-md"
                      initial={false}
                      animate={{
                        boxShadow: formData.passwordProtected
                          ? '0 0 0 0 rgba(147, 51, 234, 0.5)'
                          : '0 0 0 0 rgba(156, 163, 175, 0.5)',
                      }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence>
                        {formData.passwordProtected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Lock className="size-2.5 text-purple-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </Switch>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Brand Image */}
        <motion.div variants={itemVariants}>
          <Label
            htmlFor="brand-image"
            className="mb-1 flex items-center text-xs font-medium text-gray-700"
          >
            <ImageIcon
              className="mr-1 size-3 text-amber-500"
              aria-hidden="true"
            />
            Brand Image
          </Label>
          <div className="relative">
            <Input
              id="brand-image"
              type="file"
              accept="image/*"
              className="h-9 rounded-lg border-gray-300 pl-8 transition-all duration-300 focus:border-amber-500 focus:ring-amber-500"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
              <ImageIcon className="size-4 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </motion.div>

        {/* Instant Watch and Just-in-time Sessions in one row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <motion.div
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 p-2 shadow-sm transition-all duration-300 hover:shadow-md"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <Label className="flex items-center text-xs font-medium text-gray-700">
                <Clock className="mr-1 size-4 text-yellow-600" />
                Instant Watch
              </Label>
              <Badge
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${formData.instantWatch ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
              >
                {formData.instantWatch ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <motion.button
              onClick={() => setIsInstantWatchModalOpen(true)}
              className="flex items-center gap-1 rounded-md bg-yellow-500 px-2 py-1 text-xs text-white shadow-sm transition-all duration-300 hover:bg-yellow-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="size-3" />
              <span>Edit</span>
            </motion.button>
            <InstantWatchModal
              open={isInstantWatchModalOpen}
              onClose={() => setIsInstantWatchModalOpen(false)}
              onSave={(data) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  instantWatch: data.instantWatchEnabled,
                  instantWatchSession: data.selectedSession,
                }))
              }
            />
          </motion.div>

          <motion.div
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 p-2 shadow-sm transition-all duration-300 hover:shadow-md"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <Label className="flex items-center text-xs font-medium text-gray-700">
                <Clock className="mr-1 size-4 text-indigo-600" />
                Just-in-time Sessions
              </Label>
              <Badge
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${formData.justInTime ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
              >
                {formData.justInTime ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <motion.button
              onClick={() => setIsJustInTimeModalOpen(true)}
              className="flex items-center gap-1 rounded-md bg-indigo-500 px-2 py-1 text-xs text-white shadow-sm transition-all duration-300 hover:bg-indigo-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="size-3" />
              <span>Edit</span>
            </motion.button>
            <JustInTimeModal
              open={isJustInTimeModalOpen}
              onClose={() => setIsJustInTimeModalOpen(false)}
              onSave={(data) =>
                setFormData((prev: WebinarFormData) => ({
                  ...prev,
                  justInTime: data.justInTimeEnabled,
                  justInTimeSession: data.selectedSession,
                }))
              }
            />
          </motion.div>
        </motion.div>

        {/* Language */}
        <motion.div variants={itemVariants}>
          <Label className="mb-1 flex items-center text-xs font-medium text-gray-700">
            <Globe className="mr-1 size-3 text-blue-500" />
            Language
          </Label>
          <div className="relative" ref={languageDropdownRef}>
            <div
              className="flex h-9 cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 transition-all duration-300 hover:border-blue-400"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center">
                {formData.selectedValue ? (
                  <span className="text-xs text-gray-800">
                    {formData.selectedValue}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    Select a language
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {formData.selectedValue && (
                  <motion.button
                    className="mr-1 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev: WebinarFormData) => ({
                        ...prev,
                        selectedValue: '',
                      }));
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="size-3" />
                  </motion.button>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`size-4 text-gray-400 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {isLanguageDropdownOpen && (
              <motion.div
                className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="border-b border-gray-100 p-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search languages..."
                      className="w-full rounded-md border border-gray-200 py-1 pl-7 pr-2 text-xs outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <ScrollArea className="h-[150px]">
                  <div className="p-1">
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((option) => (
                        <motion.div
                          key={option}
                          className={`cursor-pointer rounded-md p-1.5 text-xs transition-colors ${
                            formData.selectedValue === option
                              ? 'bg-blue-100 font-medium text-blue-700'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setFormData((prev: WebinarFormData) => ({
                              ...prev,
                              selectedValue: option,
                            }));
                            setIsLanguageDropdownOpen(false);
                            setLanguageSearch('');
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {option}
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-xs text-gray-500">
                        No languages found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Scheduled Webinar Dates */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <Label className="flex items-center text-xs font-medium text-gray-700">
            <Calendar className="mr-1 size-3 text-green-500" />
            Scheduled Webinar Dates
          </Label>
          <motion.button
            onClick={() => setIsDateModalOpen(true)}
            className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1 text-xs text-white shadow-sm transition-all duration-300 hover:bg-green-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="size-3" />
            <span>Add Date</span>
          </motion.button>
          <AddDateModal
            open={isDateModalOpen}
            onClose={() => setIsDateModalOpen(false)}
            onSave={(newDate: ScheduledDate) => {
              const updated = [...(formData.scheduledDates || []), newDate];
              setFormData((prev: WebinarFormData) => ({
                ...prev,
                scheduledDates: updated,
              }));
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          {formData.scheduledDates?.length > 0 ? (
            <div className="w-full rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-3 shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-green-600" />
                  <h4 className="text-xs font-semibold text-green-800">
                    Scheduled Dates
                  </h4>
                </div>
                <span className="rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-medium text-green-800">
                  {formData.scheduledDates.length}{' '}
                  {formData.scheduledDates.length === 1 ? 'date' : 'dates'}
                </span>
              </div>
              <ul className="space-y-2">
                {formData.scheduledDates.map(
                  (schedule: ScheduledDate, index: number) => (
                    <motion.li
                      key={index}
                      className="group flex items-center justify-between rounded-md bg-white p-2.5 shadow-sm transition-all duration-200 hover:shadow-md"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <span className="text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-800">
                            {schedule.date}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {schedule.time} {schedule.period} (
                            {schedule.timeZone})
                          </span>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleDeleteSchedule(index)}
                        className="flex size-6 items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 transition-all duration-200 hover:bg-red-100 group-hover:opacity-100"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Delete schedule"
                      >
                        <Trash size={12} />
                      </motion.button>
                    </motion.li>
                  )
                )}
              </ul>
            </div>
          ) : (
            <motion.p
              className="w-full rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-3 text-center text-xs text-gray-600 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              No dates scheduled.
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </CardContent>
  );
};

export default WebinarForm;
