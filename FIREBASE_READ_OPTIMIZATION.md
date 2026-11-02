# Firebase read optimization notes

## What changed

- `components/tournament/TeamRow.js` no longer opens one `onSnapshot()` listener for every team row. Team player counts are rendered from the SSR-provided count map.
- `hooks/useTournamentDetails.js` updates the visible squad count locally after a successful add/delete from the squad manager. The existing team listener and the player listener that is opened only while the squad modal is open remain in place.
- `pages/tournament/[id].js` passes the SSR count map into the hook and renders the hook's current counts.
- `lib/ssr/home.js` caches homepage aggregate statistics for 60 seconds per running server process and coalesces concurrent requests.
- `lib/ssr/auth.js` caches the SSR navbar display name for 30 seconds per running server process. `Navbar` does not open a duplicate user-document listener when SSR already supplied the name.
- Homepage and stats SSR now share the navbar SSR helper rather than independently fetching the same user profile.
- Firebase Admin SDK imports used by pages and SSR helpers are dynamically loaded in server-side functions, preventing those imports from being pulled into browser-side page modules.

## Reads that intentionally remain

SSR still reads Firestore documents/collections needed to render the requested page. Live scoring, overlay, match lists, and player-selection screens retain their realtime listeners because removing them would stop live updates. These listeners perform an initial read when they attach and additional reads when matching documents change.

The tournament detail SSR still obtains the team list and aggregate player counts. The count query for each team is retained for compatibility with existing Firestore data; this avoids downloading every player document merely to count them. Homepage aggregate counts run once per 60-second process-local cache window, not once per request on the same server process.

## Cache scope and freshness

The caches are in-memory and process-local. Serverless hosting can run multiple instances, each with its own cache, and instances can restart at any time. Navbar names can be up to 30 seconds stale; homepage counts can be up to 60 seconds stale. This is not a shared/distributed cache.

## Important limitation

Zero Firestore reads cannot be guaranteed while the app is required to render current Firestore-backed data with SSR and keep live scoring/realtime screens synchronized. To get closer to zero request-time reads, the data model would need maintained summary documents/counters or an external shared cache, plus a deliberate freshness policy and a migration of all player/match write paths. That larger migration is not silently applied here because it could change existing scoring and tournament behavior.

## Validation

All 132 JavaScript/JSX source files passed a TypeScript parser/transpile syntax scan. A full Next.js production build could not be run in this environment because npm registry access failed (`EAI_AGAIN`) while installing dependencies. Run `npm install` and `npm run build` in the project environment before deployment.
