import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as cronGet } from '../app/api/cron/reminders/route.js';
import { GET as publicKeyGet } from '../app/api/push/public-key/route.js';

test('cron endpoint rejects missing authorization', async () => {
  const response = await cronGet(new Request('https://example.test/api/cron/reminders'));
  assert.equal(response.status, 401);
});

test('push public key endpoint is safe without configuration', async () => {
  const response = await publicKeyGet();
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(typeof body.publicKey, 'string');
});
