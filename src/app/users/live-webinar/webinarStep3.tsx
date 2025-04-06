import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

const WebinarWatchRoom = () => {
  return (
    <div className="">
      <div className="mt-8 text-center">
        <h2 className="text-3xl font-semibold">Watch room</h2>
        <p className="text-gray-600">Build your watch room on WebinarKit</p>
      </div>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className="max-w-8xl mt-6 w-full cursor-pointer rounded-lg bg-gray-700 p-6 text-center text-white shadow-lg transition hover:opacity-90">
            <h3 className="text-xl font-semibold">
              Build and host your watch room on WebinarKit
            </h3>
            <p className="mt-1 text-sm">Click to open watch room builder</p>
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-bold">
              Watch Room Builder
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Customize your watch room here.
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="rounded-md bg-gray-300 px-4 py-2">
                  Close
                </button>
              </Dialog.Close>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white">
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Action Buttons */}
      {/* <div className="mt-6 flex items-center justify-between gap-3">
          <div className="gap-3">
            <Button className=" bg-red-200 text-red-700 hover:bg-red-600 hover:text-white">
              Delete
            </Button>
            <Button className="bg-green-200 text-green-700 hover:bg-green-600 hover:text-white">
              Clone
            </Button>
          </div>
        </div> */}
    </div>
  );
};

export default WebinarWatchRoom;
