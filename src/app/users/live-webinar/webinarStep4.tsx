import { Dispatch, SetStateAction } from 'react';

import { WebinarFormData } from '@/types/user';

type NotificationKey =
  | 'confirmation'
  | 'oneDayReminder'
  | 'thirtyMinuteReminder';

// interface NotificationState {
//   confirmation: boolean;
//   oneDayReminder: boolean;
//   thirtyMinuteReminder: boolean;
// }

interface WebinarSettingsProps {
  formData: WebinarFormData;
  setFormData: Dispatch<SetStateAction<WebinarFormData>>;
}

const WebinarSettings = ({ formData, setFormData }: WebinarSettingsProps) => {
  const toggleEmailNotification = (key: NotificationKey) => {
    setFormData((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: !prev.emailNotifications[key],
      },
    }));
  };

  const toggleTextNotification = (key: NotificationKey) => {
    setFormData((prev) => ({
      ...prev,
      textNotifications: {
        ...prev.textNotifications,
        [key]: !prev.textNotifications[key],
      },
    }));
  };

  return (
    <div className="">
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Webinar Email Notifications
        </h2>
        {(
          [
            'confirmation',
            'oneDayReminder',
            'thirtyMinuteReminder',
          ] as NotificationKey[]
        ).map((item) => (
          <div key={item} className="mb-2 flex items-center justify-between">
            <span>{item.replace(/([A-Z])/g, ' $1')}</span>
            <button
              className={`rounded px-4 py-1 text-white ${
                formData.emailNotifications[item]
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
              onClick={() => toggleEmailNotification(item)}
            >
              {formData.emailNotifications[item] ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Webinar Text Message Notifications
        </h2>
        {(
          [
            'confirmation',
            'oneDayReminder',
            'thirtyMinuteReminder',
          ] as NotificationKey[]
        ).map((item) => (
          <div key={item} className="mb-2 flex items-center justify-between">
            <span>{item.replace(/([A-Z])/g, ' $1')}</span>
            <button
              className={`rounded px-4 py-1 text-white ${
                formData.textNotifications[item] ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              onClick={() => toggleTextNotification(item)}
            >
              {formData.textNotifications[item] ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Webinar Integrations</h2>
        <select
          className="w-full rounded border p-2"
          value={formData.integration}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              integration: e.target.value,
            }))
          }
        >
          <option value="">Select an Integration</option>
          <option value="ActiveCampaign">ActiveCampaign</option>
          <option value="Aweber">Aweber</option>
          <option value="ConvertKit">ConvertKit</option>
        </select>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Webinar Sharing</h2>
        <div className="mb-3 flex items-center">
          <span className="mr-3">Enable Sharing</span>
          <input
            type="checkbox"
            className="toggle-checkbox"
            checked={formData.webinarSharing.enabled}
            onChange={() =>
              setFormData((prev) => ({
                ...prev,
                webinarSharing: {
                  ...prev.webinarSharing,
                  enabled: !prev.webinarSharing.enabled,
                },
              }))
            }
          />
        </div>
        <input
          type="text"
          className="mb-2 w-full rounded border p-2"
          placeholder="Sharing by Name"
          value={formData.webinarSharing.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              webinarSharing: {
                ...prev.webinarSharing,
                name: e.target.value,
              },
            }))
          }
        />
        <input
          type="text"
          className="w-full rounded border p-2"
          placeholder="Sharing URL"
          value={formData.webinarSharing.url}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              webinarSharing: {
                ...prev.webinarSharing,
                url: e.target.value,
              },
            }))
          }
        />
      </div>

      {/* Footer Buttons */}
      {/* <div className="flex justify-between">
        <div>
          <Button className="bg-red-200 text-red-700 hover:bg-red-600 hover:text-white mr-2">
            Delete
          </Button>
          <Button className="bg-green-200 text-green-700 hover:bg-green-600 hover:text-white">
            Clone
          </Button>
        </div>
        <div>
          <Button
            className="bg-green-200 text-green-700 hover:bg-green-600 hover:text-white mr-2"
            // Saving will now be done from the final step
            onClick={() => console.log("Save clicked")}
          >
            Save
          </Button>
          <Button className="bg-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white">
            Complete
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default WebinarSettings;
