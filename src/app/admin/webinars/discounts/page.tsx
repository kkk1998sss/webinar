'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPercent, FaRupeeSign, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Webinar {
  id: string;
  webinarTitle: string;
  isPaid: boolean;
  paidAmount: number | null;
  discountPercentage: number | null;
  discountAmount: number | null;
}

export default function ManageDiscounts() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const response = await fetch('/api/webinar');
      const data = await response.json();
      if (data.success) {
        setWebinars(data.webinars);
      }
    } catch {
      setError('Failed to fetch webinars');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountUpdate = async (
    webinarId: string,
    discountPercentage: number,
    discountAmount: number
  ) => {
    setSaving(webinarId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/webinar/${webinarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discountPercentage: discountPercentage || null,
          discountAmount: discountAmount || null,
        }),
      });

      if (response.ok) {
        setSuccess(`Discount updated for webinar ${webinarId}`);
        fetchWebinars(); // Refresh the list
      } else {
        setError('Failed to update discount');
      }
    } catch {
      setError('An error occurred while updating discount');
    } finally {
      setSaving(null);
    }
  };

  const calculateDiscountedPrice = (
    originalPrice: number,
    discountAmount: number
  ) => {
    return Math.max(0, originalPrice - discountAmount);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading webinars...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Manage Webinar Discounts
        </h1>
        <Link
          href="/admin/webinars"
          className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Webinars
        </Link>
      </div>

      {error && (
        <motion.div
          className="mb-4 rounded-lg bg-red-50 p-4 text-red-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          className="mb-4 rounded-lg bg-green-50 p-4 text-green-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {webinars.map((webinar) => (
          <motion.div
            key={webinar.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {webinar.webinarTitle}
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor={`original-price-${webinar.id}`}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Original Price
                </label>
                <div className="rounded-lg bg-gray-50 p-3">
                  <span className="text-lg font-bold text-gray-800">
                    ₹{webinar.paidAmount || 0}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`discount-percentage-${webinar.id}`}
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    <FaPercent className="mr-1 inline" /> Discount %
                  </label>
                  <input
                    id={`discount-percentage-${webinar.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    defaultValue={webinar.discountPercentage || 0}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="0"
                    onChange={(e) => {
                      const percentage = parseFloat(e.target.value) || 0;
                      const originalPrice = webinar.paidAmount || 0;
                      const discountAmount = (originalPrice * percentage) / 100;

                      // Update the discount amount field
                      const discountAmountInput =
                        e.target.parentElement?.parentElement?.querySelector(
                          'input[placeholder="0.00"]'
                        ) as HTMLInputElement;
                      if (discountAmountInput) {
                        discountAmountInput.value = discountAmount.toFixed(2);
                      }
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`discount-amount-${webinar.id}`}
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    <FaRupeeSign className="mr-1 inline" /> Discount ₹
                  </label>
                  <input
                    id={`discount-amount-${webinar.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={webinar.discountAmount || 0}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`final-price-${webinar.id}`}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Final Price
                </label>
                <div className="rounded-lg bg-green-50 p-3">
                  <span className="text-lg font-bold text-green-700">
                    ₹
                    {webinar.paidAmount && webinar.discountAmount
                      ? calculateDiscountedPrice(
                          webinar.paidAmount,
                          webinar.discountAmount
                        ).toFixed(0)
                      : webinar.paidAmount || 0}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const discountPercentageInput = document.querySelector(
                    `input[placeholder="0"]`
                  ) as HTMLInputElement;
                  const discountAmountInput = document.querySelector(
                    `input[placeholder="0.00"]`
                  ) as HTMLInputElement;

                  const discountPercentage = parseFloat(
                    discountPercentageInput?.value || '0'
                  );
                  const discountAmount = parseFloat(
                    discountAmountInput?.value || '0'
                  );

                  handleDiscountUpdate(
                    webinar.id,
                    discountPercentage,
                    discountAmount
                  );
                }}
                disabled={saving === webinar.id}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {saving === webinar.id ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaSave className="mr-2" />
                    Update Discount
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
