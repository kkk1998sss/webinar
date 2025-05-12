'use client';

import { FaCalendarAlt, FaHome, FaUsers, FaVideo } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: FaHome },
  { name: 'Webinars', href: '/admin/webinars', icon: FaCalendarAlt },
  { name: 'Videos', href: '/admin/videos', icon: FaVideo },
  { name: 'Users', href: '/admin/users', icon: FaUsers },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 size-5 shrink-0 ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
