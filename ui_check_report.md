# UI & Code Check Report

Summary of recent work
- Converted scoreboard to client-first with localStorage (neon_snake_scores) and added graceful fallback.
- Implemented a global scoreboard API backend at server/app.py (Flask) and added server/requirements.txt.
- Frontend now attempts to POST to `/api/scores` and merges remote/global scores with local scores in the UI.
- Game-over modal: accessible markup, focus trap, restore previous focus, body.modal-open to prevent background scroll.
- Submit flow: form-based submit, loading spinner on submit button, toast notifications, and network fallback to local save.
- High-score persisted to localStorage and kept in sync when local/global scores are added.
- Canvas DPR scaling added for crisper rendering on high-DPI displays.
- Major CSS work: neon theme, responsive layout, modal styling, improved mobile rules and centered canvas.
- Leaderboard rendering fixed so names show and are normalized; timestamps shown inline.

Most important next improvement (priority)
1) Make the global scoreboard robust and production-ready
   - Replace file-based JSON with a proper datastore (SQLite for small-scale or hosted DB).
   - Add input validation and sanitization (server-side) to prevent malformed entries.
   - Add basic rate limiting / abuse prevention (prevent spam score submissions).
   - Ensure atomic writes (use file locking or DB transactions) and safe error handling.
   - Consider authentication or scoped write tokens if you only want trusted submissions.
   - Add pagination and a capped result set for GET /api/scores.

Why this is top priority
- Right now the frontend posts to /api/scores and the server app.py writes to a JSON file. That is fine for local testing, but it is fragile and could corrupt under concurrent writes or be spammed. Making the server robust will ensure the "global" leaderboard is reliable for all users.

Planned implementation steps (suggested)
- Replace server/app.py storage with SQLite:
  1. Add server/db.py to handle a simple SQLite schema: (id, name, score, ts).
  2. Update server/app.py to use db.py functions and use transactions.
  3. Add basic validation: name length cap, numeric score, valid ISO ts.
  4. Add simple rate-limit middleware (in-memory per-IP sliding window) or require a minimal cooldown per client.
  5. Add a small health endpoint and logging.

Client-side follow-ups
- Show a "Pending uploads" indicator for local-only saves that haven't reached the server.
- Implement a retry queue with exponential backoff for failed POSTs.
- Allow configuration of API base URL (so deployments on a separate origin can be used).
- Improve deduplication: prefer server-assigned IDs or use a UUID when storing locally to correlate.

Files I changed recently (high level)
- snake_game.html (modal markup, toast)
- snake_game.css (major styling and responsive fixes)
- snake_game.js (DPR scaling, modal logic, leaderboard merging, submit handling)
- server/app.py (Flask API for global scores)
- server/requirements.txt
- Added plan_ui.md and ui_check_report.md (this file)
- CI and deploy workflows present (.github/workflows)

Quick verification commands (run from repository root)
```bash
git status
python -m pip install -r server/requirements.txt
python server/app.py
```

If you want me to proceed now
- I can implement the SQLite-backed server (server/db.py + update server/app.py) and a small retry queue on the client.
- Or I can implement client-side "Pending uploads" UI and retry logic first (safer, no server changes).
Reply with:
- "implement server-db" to add SQLite-backed server and safety, or
- "implement client-retry" to add retry queue + pending indicator and optional "resend" UI.
