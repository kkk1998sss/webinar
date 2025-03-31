'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

export function Switch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative h-6 w-12 rounded-full bg-gray-300 p-1 transition-all"
    >
      <SwitchPrimitives.Thumb className="block size-4 rounded-full bg-white transition-transform" />
    </SwitchPrimitives.Root>
  );
}
