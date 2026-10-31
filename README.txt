CHRISSYSPROXY v15

Purple private browser workspace built with Node.js 22, Express, Scramjet 1.x, BareMux 2.x, Libcurl/Epoxy, and Wisp JS.

Workspace sections: Home, Games, Apps, Library, Notes, Downloads, Tools.
Features: tabs, pinned/reorderable tabs, bookmarks, history, local notes and autosave, JSON backups, command palette (Ctrl+K), settings, PWA icons, and proxy diagnostics.

LOCAL WINDOWS:
1. Install Node.js 22.9+.
2. Open Command Prompt in this project folder.
3. Run: npm install
4. Run: npm test
5. Run: npm run preflight
6. Run: npm run dev
7. Open http://localhost:8080

RENDER:
Build: npm install && npm test && npm run preflight
Start: npm start
Health: /healthz
Node: >=22.9 <23
Required hosted variables: NODE_ENV=production, PORTAL_ACCESS_PASSWORD (20+ characters), PORTAL_SESSION_SECRET (different, 32+ characters).

See README.md, SETUP.md, RENDER-DEPLOYMENT.md, SECURITY.md, ENGINEERING-AUDIT.md and TEST-RESULTS.md.

Important: This app is not unblockable and does not bypass school/work network rules. Public release requires careful access control, abuse controls, privacy disclosures, and monitoring. The current hosted login uses one shared password, not individual accounts.
