import { createClient } from '@supabase/supabase-js';

let adminClient = null;

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

function getPublicKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  return key;
}

export function getSupabaseAdmin() {
  if (!adminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    adminClient = createClient(getSupabaseUrl(), serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export function getSupabaseAuthClient(accessToken) {
  return createClient(getSupabaseUrl(), getPublicKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export async function getRequestUser(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return { user: null, token: null, error: 'Missing bearer token' };
  const supabase = getSupabaseAuthClient(token);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { user: null, token, error: error?.message || 'Invalid token' };
  return { user: data.user, token, error: null };
}
