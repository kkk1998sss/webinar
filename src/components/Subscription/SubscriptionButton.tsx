'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useSession } from 'next-auth/react';

// Add Razorpay type definition
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

interface SubscriptionButtonProps {
  planType: 'FOUR_DAY' | 'SIX_MONTH' | 'PAID_WEBINAR';
  amount: number;
  webinarId?: string;
  onSuccess?: () => void; // NEW: optional callback for payment success
}

export const SubscriptionButton = ({
  planType,
  amount,
  webinarId,
  onSuccess,
}: SubscriptionButtonProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const verifyPayment = async (response: RazorpayPaymentResponse) => {
    try {
      const verificationResponse = await fetch(
        '/api/razorpay/payments/verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            planType,
            amount,
            webinarId,
          }),
        }
      );

      if (!verificationResponse.ok) {
        const error = await verificationResponse.json();
        throw new Error(error.message || 'Payment verification failed');
      }

      return await verificationResponse.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  };

  const handleSubscription = async () => {
    if (!session?.user) {
      toast.error('Please login to continue');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating payment:', { planType, amount, webinarId });

      const response = await fetch('/api/razorpay/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, amount, webinarId }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (!data.key || !data.order) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response data from server');
      }

      const { key, order } = data;
      console.log('Payment order created:', { key, order });

      const options: RazorpayOptions = {
        key,
        amount: order.amount,
        currency: 'INR',
        name: `${planType === 'FOUR_DAY' ? '3-Day' : '6-Months Premium'} Subscription`,
        description:
          planType === 'FOUR_DAY'
            ? '3-Day Access'
            : '6-Months Premium Subscription',
        order_id: order.id,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            await verifyPayment(response);
            toast.success('Payment successful!');
            setIsRedirecting(true);
            // Wait for 2 seconds to show the success state
            await new Promise((resolve) => setTimeout(resolve, 2000));
            if (onSuccess) {
              onSuccess();
            } else {
              router.push('/dashboard-free');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: session.user.name || '',
          email: session.user.email || '',
          contact: session.user.phoneNumber || session.user.mobile || '',
        },
        theme: { color: '#3B82F6' },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.success', () => {
        router.refresh();
      });
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Payment initialization failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              className="text-primary dark:text-primary-dark mx-auto size-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Payment Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        onClick={handleSubscription}
        disabled={isLoading}
        className={`w-full rounded-lg bg-gradient-to-r from-red-600 to-yellow-400 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800${
          isLoading
            ? 'cursor-not-allowed bg-gray-400'
            : 'hover:scale-105 hover:shadow-xl'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="mr-2 size-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          <span className="text-sm md:text-base">
            {planType === 'SIX_MONTH'
              ? 'Update to 6 months subscription at ₹ 699'
              : `Subscribe for ₹ ${amount}`}
          </span>
        )}
      </button>
    </>
  );
};
