# AIxAI — Charansparsh Discovery Questionnaire

A minimal Express app that serves the client discovery form and stores each
submission as a JSON file. Built for deployment on Railway.

## Run locally

```bash
npm install
npm start          # http://localhost:3000
```

- Form: `http://localhost:3000`
- Admin: `http://localhost:3000/admin?key=change-me`

## Deploy on Railway (important bits)

1. Push this folder to a GitHub repo and create a new Railway project from it
   (or `railway up` with the CLI).
2. **Attach a Volume** (Railway → your service → Volumes → New Volume) and
   mount it at `/data`. Without this, submissions are WIPED on every redeploy —
   Railway's filesystem is ephemeral.
3. Set environment variables on the service:

   | Variable    | Value                          |
   |-------------|--------------------------------|
   | `DATA_DIR`  | `/data` (the volume mount path)|
   | `ADMIN_KEY` | a long random string           |

4. Railway auto-detects Node and runs `npm start`. Done.

## Where the data goes

- Every submission → `DATA_DIR/submissions/<timestamp>_<id>.json`
- View them at `/admin?key=YOUR_ADMIN_KEY` — formatted view + raw JSON download.
- Questions marked "Leave it to AIxAI" show up highlighted as ★ agency-discretion
  items, so you immediately see what the client delegated to you.

## Customising

All questions live in one schema (`SECTIONS`) at the top of the `<script>` in
`public/index.html`. Add/remove/edit questions there — the form, progress bar,
sidebar and submission payload all follow automatically.
