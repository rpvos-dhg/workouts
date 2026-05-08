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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default nextConfig;
