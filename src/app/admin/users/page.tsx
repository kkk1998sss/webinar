'use client';

import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { PlusIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/register')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const deleteUser = async (id: string) => {
    await fetch(`/api/register/${id}`, { method: 'DELETE' });
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">All Users</h1>
        <Link
          href="/users/live-webinar"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          <PlusIcon />
          Create
        </Link>
      </div>

      <Separator.Root className="h-px w-full bg-gray-200" />

      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <ScrollArea.Root className="w-full overflow-hidden rounded">
          <ScrollArea.Viewport className="w-full">
            <table className="w-full rounded border border-gray-200 text-sm text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">S.No</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-t transition hover:bg-gray-50"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phoneNumber}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="flex items-center space-x-3 px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </Link>

                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button className="flex items-center gap-1 text-red-600 hover:text-red-700">
                            <FaTrash />
                            {/* <TrashIcon /> */}
                            {/* Delete */}
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            side="top"
                            align="center"
                            className="z-50 w-64 rounded border bg-white p-4 text-sm shadow-lg"
                          >
                            <p className="mb-3 text-gray-800">
                              Are you sure you want to delete this webinar?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Popover.Close asChild>
                                <button className="text-gray-500 hover:underline">
                                  Cancel
                                </button>
                              </Popover.Close>
                              <button
                                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                onClick={() => deleteUser(user.id)}
                              >
                                Confirm
                              </button>
                            </div>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="vertical"
            className="w-2 bg-gray-100"
          >
            <ScrollArea.Thumb className="rounded bg-gray-400" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      )}
    </div>
  );
}
