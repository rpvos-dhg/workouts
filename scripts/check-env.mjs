import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.env.local')) {
  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/);

  for (const line of lines) {
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

const missing = required.filter((key) => !process.env[key]);

for (const key of required) {
  console.log(`[env] ${key}: ${process.env[key] ? 'set' : 'missing'}`);
}

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
