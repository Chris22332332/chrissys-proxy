# Local setup

## Windows

1. Install Node.js 22.9+ in the Node 22 line.
2. Extract the project ZIP.
3. Open the project folder in File Explorer, click the address bar, type `cmd`, and press Enter.
4. Run `npm install`.
5. Run `npm test`.
6. Run `npm run preflight`.
7. Run `npm run dev`.
8. Open `http://localhost:8080`.

The local server binds to `127.0.0.1` and runs without the hosted access password. Keep the terminal open while using it. Stop the server with Ctrl+C.

## Local environment file

Copy `ENVIRONMENT.example.txt` to `.env` if you want to adjust local settings. The `.env` file is optional and must never be committed.

## Browser icons and install

The site includes an SVG favicon, ICO/PNG favicon sizes, an Apple touch icon, and `manifest.webmanifest`. Installability depends on the browser and origin; use HTTPS in production. The app shell is not an offline copy of third-party websites.
