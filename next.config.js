import { execSync } from 'child_process';

let buildId;
try {
  const count = execSync('git rev-list --count HEAD').toString().trim();
  const sha = execSync('git rev-parse --short HEAD').toString().trim();
  buildId = `v${count}-${sha}`;
} catch {
  buildId = 'dev';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default nextConfig;
