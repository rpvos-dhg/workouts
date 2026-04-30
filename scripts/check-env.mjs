import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.env.local')) {
  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.replace(/^\uFEFF/, '');
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

const optionalRuntime = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'WEB_PUSH_PUBLIC_KEY',
  'WEB_PUSH_PRIVATE_KEY',
  'WEB_PUSH_SUBJECT',
  'CRON_SECRET',
];

const missing = required.filter((key) => !process.env[key]);

for (const key of required) {
  console.log(`[env] ${key}: ${process.env[key] ? 'set' : 'missing'}`);
}

for (const key of optionalRuntime) {
  console.log(`[env:runtime] ${key}: ${process.env[key] ? 'set' : 'missing'}`);
}

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
