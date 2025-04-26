'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
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
  planType: 'FOUR_DAY' | 'SIX_MONTH';
  amount: number;
  webinarId?: string;
}

export const SubscriptionButton = ({
  planType,
  amount,
  webinarId,
}: SubscriptionButtonProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch('/api/razorpay/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, amount, webinarId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const { key, order } = await response.json();

      const options: RazorpayOptions = {
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'WebinarKit',
        description:
          planType === 'FOUR_DAY' ? '4-Day Access' : '6-Month Subscription',
        order_id: order.id,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            await verifyPayment(response);
            toast.success('Payment successful!');
            router.push('/users/live-webinar');
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: session.user.name || '',
          email: session.user.email || '',
          contact: session.user.phoneNumber || '',
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

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        onClick={handleSubscription}
        disabled={isLoading}
        className={`rounded-lg px-6 py-3 font-medium transition-colors duration-200 ${
          isLoading
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="mr-3 size-5 animate-spin"
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
          `Subscribe for ₹${amount}`
        )}
      </button>
    </>
  );
};
