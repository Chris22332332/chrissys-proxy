import { randomBytes } from 'node:crypto';

/** Resolve deployment configuration without silently accepting an insecure hosted setup. */
export function resolveRuntimeConfig(env = process.env) {
  const renderFlag = String(env.RENDER || '').toLowerCase();
  const onRender = ['true', '1', 'yes'].includes(renderFlag) || Boolean(env.RENDER_SERVICE_ID);
  const hosted = onRender || (String(env.NODE_ENV || '').toLowerCase() === 'production' && Boolean(env.PORT));
  const accessPassword = typeof env.PORTAL_ACCESS_PASSWORD === 'string' ? env.PORTAL_ACCESS_PASSWORD : '';
  const configuredSecret = typeof env.PORTAL_SESSION_SECRET === 'string' ? env.PORTAL_SESSION_SECRET : '';
  const errors = [];

  const authRequired = ['true', '1', 'yes'].includes(String(env.PORTAL_REQUIRE_PASSWORD || '').toLowerCase());

  if (authRequired && accessPassword.length < 20) {
    errors.push('PORTAL_ACCESS_PASSWORD is missing or too short. Set it in your hosting provider Environment settings (minimum 20 characters).');
  }

  if (authRequired && configuredSecret.length < 32) {
    errors.push('PORTAL_SESSION_SECRET is missing or too short. Set a different random secret in your hosting provider Environment settings (minimum 32 characters).');
  }

  const portValue = env.PORT == null || env.PORT === '' ? 8080 : Number(env.PORT);
  if (!Number.isInteger(portValue) || portValue < 1 || portValue > 65535) {
    errors.push(`PORT must be a valid TCP port between 1 and 65535; received ${JSON.stringify(env.PORT)}.`);
  }

  const sessionSecret = configuredSecret || randomBytes(32).toString('base64url');
  return {
    onRender,
    hosted,
    accessPassword,
    authEnabled: authRequired,
    sessionSecret,
    port: Number.isInteger(portValue) && portValue >= 1 && portValue <= 65535 ? portValue : 8080,
    listenHost: hosted ? '0.0.0.0' : '127.0.0.1',
    errors
  };
}

export function formatRuntimeConfigErrors(errors = []) {
  return [
    'CHRISSYSPROXY_STARTUP_CONFIGURATION_ERROR',
    ...errors.map((message) => `- ${message}`),
    'To enable sign-in, set PORTAL_REQUIRE_PASSWORD=true and configure PORTAL_ACCESS_PASSWORD and PORTAL_SESSION_SECRET.'
  ].join('\n');
}
