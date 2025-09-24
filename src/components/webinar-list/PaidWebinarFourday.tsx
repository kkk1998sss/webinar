import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, IndianRupee, MapPin, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// import { VideoPlayer } from '@/components/VideoPlayer';
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
  const [webinarToDelete, setWebinarToDelete] = useState<Webinar | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handlePaymentSuccess = (id: string, webinar?: Webinar) => {
    setPaidWebinarIds((prev) => [...prev, id]);
    toast.success('Payment successful!');

    // Check if webinar has showThankYouPage enabled
    if (webinar?.showThankYouPage) {
      // Show thank you page if manually enabled
      router.push('/thank-you');
    } else {
      // Default behavior: redirect to playing area
      toast.success('Redirecting to playing area...');
      router.push(`/users/playing-area/${id}`);
    }
  };

  const handleAlreadyPaid = (webinar: Webinar) => {
    // Check if webinar has showThankYouPage enabled
    if (webinar.showThankYouPage) {
      toast.success('Redirecting to thank you page...');
      router.push('/thank-you');
    } else {
      // Default behavior: redirect to playing area
      toast.success('Redirecting to playing area...');
      router.push(`/users/playing-area/${webinar.id}`);
    }
  };

  const handleDeleteWebinar = async () => {
    if (!webinarToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/webinar/${webinarToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Webinar deleted successfully!');
        // Remove the webinar from the list by triggering a page refresh or updating parent state
        window.location.reload(); // Simple approach - you could pass an onDelete callback from parent instead
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete webinar');
      }
    } catch (error) {
      console.error('Error deleting webinar:', error);
      toast.error('Failed to delete webinar');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setWebinarToDelete(null);
    }
  };

  const confirmDelete = (webinar: Webinar) => {
    setWebinarToDelete(webinar);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setWebinarToDelete(null);
    setShowDeleteConfirm(false);
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
              handlePaymentSuccess(webinar.id, webinar);
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
              {/* Delete Button - Only show for admins */}
              {session?.user?.isAdmin && (
                <button
                  onClick={() => confirmDelete(webinar)}
                  className="absolute right-2 top-2 z-10 rounded-full bg-red-500/80 p-2 text-white opacity-0 transition-all duration-200 hover:bg-red-600 group-hover:opacity-100"
                  title="Delete webinar"
                >
                  <Trash2 className="size-4" />
                </button>
              )}

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
                        onClick={() => handleAlreadyPaid(webinar)}
                        className="rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-400 to-green-500 px-6 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                      >
                        Join Now
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && webinarToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="size-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Webinar
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Are you sure you want to delete the webinar{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  &quot;{webinarToDelete.webinarTitle}&quot;
                </span>
                ? This will permanently delete the webinar and all associated
                data.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWebinar}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Webinar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
