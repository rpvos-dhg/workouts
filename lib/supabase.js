import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This module is imported by the prerendered "/" page, so throwing here at import
// time would fail the whole build/prerender when env vars are absent (e.g. a Vercel
// preview deployment without Supabase env). Fall back to harmless placeholders so the
// build succeeds; real auth/data calls only work once the env vars are configured.
const hasConfig = Boolean(supabaseUrl && supabaseKey);
if (!hasConfig && typeof window === 'undefined') {
  console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — using placeholder client. Set these env vars for a working deployment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key',
);
