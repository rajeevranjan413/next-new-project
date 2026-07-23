import { test } from 'node:test';
import assert from 'node:assert/strict';

import { clientIp, parseUserAgent } from '../requestMeta.js';
import { str, cleanEmail, cleanPhone, isValidSessionId } from '../leadSanitize.js';

// ── clientIp ──────────────────────────────────────────────────────────────────
test('clientIp: takes the left-most X-Forwarded-For entry', () => {
  const req = { headers: { 'x-forwarded-for': '203.0.113.9, 70.41.3.18, 150.172.238.178' }, ip: '10.0.0.1' };
  assert.equal(clientIp(req), '203.0.113.9');
});

test('clientIp: falls back to X-Real-IP, then req.ip', () => {
  assert.equal(clientIp({ headers: { 'x-real-ip': '198.51.100.7' } }), '198.51.100.7');
  assert.equal(clientIp({ headers: {}, ip: '192.0.2.44' }), '192.0.2.44');
});

test('clientIp: strips the IPv4-mapped IPv6 prefix', () => {
  assert.equal(clientIp({ headers: {}, ip: '::ffff:127.0.0.1' }), '127.0.0.1');
});

// ── parseUserAgent ──────────────────────────────────────────────────────────────
test('parseUserAgent: iPhone Safari → mobile / iOS / Safari', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
  const d = parseUserAgent(ua);
  assert.equal(d.type, 'mobile');
  assert.equal(d.os, 'iOS');
  assert.equal(d.browser, 'Safari');
});

test('parseUserAgent: Windows Chrome → desktop / Windows 10 / Chrome + major version', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  const d = parseUserAgent(ua);
  assert.equal(d.type, 'desktop');
  assert.equal(d.os, 'Windows 10');
  assert.equal(d.browser, 'Chrome');
  assert.equal(d.browserVersion, '124');
});

test('parseUserAgent: Edge is not misread as Chrome', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.51';
  assert.equal(parseUserAgent(ua).browser, 'Edge');
});

test('parseUserAgent: Android tablet vs phone', () => {
  const tablet = 'Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  const phone  = 'Mozilla/5.0 (Linux; Android 13; Pixel 8 Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
  assert.equal(parseUserAgent(tablet).type, 'tablet');
  assert.equal(parseUserAgent(phone).type, 'mobile');
});

test('parseUserAgent: empty UA → all-empty shape', () => {
  assert.deepEqual(parseUserAgent(''), { type: '', os: '', browser: '', browserVersion: '' });
});

// ── sanitizers ──────────────────────────────────────────────────────────────────
test('str: trims, clamps, and rejects non-strings', () => {
  assert.equal(str('  hi  '), 'hi');
  assert.equal(str('abcdef', 3), 'abc');
  assert.equal(str({}), '');
  assert.equal(str(undefined), '');
  assert.equal(str(42), '42');
});

test('cleanEmail: valid normalizes, invalid drops to empty', () => {
  assert.equal(cleanEmail('  Foo@Bar.com '), 'foo@bar.com');
  assert.equal(cleanEmail('not-an-email'), '');
  assert.equal(cleanEmail('a@b'), '');
});

test('cleanPhone: keeps + and digits, drops junk-short values', () => {
  assert.equal(cleanPhone('+91 98765-43210'), '+919876543210');
  assert.equal(cleanPhone('12'), '');            // too short
  assert.equal(cleanPhone('abc'), '');
});

test('isValidSessionId: accepts UUID-ish ids, rejects short/garbage', () => {
  assert.equal(isValidSessionId('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(isValidSessionId('sid-abc123def456'), true);
  assert.equal(isValidSessionId('short'), false);
  assert.equal(isValidSessionId('has spaces and !@#'), false);
  assert.equal(isValidSessionId(''), false);
});
