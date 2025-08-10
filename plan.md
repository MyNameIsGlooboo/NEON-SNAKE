# Scoreboard feature — implementation plan

Goal
- Add a persistent scoreboard that stores all user scores (with optional player name).
- Show the scoreboard at the start and at the end of each game.
- Provide a small on-disk database file (SQLite) to store scores and an API that the frontend will call.

High-level approach (recommended)
- Add a tiny backend (Flask) that serves the static files and exposes a JSON API backed by SQLite (scores.db).
- Keep the frontend static JS/HTML changes minimal: show a scoreboard panel on the welcome and game-over screens, allow entering a name or skipping, and POST scores to the API.

Steps
1) Create this plan file (plan.md).
2) Add a Flask app (app.py) that:
   - Serves static files (snake_game.html, snake_game.css, snake_game.js).
   - Exposes endpoints:
     - GET /api/scores -> returns top N scores JSON (sorted desc).
     - POST /api/scores -> accepts { name?, score } and stores a new row with timestamp.
   - Uses SQLite (scores.db) with a simple schema: id, name (nullable), score (int), ts (timestamp).
   - Serves CORS only if needed (keep local-only for now).
3) Add a small DB initializer script (create_db.py) to create scores.db and the table.
4) Update snake_game.html:
   - Add a scoreboard container/modal visible on the welcome and game-over screens.
   - Add an input for player name and a "skip" option.
5) Update snake_game.js:
   - Fetch and render leaderboard on load and after game over (GET /api/scores).
   - When game ends, allow submitting score with name (POST /api/scores).
   - Re-fetch leaderboard after a successful submit and display it.
   - Gracefully handle network errors (fall back to showing a message).
6) Add basic tests (tests/test_scoreboard_api.py) for the API (use Flask test client):
   - Test GET returns JSON list.
   - Test POST creates a new score and returns created resource/status.
7) Update README with brief instructions to run the server and view the game.
8) Optional: Add client-side localStorage fallback for environments without the API.

Notes / decisions
- I chose Flask + SQLite because it's minimal, easy to run locally, and works well with the static frontend.
- An alternative is to keep everything client-side using localStorage, but that won't create a repository-level "db file".
- The API will be intentionally simple (no auth) since this is a local game; if you want multi-user or remote deployment later we can add authentication and rate-limiting.

Suggested commands (run from repository root)
```bash
git add plan.md
git commit -m "chore(plan): add scoreboard implementation plan"
```
