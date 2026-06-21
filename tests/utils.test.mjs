import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeCsvValue, parseLocalDate, formatDate, addDaysString, normalizeEmail } from '../lib/utils.js';

test('escapeCsvValue neutralises formula-injection prefixes', () => {
  assert.equal(escapeCsvValue('=1+1'), "'=1+1");
  assert.equal(escapeCsvValue('+44'), "'+44");
  assert.equal(escapeCsvValue('-5'), "'-5");
  assert.equal(escapeCsvValue('@cmd'), "'@cmd");
});

test('escapeCsvValue quotes separators and escapes quotes', () => {
  assert.equal(escapeCsvValue('a;b'), '"a;b"');
  assert.equal(escapeCsvValue('he said "hi"'), '"he said ""hi"""');
  assert.equal(escapeCsvValue('plain'), 'plain');
  assert.equal(escapeCsvValue(null), '');
});

test('parseLocalDate anchors at local noon (no UTC off-by-one)', () => {
  const d = parseLocalDate('2026-04-28');
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 3); // April
  assert.equal(d.getDate(), 28); // same calendar day regardless of timezone
});

test('formatDate respects the locale tag', () => {
  const nl = formatDate('2026-04-28', 'nl-NL', { day: 'numeric', month: 'long' });
  const en = formatDate('2026-04-28', 'en-GB', { day: 'numeric', month: 'long' });
  assert.match(nl, /april/i);
  assert.match(en, /April/);
});

test('addDaysString crosses month boundaries safely', () => {
  assert.equal(addDaysString('2026-04-28', 13), '2026-05-11');
  assert.equal(addDaysString('2026-12-31', 1), '2027-01-01');
});

test('normalizeEmail strips gmail dots', () => {
  assert.equal(normalizeEmail('John.Doe@gmail.com'), 'johndoe@gmail.com');
  assert.equal(normalizeEmail('a.b@outlook.com'), 'a.b@outlook.com');
});
