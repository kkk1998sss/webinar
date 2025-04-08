'use client';
export default function CreateWebinar() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Create Webinar</h1>
      <form className="space-y-4">
        <input placeholder="Title" className="w-full rounded border p-2" />
        <input type="date" className="w-full rounded border p-2" />
        <button className="rounded bg-green-600 px-4 py-2 text-white">
          Create
        </button>
      </form>
    </div>
  );
}
