import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Switch } from '@radix-ui/react-switch';
import { X } from 'lucide-react';

import CustomSelect from '../ui/CustomSelect';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
  const [instantWatchEnabled, setInstantWatchEnabled] = useState(true);
  const [selectedSession, setSelectedSession] = useState('session-1');
  const options = [
    'Instant watch session 1',
    'Instant watch session 2',
    'Instant watch session 3',
  ];

  const handleInstantWatchSubmit = () => {
    // const payload = {
    //   instantWatchEnabled,
    //   selectedSession,
    // };

    // console.log('Instant Watch Payload:', payload);
    // onClose();
    onSave({ instantWatchEnabled, selectedSession });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-2">
            <Dialog.Title className="text-lg font-semibold">
              Instant Watch Settings
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-600 hover:text-black">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Toggle Instant Watch Session */}
          <div className="mt-4 flex items-center justify-between">
            <Label>Toggle Instant Watch Session</Label>
            <Switch
              checked={instantWatchEnabled}
              onCheckedChange={setInstantWatchEnabled}
              className="relative h-6 w-10 rounded-full bg-gray-300 transition"
            >
              <span
                className={`absolute top-1 block size-4 rounded-full bg-white transition-all ${
                  instantWatchEnabled
                    ? 'translate-x-5 bg-blue-500'
                    : 'translate-x-1'
                }`}
              />
            </Switch>
          </div>

          {/* Session Dropdown */}
          <div className="mt-4 flex items-center justify-between">
            <Label>Session</Label>
            <CustomSelect
              value={selectedSession}
              onChange={setSelectedSession}
              options={options}
              width="w-60"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button
              className="bg-blue-500 text-white"
              onClick={handleInstantWatchSubmit}
            >
              Save
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InstantWatchModal;
