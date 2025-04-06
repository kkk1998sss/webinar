import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = DialogPrimitive.Content;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="dialog-header">{children}</div>
);
export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="dialog-title">{children}</h2>
);
