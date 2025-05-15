import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isTomorrow,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddDateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    date: string;
    time: string;
    period: string;
    timeZone: string;
  }) => void;
}

const AddDateModal: React.FC<AddDateModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('AM');
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [isTimeZoneDropdownOpen, setIsTimeZoneDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Generate next 6 days for quick selection (reduced from 30)
  const quickDates = Array.from({ length: 6 }, (_, i) =>
    addDays(new Date(), i)
  );

  // Generate calendar days for the current month
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Generate time slots in 30-minute increments
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    return {
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      display: `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
      period,
    };
  });

  // Expanded timezone options with more locations
  const timeZoneOptions = [
    {
      region: 'North America',
      zones: [
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
        { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
      ],
    },
    {
      region: 'Europe',
      zones: [
        { value: 'Europe/London', label: 'London (GMT/BST)' },
        { value: 'Europe/Paris', label: 'Central European Time (CET)' },
        { value: 'Europe/Berlin', label: 'Berlin (CET)' },
        { value: 'Europe/Madrid', label: 'Madrid (CET)' },
        { value: 'Europe/Rome', label: 'Rome (CET)' },
        { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)' },
      ],
    },
    {
      region: 'Asia',
      zones: [
        { value: 'Asia/Dubai', label: 'Dubai (GST)' },
        { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
        { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
        { value: 'Asia/Seoul', label: 'Seoul (KST)' },
      ],
    },
    {
      region: 'Australia & Pacific',
      zones: [
        { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
        { value: 'Australia/Perth', label: 'Perth (AWST)' },
        { value: 'Australia/Adelaide', label: 'Adelaide (ACST)' },
        { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
      ],
    },
    {
      region: 'South America',
      zones: [
        { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
        {
          value: 'America/Argentina/Buenos_Aires',
          label: 'Buenos Aires (ART)',
        },
        { value: 'America/Santiago', label: 'Santiago (CLT)' },
      ],
    },
    {
      region: 'Africa',
      zones: [
        { value: 'Africa/Cairo', label: 'Cairo (EET)' },
        { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
        { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
      ],
    },
  ];

  // Get the display name for the selected timezone
  const getTimeZoneDisplayName = () => {
    for (const region of timeZoneOptions) {
      const zone = region.zones.find((z) => z.value === timeZone);
      if (zone) return zone.label;
    }
    return timeZone;
  };

  // Handle date selection
  const handleDateSelect = (selectedDate: Date) => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    console.log('Setting date:', formattedDate);
    setSelectedDate(selectedDate);
    setDate(formattedDate);
    setIsDatePickerOpen(false);
  };

  // Handle time selection
  const handleTimeSelect = (selectedTime: string, selectedPeriod: string) => {
    console.log('Setting time:', selectedTime);
    setSelectedTime(selectedTime);
    setPeriod(selectedPeriod);
  };

  // Handle save
  const handleSave = () => {
    console.log('Current states:', { date, selectedTime, period, timeZone });
    if (date && selectedTime) {
      onSave({ date, time: selectedTime, period, timeZone });
      onClose();
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      console.log('Resetting form');
      setDate('');
      setPeriod('AM');
      setTimeZone('America/New_York');
      setSelectedDate(undefined);
      setSelectedTime('');
      setCurrentMonth(new Date());
    }
  }, [open]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm dark:bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[450px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white p-3 shadow-xl dark:bg-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-1 dark:border-slate-700">
            <Dialog.Title className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-base font-semibold text-transparent">
              Schedule Webinar Date
            </Dialog.Title>
            <Dialog.Close asChild>
              <motion.button
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="mt-2 grid grid-cols-2 gap-3">
            {/* Date Selection */}
            <div className="space-y-1">
              <Label className="flex items-center text-xs font-medium dark:text-slate-300">
                <Calendar className="mr-1 size-3 text-blue-500 dark:text-blue-400" />
                Select Date
              </Label>

              <div className="grid grid-cols-3 gap-1">
                {quickDates.map((day, index) => {
                  const isSelected =
                    selectedDate &&
                    format(selectedDate, 'yyyy-MM-dd') ===
                      format(day, 'yyyy-MM-dd');
                  const isTodayDate = isToday(day);
                  const isTomorrowDate = isTomorrow(day);

                  return (
                    <motion.button
                      key={index}
                      className={`
                        rounded-lg border p-1 text-center text-[10px]
                        ${isSelected ? 'border-blue-600 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-500' : 'border-gray-200 hover:border-blue-300 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400'}
                        ${isTodayDate && !isSelected ? 'border-green-500 text-green-600 dark:border-green-400 dark:text-green-400' : ''}
                        ${isTomorrowDate && !isSelected ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400' : ''}
                      `}
                      onClick={() => handleDateSelect(day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="font-medium">{format(day, 'd')}</div>
                      <div className="text-[8px]">
                        {isTodayDate
                          ? 'Today'
                          : isTomorrowDate
                            ? 'Tomorrow'
                            : format(day, 'MMM')}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-1">
                <div className="relative" ref={datePickerRef}>
                  <button
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 p-1.5 transition-colors hover:border-blue-400 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-blue-500"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsDatePickerOpen(!isDatePickerOpen);
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="flex items-center">
                      {date ? (
                        <span className="text-xs text-gray-800 dark:text-slate-200">
                          {format(new Date(date), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          Select a date
                        </span>
                      )}
                    </div>
                    <Calendar className="size-3 text-gray-400 dark:text-slate-500" />
                  </button>

                  <AnimatePresence>
                    {isDatePickerOpen && (
                      <motion.div
                        className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg dark:border-slate-600 dark:bg-slate-700"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <motion.button
                            className="rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-slate-600"
                            onClick={() =>
                              setCurrentMonth(subMonths(currentMonth, 1))
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ChevronLeft className="size-3 text-gray-500 dark:text-slate-400" />
                          </motion.button>
                          <h3 className="text-xs font-medium text-gray-700 dark:text-slate-300">
                            {format(currentMonth, 'MMMM yyyy')}
                          </h3>
                          <motion.button
                            className="rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-slate-600"
                            onClick={() =>
                              setCurrentMonth(addMonths(currentMonth, 1))
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ChevronRight className="size-3 text-gray-500 dark:text-slate-400" />
                          </motion.button>
                        </div>

                        <div className="mb-1 grid grid-cols-7 gap-0.5">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
                            (day, index) => (
                              <div
                                key={`day-${index}`}
                                className="py-0.5 text-center text-[8px] font-medium text-gray-500 dark:text-slate-400"
                              >
                                {day}
                              </div>
                            )
                          )}
                        </div>

                        <div className="grid grid-cols-7 gap-0.5">
                          {calendarDays.map((day, index) => {
                            const isSelected =
                              selectedDate && isSameDay(selectedDate, day);
                            const isCurrentMonth = isSameMonth(
                              day,
                              currentMonth
                            );
                            const isCurrentDay = isToday(day);

                            return (
                              <motion.button
                                key={index}
                                className={`
                                  flex size-5 items-center justify-center rounded-full text-[10px]
                                  ${isSelected ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white' : ''}
                                  ${!isCurrentMonth ? 'text-gray-300 dark:text-slate-600' : 'dark:text-slate-300'}
                                  ${isCurrentDay && !isSelected ? 'border-2 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400' : ''}
                                  ${isCurrentMonth && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-slate-600' : ''}
                                `}
                                onClick={() => handleDateSelect(day)}
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
            </div>

            {/* Time Selection */}
            <div className="space-y-1">
              <Label className="flex items-center text-xs font-medium dark:text-slate-300">
                <Clock className="mr-1 size-3 text-purple-500 dark:text-purple-400" />
                Select Time
              </Label>

              <div className="grid max-h-[100px] grid-cols-3 gap-1 overflow-y-auto rounded-lg border border-gray-200 p-1 dark:border-slate-600">
                {timeSlots.map((slot, index) => (
                  <motion.button
                    key={index}
                    className={`
                      rounded-md p-0.5 text-center text-[10px]
                      ${selectedTime === slot.time ? 'bg-purple-500 text-white dark:bg-purple-600 dark:text-white' : 'hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-600'}
                    `}
                    onClick={() => handleTimeSelect(slot.time, slot.period)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {slot.display}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Timezone Selection */}
            <div className="col-span-2 space-y-1">
              <Label className="flex items-center text-xs font-medium dark:text-slate-300">
                <Globe className="mr-1 size-3 text-green-500 dark:text-green-400" />
                Select Time Zone
              </Label>

              <div className="relative">
                <button
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 p-1.5 transition-colors hover:border-green-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-green-500"
                  onClick={() =>
                    setIsTimeZoneDropdownOpen(!isTimeZoneDropdownOpen)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setIsTimeZoneDropdownOpen(!isTimeZoneDropdownOpen);
                    }
                  }}
                  tabIndex={0}
                >
                  <span className="text-xs text-gray-700 dark:text-slate-200">
                    {getTimeZoneDisplayName()}
                  </span>
                  <ChevronDown
                    className={`size-3 text-gray-500 transition-transform dark:text-slate-400 ${isTimeZoneDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isTimeZoneDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 mt-1 max-h-[150px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700"
                    >
                      <ScrollArea className="h-[150px]">
                        {timeZoneOptions.map((region, regionIndex) => (
                          <div
                            key={regionIndex}
                            className="border-b last:border-b-0 dark:border-slate-600"
                          >
                            <div className="bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-slate-600 dark:text-slate-400">
                              {region.region}
                            </div>
                            {region.zones.map((zone, zoneIndex) => (
                              <button
                                key={zoneIndex}
                                className={`flex w-full items-center justify-between px-2 py-0.5 text-left text-[10px] hover:bg-gray-50 dark:hover:bg-slate-600 ${
                                  timeZone === zone.value
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/30 dark:text-blue-300'
                                    : 'text-gray-700 dark:text-slate-300'
                                }`}
                                onClick={() => {
                                  setTimeZone(zone.value);
                                  setIsTimeZoneDropdownOpen(false);
                                }}
                              >
                                <span>{zone.label}</span>
                                {timeZone === zone.value && (
                                  <Check className="size-2.5 text-blue-500 dark:text-blue-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        ))}
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 flex justify-end space-x-2 border-t pt-2 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-7 border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!date || !selectedTime}
              className={`h-7 bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 text-xs text-white hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-600 dark:hover:from-blue-600 dark:hover:to-purple-700 ${!date || !selectedTime ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              Add Date
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddDateModal;
