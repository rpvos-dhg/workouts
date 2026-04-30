import { getRequestUser, getSupabaseAdmin } from '../../../../lib/supabase-server.js';

export async function POST(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return Response.json({ error }, { status: 401 });
  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (!endpoint) return Response.json({ error: 'Missing endpoint' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error: deleteError } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);
  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 });
  return Response.json({ ok: true });
}
