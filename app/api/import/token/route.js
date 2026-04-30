import { createHash, randomBytes } from 'node:crypto';
import { getRequestUser, getSupabaseAdmin } from '../../../../lib/supabase-server.js';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function GET(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return Response.json({ error }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error: queryError } = await supabase
    .from('health_import_tokens')
    .select('id,label,active,created_at,last_used_at')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (queryError) return Response.json({ error: queryError.message }, { status: 500 });
  return Response.json({ tokens: data || [] });
}

export async function POST(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return Response.json({ error }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const token = `wh_${randomBytes(32).toString('base64url')}`;
  const { data, error: insertError } = await supabase
    .from('health_import_tokens')
    .insert({
      user_id: user.id,
      token_hash: hashToken(token),
      label: 'iOS Shortcut',
      active: true,
    })
    .select('id,label,created_at')
    .single();

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 });
  return Response.json({
    token,
    tokenInfo: data,
    endpoint: `${new URL(request.url).origin}/api/import/shortcut/workout`,
  });
}

export async function DELETE(request) {
  const { user, error } = await getRequestUser(request);
  if (!user) return Response.json({ error }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { error: updateError } = await supabase
    .from('health_import_tokens')
    .update({ active: false })
    .eq('user_id', user.id)
    .eq('active', true);
  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
  return Response.json({ ok: true });
}
