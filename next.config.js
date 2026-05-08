import { execSync } from 'child_process';

let buildId;
try {
  buildId = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  buildId = Date.now().toString(36);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default nextConfig;
