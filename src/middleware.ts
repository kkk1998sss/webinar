import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { middleware as paraglide } from '@/lib/i18n';

interface Subscription {
  id: string;
  type: 'FOUR_DAY' | 'SIX_MONTH' | 'PAID_WEBINAR';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  subscriptions: Subscription[];
  pending: boolean;
}

export async function middleware(request: NextRequest) {
  try {
    const response = paraglide(request);

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      // cookieName:
      //   process.env.NODE_ENV === 'production'
      //     ? '__Secure-authjs.session-token'
      //     : 'next-auth.session-token',
    });

    const { pathname } = request.nextUrl;

    const protectedRoutes = ['/users/live-webinar'];
    const adminRoutes = ['/admin'];
    const authRoutes = ['/auth/login', '/auth/register'];
    // const pricingRoute = '/pricing';

    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isAdminRoute = adminRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isAuthRoute = authRoutes.includes(pathname);
    // const isPricingRoute = pathname === pricingRoute;

    // If user is admin, allow access to all routes
    if (token?.isAdmin) {
      return NextResponse.next();
    }

    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check user's subscription status for protected routes
    if (isProtectedRoute && token) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/register`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          const user = userData.find((u: User) => u.email === token.email);

          // Block access if user is pending (has not purchased)
          if (user && user.pending === false) {
            return NextResponse.redirect(new URL('/pricing', request.url));
          }

          if (
            !user ||
            !user.subscriptions ||
            !user.subscriptions[0]?.isActive
          ) {
            return NextResponse.redirect(new URL('/', request.url));
          }

          // Check subscription plan type and validity
          const subscription = user.subscriptions[0];
          const currentDate = new Date();
          const subscriptionEndDate = new Date(subscription.endDate);

          // If subscription has expired, redirect to pricing
          if (currentDate > subscriptionEndDate) {
            return NextResponse.redirect(new URL('/', request.url));
          }

          // For FOUR_DAY plan users, show locked content but allow access to webinar
          if (subscription.type === 'FOUR_DAY') {
            const skipFourDayPlan = request.cookies.get('skipFourDayPlan');
            if (
              skipFourDayPlan &&
              (pathname.startsWith('/dashboard-free') ||
                pathname.startsWith('/users/dashboard'))
            ) {
              return NextResponse.next();
            }
            if (
              pathname.startsWith('/users/dashboard') ||
              pathname.startsWith('/dashboard-free')
            ) {
              return NextResponse.next();
            }
            return NextResponse.redirect(
              new URL('/dashboard-free', request.url)
            );
          }

          // For SIX_MONTH plan users, allow full access
          if (subscription.type === 'SIX_MONTH') {
            return NextResponse.next();
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (isAdminRoute && (!token || !token.isAdmin)) {
      return NextResponse.redirect(new URL('/not-authorized', request.url));
    }

    if (isAuthRoute && token) {
      if (token.isAdmin) {
        return NextResponse.redirect(new URL('/admin/users', request.url));
      }

      // After login, redirect to appropriate page based on subscription
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/register`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          const user = userData.find((u: User) => u.email === token.email);

          if (user?.subscriptions?.[0]) {
            const subscription = user.subscriptions[0];
            const currentDate = new Date();
            const subscriptionEndDate = new Date(subscription.endDate);

            // Check if subscription is active and not expired
            if (subscription.isActive && currentDate <= subscriptionEndDate) {
              if (subscription.type === 'FOUR_DAY') {
                // For new FOUR_DAY subscribers, show welcome page
                if (
                  new Date(subscription.startDate).getTime() >
                  Date.now() - 24 * 60 * 60 * 1000
                ) {
                  return NextResponse.redirect(
                    new URL('/welcome', request.url)
                  );
                }
                return NextResponse.redirect(
                  new URL('/dashboard-free', request.url)
                );
              } else if (subscription.type === 'SIX_MONTH') {
                return NextResponse.redirect(
                  new URL('/dashboard-free', request.url)
                );
              }
            } else {
              // If subscription is expired or inactive, redirect to pricing
              return NextResponse.redirect(new URL('/', request.url));
            }
          }
        }
      } catch (error) {
        console.error('Error checking subscription after login:', error);
      }

      // If no valid subscription found, redirect to pricing
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/error?type=500', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
