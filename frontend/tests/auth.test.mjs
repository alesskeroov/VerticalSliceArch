import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeResetLink } from '../src/auth/resetLink.ts';
import { getExpiry, getStoredToken, saveToken, clearSession, UNAUTHORIZED_EVENT } from '../src/auth/tokenStorage.ts';
import * as api from '../src/api/authApi.ts';

function storage() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; }
function token(exp) { return `e30.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`; }

test('reset link captures encoded fragment credentials and scrubs browser history', () => {
  let replaced;
  const link = consumeResetLink({ href: 'https://todo.example/#reset-password?email=a%2Bb%40example.com&token=one%2Btwo%2Fthree' }, { replaceState: (...args) => replaced = args[2] });
  assert.deepEqual(link, { email: 'a+b@example.com', token: 'one+two/three' });
  assert.equal(replaced, '/');
});
test('query links are scrubbed while unrelated URL parameters survive', () => {
  let replaced;
  assert.deepEqual(consumeResetLink({ href: 'https://todo.example/?lang=az&email=a%40b.co&token=secret' }, { replaceState: (...args) => replaced = args[2] }), { email: 'a@b.co', token: 'secret' });
  assert.equal(replaced, '/?lang=az');
  assert.equal(consumeResetLink({ href: 'https://todo.example/' }, { replaceState: () => assert.fail() }), null);
});
test('session persistence rejects expired and malformed tokens, discards legacy storage and logout dispatches', () => {
  globalThis.localStorage = storage(); globalThis.sessionStorage = storage(); globalThis.window = new EventTarget();
  const valid = token(Math.floor(Date.now() / 1000) + 60);
  localStorage.setItem('matchday-token', valid);
  assert.equal(getStoredToken(), null);
  assert.equal(localStorage.getItem('matchday-token'), null);
  saveToken(valid); assert.equal(getStoredToken(), valid);
  let cleared = false; window.addEventListener(UNAUTHORIZED_EVENT, () => cleared = true);
  clearSession(); assert.equal(getStoredToken(), null); assert.equal(cleared, true);
  saveToken(token(1)); assert.equal(getStoredToken(), null);
  saveToken('bad'); assert.equal(getStoredToken(), null); assert.equal(getExpiry('bad'), 0);
});
test('authentication API sends confirmation, reset credentials and authenticated logout', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, ...options }); return Response.json({ message: 'ok' }); };
  await api.register('a@b.co', 'password', 'Name', 'password');
  assert.equal(JSON.parse(calls[0].body).confirmPassword, 'password');
  await api.forgotPassword('a@b.co');
  assert.deepEqual(JSON.parse(calls[1].body), { email: 'a@b.co' });
  await api.resetPassword('a@b.co', 'secret', 'newpassword', 'newpassword');
  assert.equal(JSON.parse(calls[2].body).token, 'secret');
  await api.logout('jwt'); assert.equal(calls[3].headers.Authorization, 'Bearer jwt');
});
test('API exposes safe error messages for rate limit and offline failures', async () => {
  globalThis.fetch = async () => new Response('', { status: 429 });
  await assert.rejects(api.forgotPassword('a@b.co'), err => err.status === 429 && err.message.includes('Çox sayda'));
  globalThis.fetch = async () => { throw new Error('internal detail'); };
  await assert.rejects(api.login('a@b.co', 'password'), err => err.status === 0 && !err.message.includes('internal'));
});
