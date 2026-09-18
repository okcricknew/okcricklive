# OKCRICK SSR Migration (UI/Realtime Logic Preserved)

## What changed

- Added `firebase-admin` server SDK dependency.
- Added `lib/firebase-admin.js` for server-only Firebase access.
- Added `lib/ssr/firestore.js` for serializing Firestore Timestamps into Next.js-safe props.
- Added SSR data helpers in `lib/ssr/`.
- Added `getServerSideProps` to:
  - `/`
  - `/tournament/[id]`
  - `/tournament/matches/[id]`
  - `/tournament/manage-match/[id]`
  - `/scoring/[tourneyId]/[id]`
  - `/tournament/stats/[tId]`
- Preserved existing client Firebase `onSnapshot()` listeners. SSR only supplies the first HTML/data state; realtime updates still happen in the browser exactly as before.
- Fixed `_app.js` overlay detection so it does not use `window.location` during the first server render.
- Added `.env.example`.

## 1. Install

```bash
npm install
```

## 2. Configure Firebase Admin

Create `.env.local` (do not commit it):

```env
FIREBASE_PROJECT_ID=cricket-live-f9249
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cricket-live-f9249.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

Get these values from Firebase Console -> Project settings -> Service accounts -> Generate new private key. Use the `client_email`, `private_key`, and project ID from the downloaded service-account JSON.

Never prefix these variables with `NEXT_PUBLIC_`.

## 3. Run

```bash
npm run dev
```

Then test:

- `/`
- `/tournament/<TOURNAMENT_ID>`
- `/tournament/matches/<TOURNAMENT_ID>`
- `/tournament/manage-match/<TOURNAMENT_ID>`
- `/scoring/<TOURNAMENT_ID>/<MATCH_ID>`
- `/tournament/stats/<TOURNAMENT_ID>`

## 4. Verify real SSR

Use View Source (not just Elements) and confirm the page contains rendered HTML/data before JavaScript hydration.

For a production test:

```bash
npm run build
npm run start
```

## Important

`/my-matches` and `/my-tournaments` are user-specific. True server-side personalized data requires a server-readable Firebase Auth session cookie. Their current browser auth + realtime logic was intentionally not replaced, because doing so would change the existing authentication behavior. They can still be migrated in a second, isolated auth-session layer.

Static SEO pages do not need `getServerSideProps`: Next.js already prerenders them to HTML at build time (SSG), which is normally faster than per-request SSR.
