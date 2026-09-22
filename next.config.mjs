/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Content-Security-Policy.
 *
 * Next.js needs 'unsafe-eval' in development for the webpack HMR runtime -
 * without it no client JavaScript executes at all and the app renders as a
 * dead server-side shell. It is switched off in production builds.
 *
 * 'unsafe-inline' stays in script-src because Next.js emits inline bootstrap
 * scripts and the App Router does not support a CSP nonce without moving
 * every page to dynamic rendering. If you need a nonce-based policy for
 * examination purposes, add it in middleware and set `dynamic = 'force-dynamic'`.
 */
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  // Jornaya LeadiD and TrustedForm must load for consent certification.
  'https://create.lidstatic.com',
  'https://api.trustedform.com',
  'https://*.trustedform.com',
].join(' ');

const connectSrc = [
  "'self'",
  apiUrl,
  'https://api.trustedform.com',
  // Dev-server HMR websocket.
  ...(isDev ? ['ws:', 'wss:'] : []),
].join(' ');

const securityHeaders = [
  // TLS 1.2+ / HSTS / no mixed content on any application page.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.trustedform.com https://create.lidstatic.com",
      "font-src 'self' data:",
      `connect-src ${connectSrc}`,
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      ...(isDev ? [] : ['upgrade-insecure-requests']),
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
