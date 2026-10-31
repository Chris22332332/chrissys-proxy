import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRuntimeConfig, formatRuntimeConfigErrors } from '../src/runtime-config.js';

test('Render requires a strong access password and a separate session secret', () => {
  const result = resolveRuntimeConfig({ RENDER: 'true', NODE_ENV: 'production', PORT: '10000' });
  assert.equal(result.hosted, true);
  assert.equal(result.errors.length, 2);
  assert.match(formatRuntimeConfigErrors(result.errors), /PORTAL_ACCESS_PASSWORD/);
  assert.match(formatRuntimeConfigErrors(result.errors), /PORTAL_SESSION_SECRET/);
});

test('valid Render configuration binds to all interfaces and enables authentication', () => {
  const result = resolveRuntimeConfig({ RENDER: 'true', NODE_ENV: 'production', PORT: '10000', PORTAL_ACCESS_PASSWORD: 'a'.repeat(24), PORTAL_SESSION_SECRET: 'b'.repeat(48) });
  assert.deepEqual(result.errors, []);
  assert.equal(result.listenHost, '0.0.0.0');
  assert.equal(result.port, 10000);
  assert.equal(result.authEnabled, true);
});

test('local configuration is loopback-only and creates an ephemeral signing secret', () => {
  const result = resolveRuntimeConfig({ NODE_ENV: 'development' });
  assert.deepEqual(result.errors, []);
  assert.equal(result.listenHost, '127.0.0.1');
  assert.equal(result.authEnabled, false);
  assert.ok(result.sessionSecret.length >= 32);
});

test('hosted configuration rejects invalid ports', () => {
  const result = resolveRuntimeConfig({ RENDER: 'true', PORT: '70000', PORTAL_ACCESS_PASSWORD: 'a'.repeat(24), PORTAL_SESSION_SECRET: 'b'.repeat(48) });
  assert.ok(result.errors.some((message) => message.includes('PORT must be a valid TCP port')));
});
