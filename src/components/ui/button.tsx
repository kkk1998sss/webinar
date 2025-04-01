import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-red-200 text-red-700 hover:bg-red-600 hover:text-white',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        soft: 'bg-soft text-soft-foreground hover:bg-soft/80', // Soft variant
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
      color: {
        crimson: 'bg-crimson text-crimson-foreground',
        indigo: 'bg-indigo-500 text-indigo-100', // Indigo color
        cyan: 'bg-cyan-500 text-cyan-100', // Cyan color
        orange: 'bg-orange-500 text-orange-100', // Orange color
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      color: 'crimson', // Default color
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, // Exclude color from ButtonHTMLAttributes
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  color?: 'crimson' | 'indigo' | 'cyan' | 'orange'; // Declare color prop explicitly
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, color, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
