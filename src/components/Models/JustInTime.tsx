import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Switch } from '@radix-ui/react-switch';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, Clock, Play, X, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const JustInTimeModal = ({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    justInTimeEnabled: boolean;
    selectedSession: string;
  }) => void;
}) => {
  const [justInTimeEnabled, setJustInTimeEnabled] = useState(true);
  const [selectedSession, setSelectedSession] = useState('1 min');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const options = [
    { value: '1 min', label: '1 minute' },
    { value: '5 min', label: '5 minutes' },
    { value: '15 min', label: '15 minutes' },
    { value: '30 min', label: '30 minutes' },
    { value: '1 hr', label: '1 hour' },
    { value: '2 hr', label: '2 hours' },
    { value: '3 hr', label: '3 hours' },
    { value: '4 hr', label: '4 hours' },
    { value: '6 hr', label: '6 hours' },
    { value: '12 hr', label: '12 hours' },
    { value: '24 hr', label: '24 hours' },
  ] as const;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setShowSuccess(false);
      setIsSaving(false);
    }
  }, [open]);

  const handleJustInTimeSubmit = () => {
    setIsSaving(true);

    // Simulate saving with a delay
    setTimeout(() => {
      onSave({ justInTimeEnabled, selectedSession });
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[450px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white shadow-2xl">
          <AnimatePresence>
            {showSuccess ? (
              <motion.div
                className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <Check className="size-8 text-white" />
                </motion.div>
                <motion.h3
                  className="mb-2 text-xl font-bold text-green-800"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Settings Saved!
                </motion.h3>
                <motion.p
                  className="text-green-700"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Your Just In Time settings have been updated successfully.
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
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-white/10" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-white/20 p-2">
                        <Clock className="size-5" />
                      </div>
                      <Dialog.Title className="text-lg font-semibold">
                        Just In Time Settings
                      </Dialog.Title>
                    </div>
                    <Dialog.Close asChild>
                      <motion.button
                        className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
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
                    className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Zap className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Just In Time
                        </h3>
                        <p className="text-sm text-gray-600">
                          Make your webinar available to viewers just before the
                          scheduled time.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Toggle Just In Time Session */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                          <Play className="size-4 text-blue-600" />
                        </div>
                        <Label className="font-medium">
                          Enable Just In Time
                        </Label>
                      </div>
                      <Switch
                        checked={justInTimeEnabled}
                        onCheckedChange={setJustInTimeEnabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          justInTimeEnabled ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <motion.span
                          className={`absolute left-1 block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                            justInTimeEnabled
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          }`}
                        />
                      </Switch>
                    </div>
                  </div>

                  {/* Session Selection */}
                  <div className="mb-6">
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      First session available within
                    </Label>
                    <Select
                      value={selectedSession}
                      onValueChange={setSelectedSession}
                      className="w-full"
                    >
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
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
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <motion.button
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white ${
                        isSaving
                          ? 'bg-blue-400'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={handleJustInTimeSubmit}
                      disabled={isSaving}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            className="size-4 rounded-full border-2 border-white border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Changes</span>
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

export default JustInTimeModal;
