import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';

const dom = new JSDOM('<div id="root"></div>', { url: 'https://todo.example/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, Event: dom.window.Event, IS_REACT_ACT_ENVIRONMENT: true });
const { createRoot } = await import('react-dom/client');
const { default: ForgotPasswordPage } = await import('../src/pages/ForgotPasswordPage.tsx');
const { default: ResetPasswordPage } = await import('../src/pages/ResetPasswordPage.tsx');
const { default: App } = await import('../src/App.tsx');
const { AuthProvider } = await import('../src/auth/AuthContext.tsx');
let root;
afterEach(async () => { if (root) await act(() => root.unmount()); root = undefined; sessionStorage.clear(); localStorage.clear(); });
async function render(component) { root = createRoot(document.getElementById('root')); await act(() => root.render(component)); }
async function fill(id, value) {
  const input = document.getElementById(id);
  Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, value);
  await act(() => input.dispatchEvent(new dom.window.Event('input', { bubbles: true })));
  await act(() => input.dispatchEvent(new dom.window.Event('change', { bubbles: true })));
}
async function submit() { await act(async () => { document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); }); }

test('forgot password shows generic success for an unknown email', async () => {
  let body;
  globalThis.fetch = async (_url, options) => { body = JSON.parse(options.body); return Response.json({ message: 'generic' }); };
  await render(React.createElement(ForgotPasswordPage, { onLogin() {} }));
  await fill('forgot-email', 'nobody@example.com'); await submit();
  assert.equal(body.email, 'nobody@example.com');
  assert.match(document.querySelector('[role="status"]').textContent, /hesab mövcuddursa/);
  assert.equal(document.querySelector('form'), null);
});
test('reset password rejects mismatched confirmation without sending request', async () => {
  globalThis.fetch = async () => assert.fail('Mismatch must be rejected locally');
  await render(React.createElement(ResetPasswordPage, { link: { email: 'a@b.co', token: 'one-time' }, onLogin() {} }));
  await fill('reset-password', 'newpassword'); await fill('reset-confirm', 'different'); await submit();
  assert.match(document.querySelector('[role="alert"]').textContent, /uyğun gəlmir/);
});
test('reset success clears existing session and exposes login action', async () => {
  sessionStorage.setItem('matchday-token', 'existing');
  let body;
  globalThis.fetch = async (_url, options) => { body = JSON.parse(options.body); return Response.json({ message: 'ok' }); };
  await render(React.createElement(ResetPasswordPage, { link: { email: 'a@b.co', token: 'one-time' }, onLogin() {} }));
  await fill('reset-password', 'newpassword'); await fill('reset-confirm', 'newpassword'); await submit();
  assert.equal(body.confirmPassword, 'newpassword');
  assert.equal(sessionStorage.getItem('matchday-token'), null);
  assert.match(document.querySelector('[role="status"]').textContent, /Şifrən yeniləndi/);
});
test('expired reset displays server error and allows retry', async () => {
  globalThis.fetch = async () => Response.json('Link etibarsızdır və ya vaxtı bitib.', { status: 400 });
  await render(React.createElement(ResetPasswordPage, { link: { email: 'a@b.co', token: 'expired' }, onLogin() {} }));
  await fill('reset-password', 'newpassword'); await fill('reset-confirm', 'newpassword'); await submit();
  assert.match(document.querySelector('[role="alert"]').textContent, /vaxtı bitib/);
  assert.equal(document.querySelector('button[type="submit"]').disabled, false);
});
test('anonymous users see login, never protected todo controls', async () => {
  globalThis.fetch = async () => assert.fail('Anonymous page must not load todos');
  await render(React.createElement(AuthProvider, null, React.createElement(App)));
  assert.equal(document.getElementById('login-title').textContent, 'Daxil ol');
  assert.equal(document.querySelector('.content'), null);
  const forgot = [...document.querySelectorAll('button')].find(button => button.textContent === 'Şifrəmi unutdum?');
  await act(() => forgot.click());
  assert.ok(document.getElementById('forgot-title'));
});

test('registration confirmation blocks mismatches and successful signup opens protected todos', async () => {
  const calls = [];
  const jwt = `e30.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now()/1000) + 60 })).toString('base64url')}.signature`;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/register')) return Response.json({ id: 'user', displayName: 'Player' }, { status: 201 });
    if (url.endsWith('/login')) return Response.json({ token: jwt, user: { id: 'user', displayName: 'Player', email: 'a@b.co' } });
    if (url.includes('/todos')) return Response.json([]);
    if (url.endsWith('/logout')) return Response.json({ message: 'ok' });
    throw new Error('Unexpected request');
  };
  await render(React.createElement(AuthProvider, null, React.createElement(App)));
  await act(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Qeydiyyatdan keç').click());
  await fill('register-name', 'Player'); await fill('register-email', 'a@b.co');
  await fill('register-password', 'newpassword'); await fill('register-confirm', 'mismatch');
  await submit(); assert.equal(calls.length, 0);
  assert.match(document.querySelector('[role="alert"]').textContent, /uyğun gəlmir/);
  await fill('register-confirm', 'newpassword'); await submit();
  assert.ok(document.querySelector('.content'));
  assert.ok(calls.some(call => call.url.endsWith('/register') && JSON.parse(call.options.body).confirmPassword === 'newpassword'));
  await act(async () => [...document.querySelectorAll('button')].find(button => button.textContent === 'Çıxış').click());
  assert.equal(document.querySelector('.content'), null);
  assert.equal(sessionStorage.getItem('matchday-token'), null);
  assert.ok(calls.some(call => call.url.endsWith('/logout') && call.options.headers.Authorization === `Bearer ${jwt}`));
});

test('wrong login credentials show generic backend error without opening protected content', async () => {
  globalThis.fetch = async () => Response.json('Email və ya parol yanlışdır.', { status: 401 });
  await render(React.createElement(AuthProvider, null, React.createElement(App)));
  await fill('login-email', 'a@b.co'); await fill('login-password', 'wrongpassword'); await submit();
  assert.match(document.querySelector('[role="alert"]').textContent, /Email və ya parol yanlışdır/);
  assert.equal(document.querySelector('.content'), null);
});
