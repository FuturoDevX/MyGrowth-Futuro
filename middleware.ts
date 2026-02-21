export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/calendar/:path*', '/events/:path*', '/me/:path*', '/admin/:path*', '/reports/:path*', '/api/:path*']
};
