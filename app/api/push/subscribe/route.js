import { getRequestUser, getSupabaseAdmin } from '../../../../lib/supabase-server.js';

export async function POST(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return Response.json({ error }, { status: 401 });

  const body = await request.json().catch(() => null);
  const subscription = body?.subscription;
  if (!subscription?.endpoint) {
    return Response.json({ error: 'Missing push subscription endpoint' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error: upsertError } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      subscription,
      user_agent: request.headers.get('user-agent'),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,endpoint' });

  if (upsertError) return Response.json({ error: upsertError.message }, { status: 500 });
  return Response.json({ ok: true });
}
