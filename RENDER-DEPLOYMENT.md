# ChrissysProxy v15 — Render deployment

## Create a new Web Service

Upload the contents of this project to a GitHub repository with `package.json` at its root. Do not upload the ZIP itself and do not put the files in an extra nested directory.

| Render field | Value |
|---|---|
| Service type | Web Service |
| Name | `chrissysproxy` (or another available name) |
| Runtime | Node |
| Branch | `main` |
| Root Directory | Empty |
| Build Command | `npm install && npm test && npm run preflight` |
| Start Command | `npm start` |
| Health Check Path | `/healthz` |
| Node | 22.x, constrained by `package.json` to `>=22.9 <23` |

`render.yaml` declares a Free Web Service. Hosted sign-in is disabled by default. If creating a normal Web Service using the dashboard form, set `NODE_ENV=production`; Render supplies `PORT` automatically.

## Optional password sign-in

Render → Service → Environment:

| Key | Value |
|---|---|
| `PORTAL_REQUIRE_PASSWORD` | `true` |
| `PORTAL_ACCESS_PASSWORD` | A random private password, at least 20 characters |
| `PORTAL_SESSION_SECRET` | A different random secret, at least 32 characters |

Use Render's **Generate** button for both secrets, or generate them locally with Node:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Only add these variables when you want to require a password. Run those commands separately. Save the first value as the sign-in password. Keep both values private and never commit them to GitHub. Do not manually set `PORT`; Render supplies it.

## Deployment sequence

1. Commit the complete project contents to the `main` branch.
2. Confirm `package.json` is at repository root.
3. If you want password sign-in, add `PORTAL_REQUIRE_PASSWORD=true` and the two secrets above.
4. Deploy the latest commit.
5. The build runs `npm install`, the Node test suite, and the package/asset preflight.
6. The `prestart` lifecycle checks hosted secrets and rechecks installed package exports and browser assets before the server starts.
7. Render monitors `/healthz`.

## Expected logs

A healthy deployment should include lines similar to:

```text
CHRISSYSPROXY STARTUP CONFIGURATION PASSED
CHRISSYSPROXY DEPLOYMENT PREFLIGHT PASSED
CHRISSYSPROXY chrissysproxy-20261030-15 LISTENING on 0.0.0.0:<Render port>
CHRISSYSPROXY_SERVER_STARTUP_COMPLETE
```

The actual port is assigned by Render; the exact order of build and startup lines can vary.

## Verify after deployment

1. Open `https://<your-service>.onrender.com/healthz` and check for `ok: true` and Node major version 22. `authEnabled` should be false unless you enabled password sign-in.
2. If enabled, sign in with `PORTAL_ACCESS_PASSWORD`.
3. Open Settings → Diagnostics. Check server health, asset diagnostics, browser support, and the Wisp WebSocket probe.
4. Test a permitted HTTPS destination such as `https://example.com` through the address bar.
5. Test the Games, Notes, Downloads, and command palette sections.

The `/__portal/diagnostics` endpoint requires a signed-in session. A successful health check proves only that the server is alive, not that every website works through the proxy.

## Startup configuration errors

If you see `CHRISSYSPROXY_STARTUP_CONFIGURATION_ERROR`, the output names the missing or invalid environment variable. If password sign-in is enabled, add or fix its variables in Render → Environment, save, and redeploy. `.env` is optional for local development and is not required on Render; hosted values are read from `process.env`.

## Limitations and public release

- Render Free services may spin down after inactivity, causing a cold start.
- Third-party sites may block embedding/proxy traffic, require authentication, or need browser features this project does not implement.
- ChrissysProxy does not bypass network filters, school/work access rules, or website restrictions.
- When enabled, access control is one shared password, not multi-user identity. With sign-in disabled, anyone with the URL can use the proxy. For a broad public release, consider individual accounts, per-user quotas, abuse controls, a privacy policy, acceptable-use terms, and a support contact.
