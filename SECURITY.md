# Security notes

ChrissysProxy is intended as a private browser workspace, not an unrestricted public proxy.

## Hosted access

- Hosted mode requires `PORTAL_ACCESS_PASSWORD` (minimum 20 characters) and a separate `PORTAL_SESSION_SECRET` (minimum 32 characters).
- The server issues signed session tokens in HTTP-only, SameSite=Strict cookies; Secure is set when Express detects the trusted Render TLS connection.
- Login attempts are rate limited.
- Login/logout and Wisp upgrades enforce same-origin checks.
- No password or session secret belongs in GitHub, screenshots, diagnostics, or logs.

## Wisp destination policy

The current Wisp configuration allows TCP only, disables UDP, disallows direct IP, private IP, and loopback destinations, restricts destination ports to 80/443, limits concurrent streams, disables parsing client IP from untrusted forwarded headers, and blocks common local/internal hostnames. These settings reduce exposure but do not replace ongoing security review or abuse monitoring.

## Data

Bookmarks, history, notes, settings, and the export list are stored in the browser's local storage. They are device/browser-profile local and are not synchronized. Exported backups can contain sensitive URLs or notes; protect those files. Website cookies/storage in the Scramjet partition and server operational logs are separate from ChrissysProxy's local workspace data.

## Publishing

The current hosted gate is a shared password. Do not publish the service as a public multi-user proxy without adding per-user authentication, quotas, abuse reporting, rate/connection monitoring, retention disclosures, and a clear acceptable-use policy. Do not advertise it as unblockable or as a way to defeat institutional network controls.
