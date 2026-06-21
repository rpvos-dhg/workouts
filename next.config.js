import { execSync } from 'child_process';
import { readFileSync } from 'fs';

let buildId;
try {
  const major = readFileSync('./VERSION', 'utf8').trim();
  const count = execSync('git rev-list --count HEAD').toString().trim();
  buildId = `v${major}.${count}`;
} catch {
  buildId = 'dev';
}

// CSP shipped as Report-Only first: it won't block anything, but surfaces
// violations in the console so the policy can be validated against Supabase
// (REST + realtime websockets), Open-Meteo and Google OAuth before enforcing.
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // Next.js injects inline bootstrap scripts/styles; next/font injects inline styles.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in https://api.open-meteo.com https://routeplanner.fietsersbond.nl",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), browsing-topics=()' },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
