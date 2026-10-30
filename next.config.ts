import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/book/quote/:path*', headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        { key: 'Cache-Control', value: 'private, no-store' },
      ] },
      { source: '/owner/:path*', headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        { key: 'Cache-Control', value: 'private, no-store' },
      ] },
    ];
  },
};
export default nextConfig;
