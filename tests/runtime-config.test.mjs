import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRuntimeConfig, formatRuntimeConfigErrors } from '../src/runtime-config.js';

test('Render is password-free by default, including when optional credentials are present', () => {
  const result = resolveRuntimeConfig({ RENDER: 'true', NODE_ENV: 'production', PORT: '10000' });
  assert.equal(result.hosted, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.authEnabled, false);
  assert.equal(result.listenHost, '0.0.0.0');
  const withCredentials = resolveRuntimeConfig({ RENDER: 'true', PORTAL_ACCESS_PASSWORD: 'a'.repeat(24), PORTAL_SESSION_SECRET: 'b'.repeat(48) });
  assert.equal(withCredentials.authEnabled, false);
});

test('explicit password requirement validates secrets and enables authentication', () => {
  const missing = resolveRuntimeConfig({ RENDER: 'true', PORTAL_REQUIRE_PASSWORD: 'true' });
  assert.equal(missing.errors.length, 2);
  assert.match(formatRuntimeConfigErrors(missing.errors), /PORTAL_ACCESS_PASSWORD/);
  assert.match(formatRuntimeConfigErrors(missing.errors), /PORTAL_SESSION_SECRET/);
  const result = resolveRuntimeConfig({ RENDER: 'true', NODE_ENV: 'production', PORT: '10000', PORTAL_REQUIRE_PASSWORD: 'true', PORTAL_ACCESS_PASSWORD: 'a'.repeat(24), PORTAL_SESSION_SECRET: 'b'.repeat(48) });
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
  const result = resolveRuntimeConfig({ RENDER: 'true', PORT: '70000' });
  assert.ok(result.errors.some((message) => message.includes('PORT must be a valid TCP port')));
});
