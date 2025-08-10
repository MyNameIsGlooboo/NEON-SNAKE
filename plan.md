# Scoreboard feature — implementation plan (updated for static hosting)

Goal
- Provide a scoreboard that works on static web hosting (no server-side Python required).
- Show the scoreboard at the start and at the end of each game.
- Persist scores locally (localStorage) and optionally attempt to send to a remote API if available.

High-level approach
- Keep the site fully static (HTML/CSS/JS). Implement the scoreboard entirely client-side using localStorage.
- Optionally, when a remote API at /api/scores is present (for example if you deploy a backend separately), the frontend will attempt to POST scores there and fall back to local-only storage if the network request fails.

Steps
1) Use this plan file (plan.md).
2) Convert scoreboard to client-side storage (localStorage) and add UI:
   - Add a leaderboard panel shown on the welcome and game-over screens.
   - Add an input for player name on game-over and allow skipping.
   - Store scores in localStorage under a single key (neon_snake_scores).
3) Keep an optional remote submission path:
   - When submitting a score the frontend will attempt to POST to /api/scores.
   - If the POST succeeds, the returned record will also be stored locally for display.
   - If the POST fails (404 or network error), the score will be stored locally.
4) Tests that rely on a Flask API should be adapted or optional; the core game should work without any server.
5) Update README with instructions for static hosting (open snake_game.html) and note optional backend integration.

Notes / decisions
- This approach is static-host friendly (GitHub Pages, Netlify, etc.) and keeps user data in the browser.
- If you later want a centralized scoreboard, you can deploy the Flask app separately and the frontend will use it when available.

Suggested commands (run from repository root)
```bash
git add plan.md
git commit -m "chore(plan): switch to client-side scoreboard for static hosting"
```
