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

// Enforced Content-Security-Policy. script/style keep 'unsafe-inline': Next.js
// injects inline bootstrap scripts and the app + next/font rely on inline styles.
// A nonce-based policy was tried (see docs/QA-REVIEW.md) but verified to blank the
// app — the static client shell is prerendered without a per-request nonce, so
// 'strict-dynamic' blocked every script. The app has no HTML-injection sinks
// (no dangerouslySetInnerHTML), so 'unsafe-inline' on script-src is low-risk here.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in https://api.open-meteo.com https://routeplanner.fietsersbond.nl",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), browsing-topics=()' },
  { key: 'Content-Security-Policy', value: csp },
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
