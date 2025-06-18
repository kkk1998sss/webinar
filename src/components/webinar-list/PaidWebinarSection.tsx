import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Webinar } from '@/types/user';

interface Props {
  webinars: Webinar[];
  handleJoinWebinar: (id: string) => void;
}

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function PaidWebinarSection({ webinars, handleJoinWebinar }: Props) {
  const [paidWebinarIds, setPaidWebinarIds] = useState<string[]>([]);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Razorpay script loader
  const RazorpayScript = () => (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      onLoad={() => {
        console.log('Razorpay script loaded successfully');
        setIsRazorpayLoaded(true);
      }}
      onError={() => {
        console.error('Failed to load Razorpay script');
        toast.error('Failed to load payment gateway. Please refresh the page.');
      }}
    />
  );

  const getPlanType = (webinar: Webinar): 'FOUR_DAY' | 'SIX_MONTH' => {
    if (webinar.paidAmount && webinar.paidAmount >= 1000) return 'SIX_MONTH';
    return 'FOUR_DAY';
  };

  const handlePaymentSuccess = (id: string) => {
    setPaidWebinarIds((prev) => [...prev, id]);
    toast.success('Payment successful!');
    router.refresh();
  };

  const handlePayment = async (webinar: Webinar) => {
    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is still loading. Please wait...');
      return;
    }

    if (!session?.user) {
      toast.error('Please login to continue');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    const planType = getPlanType(webinar);

    try {
      // Create order on backend
      const res = await fetch('/api/razorpay/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          amount: webinar.paidAmount,
          webinarId: webinar.id,
          name: session.user.name,
          email: session.user.email,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const data = await res.json();
      console.log('Order created:', data);

      if (!data.order || !data.order.id) {
        throw new Error('Invalid response from server');
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: `${webinar.webinarTitle
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}`,
        description: `Access for ${webinar.webinarTitle}`,
        order_id: data.order.id,
        handler: async function (response: RazorpayPaymentResponse) {
          try {
            console.log('Payment response:', response);
            const verifyRes = await fetch('/api/razorpay/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planType,
                amount: webinar.paidAmount,
                webinarId: webinar.id,
              }),
            });

            const verifyData = await verifyRes.json();
            console.log('Verification response:', verifyData);

            if (verifyData.success) {
              handlePaymentSuccess(webinar.id);
            } else {
              throw new Error(
                verifyData.message || 'Payment verification failed'
              );
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Payment verification failed';
            toast.error(errorMessage);
          }
        },
        prefill: {
          name: session.user.name || '',
          email: session.user.email || '',
          contact: session.user.phoneNumber || '',
        },
        theme: { color: '#f59e42' },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setIsLoading(false);
          },
        },
      };

      console.log('Opening Razorpay with options:', options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Using type assertion to handle Razorpay's payment.failed event
      (
        razorpay as unknown as {
          on: (
            event: 'payment.failed',
            callback: (response: { error: { description: string } }) => void
          ) => void;
        }
      ).on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(
          `Payment failed: ${response.error?.description || 'Unknown error'}`
        );
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  if (webinars.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-lg dark:border-yellow-700 dark:bg-yellow-50/10"
      >
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 sm:p-4 dark:from-yellow-600 dark:to-orange-700">
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            💰 Paid Webinars
          </h3>
        </div>
        <div className="p-6 text-center text-gray-500 dark:text-slate-400">
          No paid webinars available.
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <RazorpayScript />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-lg dark:border-yellow-700 dark:bg-yellow-50/10"
      >
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 sm:p-4 dark:from-yellow-600 dark:to-orange-700">
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            💰 Paid Webinars
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-slate-400">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-500 sm:table-cell dark:text-slate-400">
                  Date
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-500 sm:table-cell dark:text-slate-400">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-slate-400">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {webinars.map((webinar, index) => (
                <motion.tr
                  key={webinar.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border-b border-gray-100 transition-colors duration-200 hover:bg-yellow-50 dark:border-yellow-700 dark:hover:bg-yellow-100/10"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800 dark:text-slate-200">
                      {webinar.webinarTitle.charAt(0).toUpperCase() +
                        webinar.webinarTitle.slice(1)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 sm:table-cell dark:text-slate-400">
                    {webinar.webinarDate}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {webinar.webinarTime}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                      <span className="mr-1 flex size-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                      Upcoming
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-yellow-700 dark:text-yellow-400">
                    ₹{webinar?.paidAmount}
                  </td>
                  <td className="px-4 py-3">
                    {paidWebinarIds.includes(webinar.id) ? (
                      <button
                        onClick={() => handleJoinWebinar(webinar.id)}
                        className="w-full rounded-md bg-gradient-to-r from-yellow-500 to-orange-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:from-yellow-600 hover:to-orange-700 sm:w-auto dark:from-yellow-600 dark:to-orange-700 dark:hover:from-yellow-700 dark:hover:to-orange-800"
                      >
                        Join Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayment(webinar)}
                        disabled={isLoading}
                        className="w-full rounded-md bg-gradient-to-r from-yellow-500 to-orange-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:from-yellow-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:from-yellow-600 dark:to-orange-700 dark:hover:from-yellow-700 dark:hover:to-orange-800"
                      >
                        {isLoading ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
