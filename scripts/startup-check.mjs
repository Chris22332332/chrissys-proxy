import { resolveRuntimeConfig, formatRuntimeConfigErrors } from '../src/runtime-config.js';

const config = resolveRuntimeConfig(process.env);
if (config.errors.length) {
  process.stderr.write(`${formatRuntimeConfigErrors(config.errors)}\n`);
  process.exitCode = 1;
} else {
  console.log('CHRISSYSPROXY STARTUP CONFIGURATION PASSED');
  console.log(`Runtime: Node ${process.versions.node}`);
  console.log(`Hosting mode: ${config.hosted ? 'hosted' : 'local'}`);
  console.log(`Authentication: ${config.authEnabled ? 'enabled' : 'disabled (loopback-only development)'}`);
  console.log(`Port: ${config.port}`);
}
