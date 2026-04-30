import { createHash } from 'node:crypto';
import { normalizeWorkoutImport } from '../../../../../lib/workout-import.js';
import { getSupabaseAdmin } from '../../../../../lib/supabase-server.js';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return Response.json({ error: 'Missing import token' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: tokenRow, error: tokenError } = await supabase
    .from('health_import_tokens')
    .select('id,user_id,active')
    .eq('token_hash', hashToken(token))
    .eq('active', true)
    .maybeSingle();

  if (tokenError) return Response.json({ error: tokenError.message }, { status: 500 });
  if (!tokenRow) return Response.json({ error: 'Invalid import token' }, { status: 401 });

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  let workout;
  try {
    workout = normalizeWorkoutImport({ source: 'ios_shortcut', ...payload });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from('workout_import_events')
    .select('id,workout_log_id')
    .eq('user_id', tokenRow.user_id)
    .eq('source', workout.source)
    .eq('dedupe_key', workout.dedupe_key)
    .maybeSingle();

  if (existingError) return Response.json({ error: existingError.message }, { status: 500 });
  if (existing) {
    await supabase.from('health_import_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenRow.id);
    return Response.json({ ok: true, duplicate: true, workoutLogId: existing.workout_log_id });
  }

  const { data: insertedLog, error: insertLogError } = await supabase
    .from('workout_logs')
    .insert({
      user_id: tokenRow.user_id,
      date: workout.date,
      type: workout.type,
      duration: workout.duration,
      distance: workout.distance,
      avg_hr: workout.avg_hr,
      max_hr: workout.max_hr,
      kcal: workout.kcal,
      notes: workout.notes,
      source: workout.source,
      external_id: workout.external_id,
    })
    .select()
    .single();

  if (insertLogError) return Response.json({ error: insertLogError.message }, { status: 500 });

  const { error: eventError } = await supabase
    .from('workout_import_events')
    .insert({
      user_id: tokenRow.user_id,
      source: workout.source,
      external_id: workout.external_id,
      dedupe_key: workout.dedupe_key,
      payload_hash: workout.payload_hash,
      workout_log_id: insertedLog.id,
      payload,
    });

  await supabase.from('health_import_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenRow.id);

  if (eventError) return Response.json({ error: eventError.message }, { status: 500 });
  return Response.json({ ok: true, duplicate: false, workoutLog: insertedLog });
}
