// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export default function proxy(request: NextRequest) {
//   const token = request.cookies.get('auth_token')?.value;
//   const pathname = request.nextUrl.pathname;

//   if (!token && pathname.startsWith('/')) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/products/:path*',
//     '/campaigns/:path*',
//     '/icp/:path*',
//     '/kpi-dashboard/:path*',
//     '/product-offers/:path*',
//   ],
// };

import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
