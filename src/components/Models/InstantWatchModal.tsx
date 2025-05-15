import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Switch } from '@radix-ui/react-switch';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, Clock, Play, X, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const InstantWatchModal = ({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    instantWatchEnabled: boolean;
    selectedSession: string;
  }) => void;
}) => {
  const [instantWatchEnabled, setInstantWatchEnabled] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const options = [
    { value: 'instant-watch-1', label: 'Instant Watch Session 1' },
    { value: 'instant-watch-2', label: 'Instant Watch Session 2' },
    { value: 'instant-watch-3', label: 'Instant Watch Session 3' },
    { value: 'instant-watch-4', label: 'Instant Watch Session 4' },
    { value: 'instant-watch-5', label: 'Instant Watch Session 5' },
    { value: 'instant-watch-6', label: 'Instant Watch Session 6' },
    { value: 'instant-watch-7', label: 'Instant Watch Session 7' },
    { value: 'instant-watch-8', label: 'Instant Watch Session 8' },
    { value: 'instant-watch-9', label: 'Instant Watch Session 9' },
    { value: 'instant-watch-10', label: 'Instant Watch Session 10' },
  ] as const;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setShowSuccess(false);
      setIsSaving(false);
    }
  }, [open]);

  const handleInstantWatchSubmit = () => {
    setIsSaving(true);

    // Simulate saving with a delay
    setTimeout(() => {
      onSave({ instantWatchEnabled, selectedSession });
      setIsSaving(false);
      setShowSuccess(true);

      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm dark:bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[450px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800">
          <AnimatePresence>
            {showSuccess ? (
              <motion.div
                className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8 text-center dark:from-green-700/30 dark:to-green-800/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-500 dark:bg-green-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <Check className="size-8 text-white" />
                </motion.div>
                <motion.h3
                  className="mb-2 text-xl font-bold text-green-800 dark:text-green-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Settings Saved!
                </motion.h3>
                <motion.p
                  className="text-green-700 dark:text-green-400"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Your Instant Watch settings have been updated successfully.
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white dark:from-blue-700 dark:to-indigo-800">
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/10 dark:bg-white/5" />
                  <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-white/10 dark:bg-white/5" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-white/20 p-2 dark:bg-white/10">
                        <Clock className="size-5" />
                      </div>
                      <Dialog.Title className="text-lg font-semibold">
                        Instant Watch Settings
                      </Dialog.Title>
                    </div>
                    <Dialog.Close asChild>
                      <motion.button
                        className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={18} />
                      </motion.button>
                    </Dialog.Close>
                  </div>
                </div>

                <div className="p-6">
                  {/* Feature Card */}
                  <motion.div
                    className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm dark:from-slate-700 dark:to-slate-600"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-500/20">
                        <Zap className="size-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-slate-200">
                          Instant Watch
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Allow viewers to watch your webinar immediately
                          without waiting for the scheduled time.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Toggle Instant Watch Session */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
                          <Play className="size-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Label className="font-medium dark:text-slate-200">
                          Enable Instant Watch
                        </Label>
                      </div>
                      <Switch
                        checked={instantWatchEnabled}
                        onCheckedChange={setInstantWatchEnabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${instantWatchEnabled ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                      >
                        <motion.span
                          className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-slate-300 ${instantWatchEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </Switch>
                    </div>
                  </div>

                  {/* Session Selection */}
                  <div className="mb-6">
                    <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Select Session
                    </Label>
                    <Select
                      value={selectedSession}
                      onValueChange={setSelectedSession}
                      className="w-full dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    >
                      <option
                        value=""
                        className="text-gray-500 dark:text-slate-400"
                      >
                        Select a session
                      </option>
                      {options.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="dark:bg-slate-700 dark:text-slate-200"
                        >
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <Button
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <motion.button
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white ${isSaving ? 'bg-blue-400 dark:bg-blue-500/80' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'}`}
                      onClick={handleInstantWatchSubmit}
                      disabled={isSaving}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            className="size-4 rounded-full border-2 border-white border-t-transparent dark:border-slate-300 dark:border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          <span className="dark:text-slate-200">Saving...</span>
                        </>
                      ) : (
                        <>
                          <span className="dark:text-slate-100">
                            Save Changes
                          </span>
                          <ChevronRight className="size-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InstantWatchModal;
