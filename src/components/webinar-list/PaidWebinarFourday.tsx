import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, IndianRupee, MapPin } from 'lucide-react';
import Image from 'next/image';
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

export function PaidWebinarFourday({ webinars, handleJoinWebinar }: Props) {
  const [paidWebinarIds, setPaidWebinarIds] = useState<string[]>([]);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [loadingWebinarId, setLoadingWebinarId] = useState<string | null>(null);
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

    setLoadingWebinarId(webinar.id);
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
            setLoadingWebinarId(null);
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
        setLoadingWebinarId(null);
      });
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(errorMessage);
      setLoadingWebinarId(null);
    }
  };

  if (webinars.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-8 flex justify-center">
          <h2 className="rounded-lg bg-[#5D4037] px-8 py-2 text-3xl font-bold text-white shadow-xl">
            Upcoming Events
          </h2>
        </div>
        <div className="text-center text-gray-400">
          No paid webinars available at the moment.
        </div>
      </div>
    );
  }

  return (
    <>
      <RazorpayScript />
      <div className="w-full">
        <div className="mb-8 flex justify-center">
          <h2 className="rounded-lg bg-[#5D4037] px-8 py-2 text-3xl font-bold text-white shadow-xl">
            Upcoming Events
          </h2>
        </div>
        <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto px-4 pb-4">
          {webinars.map((webinar) => (
            <motion.div
              key={webinar.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.04,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="group relative flex w-[90vw] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900/80 to-slate-800/80 shadow-xl transition-all duration-300 hover:border-yellow-400 hover:shadow-2xl md:w-[520px] md:flex-row"
              style={{ minHeight: 260 }}
            >
              <div className="flex shrink-0 items-center justify-center bg-slate-900 md:w-1/3">
                <Image
                  src="/assets/Shree.png"
                  alt="Event Speaker"
                  width={160}
                  height={160}
                  className="size-40 rounded-full border-4 border-white object-cover shadow-lg transition-all duration-300 group-hover:border-yellow-400 md:size-32"
                />
              </div>

              <div className="flex flex-col justify-between p-4 md:w-2/3">
                <div className="grow">
                  <div className="mb-2 flex items-center justify-center">
                    <span className="rounded-full bg-purple-700 px-4 py-1 text-xs font-bold tracking-wide text-yellow-300 shadow">
                      {webinar.webinarTitle.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-1 gap-2 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-yellow-300" />
                      <span className="font-semibold">Date:</span>
                      <span>
                        {new Date(webinar.webinarDate).toLocaleDateString(
                          'en-US',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-yellow-300" />
                      <span className="font-semibold">Time:</span>
                      <span>{webinar.webinarTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-yellow-300" />
                      <span className="font-semibold">Venue:</span>
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="size-4 text-yellow-300" />
                      <span className="font-semibold">Price:</span>
                      <span className="text-lg font-bold text-yellow-300">
                        ₹{webinar.paidAmount}/-
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex justify-center">
                  {paidWebinarIds.includes(webinar.id) ? (
                    <button
                      onClick={() => handleJoinWebinar(webinar.id)}
                      className="rounded-lg border-2 border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2 font-semibold text-slate-900 shadow-md transition-transform duration-200 hover:scale-105 hover:from-yellow-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    >
                      Click here to join
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayment(webinar)}
                      disabled={loadingWebinarId !== null}
                      className="relative overflow-hidden rounded-lg border-2 border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2 font-semibold text-slate-900 shadow-md transition-transform duration-200 hover:scale-105 hover:from-yellow-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="relative z-10">
                        {loadingWebinarId === webinar.id
                          ? 'Processing...'
                          : 'Click here to register'}
                      </span>
                      <span className="absolute left-0 top-0 h-full w-0 bg-yellow-200 opacity-20 transition-all duration-500 group-hover:w-full" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
