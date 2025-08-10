# Scoreboard feature — implementation plan (targeted for web hosting)

Goal
- Provide a scoreboard that is deployable to static web hosting (GitHub Pages, Netlify, Vercel, S3 + CloudFront, etc.).
- Show the scoreboard at the start and at the end of each game.
- Persist scores locally (localStorage) and optionally attempt to send to a remote API if a server is deployed separately.

High-level approach
- Make the repository and site static-first: HTML, CSS and JS only, with no required server-side Python.
- The frontend implements the scoreboard client-side (localStorage). If a remote API exists at /api/scores (deployed separately), the frontend will optionally POST to it and fall back to localStorage on failure.
- Ensure there are no runtime Python files required by a static host; if a backend is desired it should be deployed independently and pointed to by DNS or by calling its absolute URL.

Steps
1) Use this plan file (plan.md) as the canonical reference for static/web deployment.
2) Remove server-side artifacts from the default/static deploy target:
   - Delete or archive app.py and any server-only files from the branch or deployment bundle destined for static hosting.
   - Keep API server code (if you want it) in a separate branch or a separate repository to deploy to a server environment.
   - STATUS: app.py has already been removed from the working tree (per your message). If there are any other server-side files you want removed or archived (examples: server.py, api.py, wsgi.py, any .py implementing Flask/Django, SQLite DB files like app.db, requirements.txt, Procfile), please add their exact paths to the chat and I will prepare repository edits to either delete or move them into an archive folder (e.g., archive_server/).
   - Recommended workflow when additional server files exist:
     1. If you want to permanently remove them from the branch (delete from git history later if necessary), use git rm <path> and commit.
     2. If you want to preserve them but exclude from static deploy, move them into a subfolder (archive_server/) with git mv <path> archive_server/ and commit. This keeps them in the repo but out of the static packaging root.

3) Convert scoreboard to client-side storage (localStorage) and add UI:
   - Add/ensure a leaderboard panel shown on the welcome and game-over screens.
   - Add an input for player name on game-over and allow skipping.
   - Store scores in localStorage under a single key (neon_snake_scores).
4) Keep an optional remote submission path:
   - When submitting a score the frontend will attempt to POST to /api/scores (relative path) so that if you deploy an API under the same origin it will be used automatically.
   - For static hosts, you may configure a reverse proxy or use an absolute backend URL if the server is hosted separately.
   - On POST failure the client should save to localStorage so the feature works offline and on pure static hosts.
5) CI / Tests / Hosting checklist:
   - Ensure tests that check only static assets pass (tests/test_files_exist.py).
   - Remove or mark server-dependent tests as optional or run them in a server-capable environment.
   - Confirm snake_game.html references snake_game.css and snake_game.js and that those files are present in the final artifact.
6) Deploying to a static host:
   - GitHub Pages: push to gh-pages branch (or use repository settings to serve from docs/ or main branch).
   - Netlify / Vercel: connect the repository and select the branch; no build step required for static files.
   - S3 + CloudFront: upload the built static files and invalidate caches as needed.
   - Ensure the deployment does not include server-only files (app.py, SQLite DB, etc.) unless you intend to deploy a server-side API separately.
7) Optional centralized scoreboard:
   - If you want a global leaderboard, deploy the Flask (or other) API separately (e.g., to a small VPS, Heroku-like environment, or serverless container).
   - Update the frontend to POST to the absolute API URL or use a proxy/redirect so the relative /api/scores path resolves to your server.

Notes / decisions
- Primary target: static web hosting so the game can be deployed quickly with zero server maintenance.
- Server-side API is optional and should be treated as a separate deployable component (different repo/branch or separate deployment target).

Next steps / How I can help now
- If you want me to archive other server files, add their exact paths to the chat (e.g., backend/app.py, api.py, requirements.txt, app.db). I will then:
  1) Prepare SEARCH/REPLACE edits to move or remove them.
  2) Provide the exact git commands to run to stage and commit those changes.

Suggested commands to run now (from repository root)
```bash
git add -A
git commit -m "chore: remove server-side artifacts (app.py removed)"
```
