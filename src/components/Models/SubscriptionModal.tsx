// components/subscription/SubscriptionModal.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

import { ChoosePlan } from '../Subscription/ChoosePlan';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinarId?: string;
}

export const SubscriptionModal = ({
  open,
  onOpenChange,
  webinarId,
}: SubscriptionModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm dark:bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-2xl font-bold dark:text-slate-100">
              Choose Your Subscription Plan
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
              <Cross2Icon className="size-6" />
            </Dialog.Close>
          </div>

          <ChoosePlan webinarId={webinarId} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
