'use client';

import { useState } from 'react';

import { Link } from '@/lib/i18n';
import * as m from '@/paraglide/messages';

const useCasesDropdown = [
  { href: '/use-cases/startups', label: 'Startups' },
  { href: '/use-cases/marketing', label: 'Marketing Teams' },
  { href: '/use-cases/developers', label: 'Developers' },
];

export const UseCasesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button className="cursor-pointer px-4 py-2 text-sm font-medium hover:underline">
        {m.use_cases()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 w-48 rounded-md border bg-white shadow-lg">
          {useCasesDropdown.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
