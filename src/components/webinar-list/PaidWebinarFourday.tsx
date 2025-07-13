import { useEffect, useState } from 'react';
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

// Countdown Timer Component
function CountdownTimer({
  webinarDate,
  webinarTime,
}: {
  webinarDate: string;
  webinarTime: string;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      // Parse the webinar date (it's already a DateTime from the database)
      const webinarDateObj = new Date(webinarDate);

      // Parse the time string and combine with date
      let webinarDateTime: Date;

      if (webinarTime) {
        // Handle different time formats (e.g., "14:30", "1430", "2:30 PM")
        let timeString = webinarTime.toString();

        // If it's a 4-digit number (e.g., "1430"), convert to "14:30"
        if (/^\d{4}$/.test(timeString)) {
          timeString = `${timeString.slice(0, 2)}:${timeString.slice(2)}`;
        }

        // Create the full datetime by combining date and time
        const [hours, minutes] = timeString.split(':').map(Number);
        webinarDateTime = new Date(webinarDateObj);
        webinarDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      } else {
        // If no time specified, use the date as is
        webinarDateTime = webinarDateObj;
      }

      const difference = webinarDateTime.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [webinarDate, webinarTime]);

  return (
    <div className="mb-4 w-full">
      <div className="text-center">
        <div className="mb-2 text-xs font-bold text-blue-900">STARTS IN</div>
        <div className="flex justify-center gap-2">
          {timeLeft.days > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
                {timeLeft.days}
              </div>
              <span className="mt-1 text-xs font-medium text-blue-900">
                DAYS
              </span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <span className="mt-1 text-xs font-medium text-blue-900">
              HOURS
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <span className="mt-1 text-xs font-medium text-blue-900">
              MINUTES
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-yellow-500 text-sm font-bold text-white shadow-md md:size-10 md:text-base">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <span className="mt-1 text-xs font-medium text-blue-900">
              SECONDS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
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

export function PaidWebinarFourday({ webinars }: Props) {
  const [paidWebinarIds, setPaidWebinarIds] = useState<string[]>([]);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [loadingWebinarId, setLoadingWebinarId] = useState<string | null>(null);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  // Check user's payment history on component mount
  useEffect(() => {
    const checkPaymentHistory = async () => {
      if (!session?.user) {
        setIsLoadingPayments(false);
        return;
      }

      try {
        const response = await fetch('/api/razorpay/payments/user-payments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const paidIds = data.payments
            .filter(
              (payment: {
                status: string;
                planType: string;
                webinarId: string;
              }) =>
                payment.status === 'captured' &&
                payment.planType === 'PAID_WEBINAR' &&
                payment.webinarId
            )
            .map((payment: { webinarId: string }) => payment.webinarId);

          setPaidWebinarIds(paidIds);
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    checkPaymentHistory();
  }, [session?.user]);

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

  // For paid webinar page, always use PAID_WEBINAR plan type
  const getPlanType = (): 'FOUR_DAY' | 'SIX_MONTH' | 'PAID_WEBINAR' => {
    return 'PAID_WEBINAR';
  };

  const handlePaymentSuccess = (id: string) => {
    setPaidWebinarIds((prev) => [...prev, id]);
    toast.success('Payment successful!');
    // Redirect to thank you page instead of refreshing
    router.push('/thank-you');
  };

  const handleAlreadyPaid = () => {
    toast.success('Redirecting to thank you page...');
    router.push('/thank-you');
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
    const planType = getPlanType();

    // Debug logging
    console.log('Payment request data:', {
      planType,
      amount: webinar.paidAmount,
      webinarId: webinar.id,
      webinarTitle: webinar.webinarTitle,
    });

    try {
      // Create order on backend
      const res = await fetch('/api/razorpay/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          amount:
            webinar.paidAmount && webinar.discountAmount
              ? webinar.paidAmount - webinar.discountAmount
              : webinar.paidAmount || 0,
          webinarId: webinar.id,
          name: session.user.name,
          email: session.user.email,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Payment API error:', {
          status: res.status,
          statusText: res.statusText,
          error: error,
        });
        throw new Error(
          error.error || error.message || 'Failed to create order'
        );
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
                amount:
                  webinar.paidAmount && webinar.discountAmount
                    ? webinar.paidAmount - webinar.discountAmount
                    : webinar.paidAmount || 0,
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
          <h2 className="rounded-lg bg-gradient-to-r from-red-500 to-yellow-500 px-8 py-2 text-3xl font-bold text-white shadow-xl">
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
          <h2 className="rounded-lg bg-gradient-to-r from-red-500 to-yellow-500 px-8 py-2 text-3xl font-bold text-white shadow-xl">
            Upcoming Events
          </h2>
        </div>
        <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto p-6">
          {webinars.map((webinar) => (
            <motion.div
              key={webinar.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 6px 24px 0 rgba(59, 130, 246, 0.18)',
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="group relative flex w-[90vw] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-blue-100/40 shadow-md transition-all duration-300 hover:border-blue-400 hover:shadow-lg md:w-[520px]"
              style={{ minHeight: 260 }}
            >
              {/* Countdown Timer at the top */}
              <div className="w-full p-4">
                <CountdownTimer
                  webinarDate={webinar.webinarDate}
                  webinarTime={webinar.webinarTime}
                />
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-50/60 to-indigo-50/60 md:w-1/3">
                  <Image
                    src="/assets/Shree.png"
                    alt="Event Speaker"
                    width={160}
                    height={160}
                    className="size-40 rounded-full border-4 border-white object-cover shadow-md transition-all duration-300 group-hover:border-blue-400 md:size-32"
                  />
                </div>

                <div className="flex flex-col justify-between p-4 md:w-2/3">
                  <div className="grow">
                    <div className="mb-2 flex items-center justify-center">
                      <span className="rounded-full bg-gradient-to-r from-blue-300 to-indigo-200 px-4 py-1 text-xs font-bold tracking-wide text-blue-900 shadow-sm">
                        {webinar.webinarTitle.toUpperCase()}
                      </span>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-2 text-sm text-blue-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-blue-500" />
                        <span className="font-semibold">Date:</span>
                        <span>
                          {(() => {
                            // Check if we have scheduledDates with start and end dates
                            if (
                              webinar.scheduledDates &&
                              typeof webinar.scheduledDates === 'object'
                            ) {
                              const scheduledDates =
                                webinar.scheduledDates as unknown as {
                                  startDate: string;
                                  endDate: string;
                                };
                              if (
                                scheduledDates.startDate &&
                                scheduledDates.endDate
                              ) {
                                const startDate = new Date(
                                  scheduledDates.startDate
                                );
                                const endDate = new Date(
                                  scheduledDates.endDate
                                );

                                // Check if it's a multi-day event
                                if (
                                  startDate.toDateString() !==
                                  endDate.toDateString()
                                ) {
                                  const months = [
                                    'January',
                                    'February',
                                    'March',
                                    'April',
                                    'May',
                                    'June',
                                    'July',
                                    'August',
                                    'September',
                                    'October',
                                    'November',
                                    'December',
                                  ];
                                  const startStr = `${months[startDate.getMonth()]} ${startDate.getDate()}`;
                                  const endStr = `${months[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
                                  return `${startStr} - ${endStr}`;
                                }
                              }
                            }

                            // Fallback to single date
                            const date = new Date(webinar.webinarDate);
                            const months = [
                              'January',
                              'February',
                              'March',
                              'April',
                              'May',
                              'June',
                              'July',
                              'August',
                              'September',
                              'October',
                              'November',
                              'December',
                            ];
                            return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-blue-500" />
                        <span className="font-semibold">Time:</span>
                        <span>{webinar.webinarTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-blue-500" />
                        <span className="font-semibold">Venue:</span>
                        <span>Online</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="size-4 text-green-500" />
                        <span className="font-semibold">Price:</span>
                        <div className="flex flex-col">
                          {webinar.discountPercentage &&
                          webinar.discountPercentage > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{webinar.paidAmount}
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  ₹
                                  {webinar.paidAmount && webinar.discountAmount
                                    ? (
                                        webinar.paidAmount -
                                        webinar.discountAmount
                                      ).toFixed(0)
                                    : webinar.paidAmount}
                                </span>
                                <span className="rounded-full border border-green-200 bg-gradient-to-r from-green-400 to-blue-400 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                  -{webinar.discountPercentage.toFixed(0)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                                <span className="flex size-1 animate-pulse rounded-full bg-blue-400"></span>
                                Only available to first 10 members
                              </div>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-green-600">
                              ₹{webinar.paidAmount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">
                          Plan:
                        </span>
                        <span className="text-sm font-medium text-green-500">
                          Paid Webinar
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-center">
                    {isLoadingPayments ? (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-lg border-2 border-gray-400 bg-gray-400 px-6 py-2 font-semibold text-white shadow-md"
                      >
                        Loading...
                      </button>
                    ) : paidWebinarIds.includes(webinar.id) ? (
                      <button
                        onClick={handleAlreadyPaid}
                        className="rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-400 to-green-500 px-6 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                      >
                        Already Paid
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayment(webinar)}
                        disabled={loadingWebinarId !== null}
                        className="relative overflow-hidden rounded-lg border-2 border-red-400 bg-gradient-to-r from-red-400 to-yellow-400 px-6 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:from-red-500 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="relative z-10">
                          {loadingWebinarId === webinar.id
                            ? 'Processing...'
                            : 'Click here to register'}
                        </span>
                        <span className="absolute left-0 top-0 h-full w-0 bg-red-200 opacity-20 transition-all duration-500 group-hover:w-full" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
