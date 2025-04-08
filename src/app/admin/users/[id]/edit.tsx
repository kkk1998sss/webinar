'use client';
export default function EditUser() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Edit User</h1>
      <form className="space-y-4">
        <input defaultValue="John Doe" className="w-full rounded border p-2" />
        <input
          defaultValue="john@example.com"
          className="w-full rounded border p-2"
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Update
        </button>
      </form>
    </div>
  );
}
