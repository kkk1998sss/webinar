import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Mail, MessageSquare, Share2, Zap } from 'lucide-react';

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Webinar Settings
        </h2>
        <p className="mt-2 text-gray-600">
          Customize your webinar notifications and integrations
        </p>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Email Notifications */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          variants={itemVariants}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <Mail className="size-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Email Notifications
            </h3>
          </div>

          <div className="space-y-4">
            {(
              [
                'confirmation',
                'oneDayReminder',
                'thirtyMinuteReminder',
              ] as NotificationKey[]
            ).map((item) => (
              <motion.div
                key={item}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-all duration-300 hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium text-gray-700">
                  {item
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </span>
                <motion.button
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                    formData.emailNotifications[item]
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => toggleEmailNotification(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-md ${
                      formData.emailNotifications[item] ? 'left-5' : 'left-0.5'
                    }`}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Text Notifications */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          variants={itemVariants}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
              <MessageSquare className="size-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Text Notifications
            </h3>
          </div>

          <div className="space-y-4">
            {(
              [
                'confirmation',
                'oneDayReminder',
                'thirtyMinuteReminder',
              ] as NotificationKey[]
            ).map((item) => (
              <motion.div
                key={item}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-all duration-300 hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium text-gray-700">
                  {item
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </span>
                <motion.button
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                    formData.textNotifications[item]
                      ? 'bg-purple-500'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => toggleTextNotification(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-md ${
                      formData.textNotifications[item] ? 'left-5' : 'left-0.5'
                    }`}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Integrations */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          variants={itemVariants}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
              <Zap className="size-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Webinar Integrations
            </h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white p-3 pr-10 text-gray-700 shadow-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                <option value="Mailchimp">Mailchimp</option>
                <option value="HubSpot">HubSpot</option>
                <option value="Salesforce">Salesforce</option>
                <option value="Zapier">Zapier</option>
                <option value="Slack">Slack</option>
                <option value="MicrosoftTeams">Microsoft Teams</option>
                <option value="Zoom">Zoom</option>
                <option value="GoogleCalendar">Google Calendar</option>
                <option value="Calendly">Calendly</option>
                <option value="Stripe">Stripe</option>
                <option value="PayPal">PayPal</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg
                  className="size-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {formData.integration && (
              <motion.div
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.integration} integration selected
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Your webinar data will be synchronized with{' '}
                  {formData.integration}.
                  {formData.integration === 'Zapier' &&
                    ' You can connect to 3000+ apps.'}
                  {formData.integration === 'Slack' &&
                    ' Notifications will be sent to your Slack workspace.'}
                  {formData.integration === 'MicrosoftTeams' &&
                    ' Webinar details will be added to your Teams calendar.'}
                  {formData.integration === 'Zoom' &&
                    ' Your webinar will be automatically scheduled in Zoom.'}
                  {formData.integration === 'GoogleCalendar' &&
                    ' Webinar will be added to your Google Calendar.'}
                  {formData.integration === 'Calendly' &&
                    ' Attendees can schedule through your Calendly link.'}
                  {formData.integration === 'Stripe' &&
                    ' Payment processing will be handled through Stripe.'}
                  {formData.integration === 'PayPal' &&
                    ' Payment processing will be handled through PayPal.'}
                  {![
                    'Zapier',
                    'Slack',
                    'MicrosoftTeams',
                    'Zoom',
                    'GoogleCalendar',
                    'Calendly',
                    'Stripe',
                    'PayPal',
                  ].includes(formData.integration) &&
                    ' Attendee data will be synchronized with your account.'}
                </p>
              </motion.div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {[
                {
                  name: 'ActiveCampaign',
                  icon: '📧',
                  color: 'bg-blue-100 text-blue-700',
                },
                {
                  name: 'Aweber',
                  icon: '📨',
                  color: 'bg-red-100 text-red-700',
                },
                {
                  name: 'ConvertKit',
                  icon: '📬',
                  color: 'bg-purple-100 text-purple-700',
                },
                {
                  name: 'Mailchimp',
                  icon: '📩',
                  color: 'bg-orange-100 text-orange-700',
                },
                {
                  name: 'HubSpot',
                  icon: '🔄',
                  color: 'bg-pink-100 text-pink-700',
                },
                {
                  name: 'Salesforce',
                  icon: '☁️',
                  color: 'bg-indigo-100 text-indigo-700',
                },
                {
                  name: 'Zapier',
                  icon: '⚡',
                  color: 'bg-yellow-100 text-yellow-700',
                },
                {
                  name: 'Slack',
                  icon: '💬',
                  color: 'bg-gray-100 text-gray-700',
                },
                {
                  name: 'MicrosoftTeams',
                  icon: '👥',
                  color: 'bg-blue-100 text-blue-700',
                },
                {
                  name: 'Zoom',
                  icon: '🎥',
                  color: 'bg-green-100 text-green-700',
                },
                {
                  name: 'GoogleCalendar',
                  icon: '📅',
                  color: 'bg-red-100 text-red-700',
                },
                {
                  name: 'Calendly',
                  icon: '📆',
                  color: 'bg-blue-100 text-blue-700',
                },
                {
                  name: 'Stripe',
                  icon: '💳',
                  color: 'bg-indigo-100 text-indigo-700',
                },
                {
                  name: 'PayPal',
                  icon: '💰',
                  color: 'bg-blue-100 text-blue-700',
                },
              ].map((integration) => (
                <motion.div
                  key={integration.name}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 text-center transition-all duration-300 hover:shadow-md ${
                    formData.integration === integration.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      integration: integration.name,
                    }))
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{integration.icon}</span>
                    <span
                      className={`mt-1 text-xs font-medium ${integration.color}`}
                    >
                      {integration.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Webinar Sharing */}
        <motion.div
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          variants={itemVariants}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
              <Share2 className="size-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Webinar Sharing
            </h3>
          </div>

          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-all duration-300 hover:bg-gray-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm font-medium text-gray-700">
                Enable Sharing
              </span>
              <motion.button
                className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                  formData.webinarSharing.enabled
                    ? 'bg-amber-500'
                    : 'bg-gray-300'
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    webinarSharing: {
                      ...prev.webinarSharing,
                      enabled: !prev.webinarSharing.enabled,
                    },
                  }))
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-md ${
                    formData.webinarSharing.enabled ? 'left-5' : 'left-0.5'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </motion.div>

            <motion.div
              className="rounded-lg border border-gray-100 p-3 transition-all duration-300 hover:bg-gray-50"
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="text"
                className="mb-3 w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Status Indicators */}
      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.div
          className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="size-4" />
          <span>Email notifications configured</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm text-purple-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare className="size-4" />
          <span>Text notifications configured</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm text-green-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="size-4" />
          <span>Integration selected</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 className="size-4" />
          <span>
            Sharing {formData.webinarSharing.enabled ? 'enabled' : 'disabled'}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WebinarSettings;
