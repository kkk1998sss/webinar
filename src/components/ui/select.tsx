import React from 'react';

interface SelectProps extends React.HTMLProps<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  onValueChange,
  value,
  className,
  ...props
}) => {
  return (
    <select
      {...props}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`w-full rounded-md border border-gray-300 p-2 text-gray-700 shadow-sm focus:ring-blue-500 ${className}`}
    >
      {children}
    </select>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className,
}) => {
  return <div className={`relative ${className}`}>{children}</div>;
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`absolute top-full mt-1 w-full rounded-md border bg-white shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  className,
}) => {
  return (
    <option value={value} className={`p-2 hover:bg-gray-200 ${className}`}>
      {children}
    </option>
  );
};

interface SelectValueProps {
  value: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  value,
  className,
}) => {
  return <span className={className}>{value}</span>;
};
