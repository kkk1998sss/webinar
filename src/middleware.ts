// import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// import { middleware as paraglide } from '@/lib/i18n';

// export async function middleware(request: NextRequest) {
//   const response = paraglide(request);
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   const protectedRoutes = ['/users/live-webinar', '/dashboard'];
//   const adminRoutes = ['/admin'];
//   const authRoutes = ['/auth/login', '/auth/register'];

//   const { pathname } = request.nextUrl;

//   const isProtectedRoute = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );
//   const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
//   const isAuthRoute = authRoutes.includes(pathname);

//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }

//   if (isAdminRoute && (!token || !token.isAdmin)) {
//     return NextResponse.redirect(new URL('/not-authorized', request.url));
//   }

//   if (isAuthRoute && token) {
//     return NextResponse.redirect(new URL('/users/live-webinar', request.url));
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico).*)', // Ignore API & static assets
//   ],
// };

import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { middleware as paraglide } from '@/lib/i18n';

export async function middleware(request: NextRequest) {
  const response = paraglide(request);
  console.log(response);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  console.log('token', token);

  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/users/live-webinar', '/dashboard'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/auth/login', '/auth/register'];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAdminRoute && (!token || !token.isAdmin)) {
    return NextResponse.redirect(new URL('/not-authorized', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/users/live-webinar', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
