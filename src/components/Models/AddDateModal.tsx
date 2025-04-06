import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react'; // For close button icon

import { Button } from '@/components/ui/button';
import CustomSelect from '@/components/ui/CustomSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [time, setTime] = useState('');
  const [period, setPeriod] = useState('AM');
  const [timeZone, setTimeZone] = useState('America/Los_Angeles');

  const timeZoneOptions = [
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  const handleSave = () => {
    if (date && time) {
      onSave({ date, time, period, timeZone });
      onClose();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-2">
            <Dialog.Title className="text-lg font-semibold">
              Add date for webinar
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-600 hover:text-black">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Date Input */}
          <div className="mt-4 space-y-3">
            <Label>Day</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* Time Input */}
            <Label>Time</Label>
            <div className="flex space-x-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <CustomSelect
                value={period}
                onChange={setPeriod}
                options={['AM', 'PM']}
                width={''}
              />
            </div>

            {/* Timezone Input */}
            <Label>Time Zone</Label>
            <CustomSelect
              value={timeZone}
              onChange={setTimeZone}
              options={timeZoneOptions}
              width={''}
            />

            {/* Save Button */}
            <Button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white hover:bg-blue-800"
            >
              Add webinar date
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddDateModal;
