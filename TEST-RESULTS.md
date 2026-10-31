# ChrissysProxy v25 test report

## Verified locally

- `npm ci` completed on Node 24.13.0 with zero reported vulnerabilities. Node 24 emits an engine warning because the project targets Node 22.
- `npm test`: 51 tests passed, 0 failed. The source/configuration checks also passed.
- Low-lag mode was exercised in a browser on `http://127.0.0.1:8081/`; it removed ChrissysProxy interface blur and shadows. The theme selector was verified in the live browser and restored after testing.

- `npm install`: completed successfully; npm reported zero vulnerabilities.
- `npm start` with `PORT=8080`: passed startup checks and served the app.
- Prior local browser checks: Example Domain, Google, DuckDuckGo search results, YouTube, and CrazyGames rendered with Libcurl; TikTok rendered, with some site API requests returning 403. CrazyGames game route and Back/Forward were checked. Epoxy reproduced a YouTube error locally.
- `npm test`: 50 tests passed, 0 failed; source/configuration checks passed. `npm run preflight` passed.

## Verified on Render

- Build `chrissysproxy-20261031-23` deployed successfully on Node 22.23.4. `/healthz` returned `ok: true` and the v23 build ID.
- Example Domain and Google homepage rendered over Libcurl; Example Domain rendered over Epoxy.
- Brave Search returned results over Epoxy.
- DuckDuckGo timed out from Render (`ETIMEDOUT` to `52.250.42.157:443`) with both transports. Google search triggered Google's unusual-traffic CAPTCHA. This points to destination/network restrictions on Render's outbound path, not a local TLS certificate error.
- v24 defaults searches to Brave based on the live test. Commit `17bd046` was previously deployed; current v25 build is commit `7322ecb`.
- Game checks: CrazyGames pages render, but the Space Waves game area stayed blank under Libcurl. Bloxd.io reached its game loading spinner and remained there for about one minute under Epoxy. Changing transports did not resolve either case. Actual gameplay remains unverified.

## Current deployment

Render `/healthz` returns `ok: true`, build `chrissysproxy-20261031-25`, and Node major 22. The low-lag interface option is present in Appearance settings.

## Environment note

This local machine runs Node 24.13.0; the project declares Node 22 (`>=22.9 <23`). Local installation, startup, and tests succeeded on Node 24; Render was separately tested on Node 22.23.4. Render Free may spin down after inactivity, and third-party sites can block proxy IPs or fail on the host network.
