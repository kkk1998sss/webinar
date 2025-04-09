'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type UserData = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string; // 1. Added phone here
};

export default function EditUser() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/register/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          }
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      phoneNumber: formData.get('phoneNumber'), // 2. Include phone in request
    };

    const res = await fetch(`/api/register/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push('/admin/users');
    }
  };

  if (!user) {
    return <div className="p-6">Loading user data...</div>;
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          defaultValue={user.name}
          className="w-full rounded border p-2"
          placeholder="Name"
        />
        <input
          name="email"
          defaultValue={user.email}
          className="w-full rounded border p-2"
          placeholder="Email"
        />
        <input
          name="phoneNumber"
          defaultValue={user.phoneNumber || ''}
          className="w-full rounded border p-2"
          placeholder="Phone Number"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Update
        </button>
      </form>
    </div>
  );
}
