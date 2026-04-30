import { getReminderTargets } from '../../../../lib/reminders.js';
import { getSupabaseAdmin } from '../../../../lib/supabase-server.js';

export const runtime = 'nodejs';

async function getWebPush() {
  const mod = await import('web-push');
  return mod.default || mod;
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_SUBJECT || 'mailto:admin@example.com';
  if (!publicKey || !privateKey) {
    return Response.json({ error: 'Web Push is not configured' }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const webPush = await getWebPush();
  webPush.setVapidDetails(subject, publicKey, privateKey);

  const { data: subscriptions, error: subscriptionError } = await supabase
    .from('push_subscriptions')
    .select('id,user_id,endpoint,subscription');
  if (subscriptionError) return Response.json({ error: subscriptionError.message }, { status: 500 });

  const userIds = [...new Set((subscriptions || []).map(item => item.user_id))];
  let sent = 0;
  let failed = 0;

  for (const userId of userIds) {
    const [{ data: settings }, { data: completions }, { data: checkins }] = await Promise.all([
      supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('completions').select('day_id').eq('user_id', userId),
      supabase.from('daily_checkins').select('date').eq('user_id', userId),
    ]);

    const targets = getReminderTargets({
      settings: settings || {},
      completedDayIds: (completions || []).map(item => item.day_id),
      checkinDates: (checkins || []).map(item => item.date),
      now: new Date(),
    });

    if (targets.length === 0) continue;
    const userSubscriptions = subscriptions.filter(item => item.user_id === userId);
    for (const target of targets) {
      const payload = JSON.stringify({
        title: target.title,
        body: target.body,
        tag: target.tag,
        url: target.url,
      });

      for (const row of userSubscriptions) {
        try {
          await webPush.sendNotification(row.subscription, payload);
          sent += 1;
        } catch (error) {
          failed += 1;
          if (error?.statusCode === 404 || error?.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', row.id);
          }
        }
      }
    }
  }

  return Response.json({ ok: true, users: userIds.length, sent, failed });
}
