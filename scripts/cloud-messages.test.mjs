import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const source = (await readFile(new URL('../src/lib/cloud-messages.ts', import.meta.url), 'utf8'))
  .replace(/import .* from '.\/supabase-auth';/, `const SUPABASE_URL = 'https://test.invalid'; const SUPABASE_KEY = 'public-test-key'; async function refreshSession(s) { s.access_token = 'renewed'; }`);
const compiled = await transform(source, { loader: 'ts', format: 'esm' });
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`);
const originalFetch = globalThis.fetch;
const session = () => ({ access_token: 'old', refresh_token: 'refresh', user: { id: 'test-user' } });

test('REST usa token de sesión y renueva una vez tras 401', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return calls.length === 1 ? new Response('{}', { status: 401 }) : new Response('[]');
  };
  try {
    await api.getMembers(session());
    assert.equal(calls.length, 2);
    assert.equal(calls[0].init.headers.Authorization, 'Bearer old');
    assert.equal(calls[1].init.headers.Authorization, 'Bearer renewed');
    assert.equal(calls[1].init.headers.apikey, 'public-test-key');
  } finally { globalThis.fetch = originalFetch; }
});
test('errores de permisos se propagan sin convertirlos en bandeja vacía', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 403 });
  try { await assert.rejects(() => api.getThreads(session()), /No se pudo completar/); }
  finally { globalThis.fetch = originalFetch; }
});
test('historial obtiene páginas adicionales sin perder mensajes', async () => {
  const urls = [];
  globalThis.fetch = async url => {
    urls.push(url);
    return new Response(JSON.stringify(urls.length === 1 ? Array.from({ length: 100 }, (_, id) => ({ id })) : [{ id: 100 }]));
  };
  try {
    const rows = await api.getMessages(session(), 'thread-test');
    assert.equal(rows.length, 101);
    assert.match(urls[0], /thread_id=eq.thread-test/);
    assert.match(urls[1], /offset=100/);
  } finally { globalThis.fetch = originalFetch; }
});
test('inserción 204 conserva cuerpo e identificador sin exigir JSON', async () => {
  let sent;
  globalThis.fetch = async (_, init) => { sent = init; return new Response(null, { status: 204 }); };
  try {
    const payload = JSON.stringify({ id: 'stable-id', thread_id: 'thread', body: 'Mensaje ficticio' });
    assert.equal(await api.messagesApi(session(), 'fincaflow_messages', { method: 'POST', body: payload }), undefined);
    assert.equal(sent.body, payload);
  } finally { globalThis.fetch = originalFetch; }
});
