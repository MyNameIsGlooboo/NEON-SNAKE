# UI improvement plan (plan_ui.md)
This document prioritizes the visual and UX fixes for the scoreboard and related UI in the Neon Snake app based on the three screenshots you provided (welcome, in-game, game-over). It is focused, actionable, and broken into small steps so we can implement and review incrementally.

Summary (quick)
- Problems observed: game-over submit input is visually weak; overlays feel cluttered and inconsistent; leaderboards panels lack hierarchy; some interactive controls (buttons, inputs) lack clear focus and affordance; canvas and surrounding chrome need consistent spacing and contrast.
- Goal: make scoreboard and submission flows visually clear, polished, and accessible while keeping the neon aesthetic.

Design goals
- Clear hierarchy: modal/card for game-over submission that reads top -> bottom (title -> score -> input -> actions -> leaderboard -> play again).
- Strong affordances: prominent primary action, visible focus states, good contrast for text and inputs.
- Consistency: leaderboard panels (welcome + game-over) share layout and visual treatment.
- Accessible: keyboard-friendly, ARIA roles, color-contrast friendly, supports reduced motion.
- Small, testable changes so we can iterate.

Color & typography (suggested variables)
- Accent cyan: #00e5ff
- Accent teal/green (score): #00ffaa
- Accent magenta (food / CTA): #ff00aa
- Background panels: rgba(2,6,15,0.9) / linear gradients as current
- Body font: keep system / Segoe UI; optionally add Google font later
- Use CSS variables; example:
  --accent-cyan: #00e5ff
  --accent-neon: #00ffaa
  --accent-cta: #ff00aa
  --panel-bg: rgba(6,8,20,0.9)

High level approach
1. Add a focused, accessible modal/card component CSS and small HTML tweaks for the game-over submission area.
2. Restyle the name input to be highly visible and provide an inline hint and clear focus glow.
3. Improve leaderboard panels: compact list items, clearer headings, consistent footer area.
4. Improve microinteractions: transitions for open/close, button hover, input focus, small entrance animation for modal.
5. Accessibility: tabindex, ARIA roles, keyboard handlers (Enter to submit, Esc to close leaderboard), prefers-reduced-motion.
6. Canvas polish: ensure canvas scales crisply on high DPI and has consistent padding/gap to controls.
7. QA & tests: visual checklist + run existing tests.

Concrete steps (priority order)
1) Game-over modal and submit input (HIGH)
   - Files: snake_game.html, snake_game.css, snake_game.js
   - Tasks:
     - Wrap the submit UI in a true modal container with role="dialog" and aria-modal="true".
     - When game ends, autofocus the name input (unless prefers-reduced-motion or user setting).
     - Style input to be larger, with neon outline and inner dark field; add icon or placeholder text "Enter name (optional)".
     - Make the primary submit button visually dominant (filled neon gradient) and secondary as ghost.
     - Add keyboard handling: Enter triggers submit when input focused; Esc closes the modal/leaderboard and returns to welcome state.
     - Add a smooth scale+fade animation for modal open/close; respect prefers-reduced-motion.

2) Leaderboard panel improvements (HIGH)
   - Files: snake_game.html, snake_game.css, snake_game.js
   - Tasks:
     - Use same "panel" component for welcome and game-over leaderboards; ensure consistent header/footer spacing.
     - Add empty-state card ("No scores yet") with subdued styling.
     - Make list rows clearer: left-aligned name, right-aligned score, optional timestamp in smaller type.
     - Add keyboard accessible close button and an explicit "View full leaderboard" action.
     - Ensure panels are properly hidden via class (e.g., `.open`) instead of style.display toggles; toggle `aria-hidden`.

3) Input and form usability (HIGH)
   - Files: snake_game.html, snake_game.css, snake_game.js
   - Tasks:
     - Add `label` connected to input (already present) and visually hide duplicate labels for screen readers if needed.
     - Validate input length client-side and trim whitespace.
     - Disable submit while network request in flight and show subtle spinner on the button.
     - After submit success/fail, show a small toast/inline confirmation and keep leaderboard visible.

4) Visual polish & spacing (MEDIUM)
   - Files: snake_game.css
   - Tasks:
     - Add CSS variables at top for colors and radii.
     - Tighten spacing rules to create consistent gaps between canvas, score, and controls.
     - Improve button sizing for desktop vs mobile.
     - Ensure leaderboard and modal max-widths are consistent (320-480px) and responsive.

5) Canvas & layout fixes (MEDIUM)
   - Files: snake_game.js, snake_game.css
   - Tasks:
     - Scale canvas for devicePixelRatio for crisper rendering: set width/height to canvasSize * dpr and scale context.
     - Maintain visual border/gap around canvas equal on all sides; center canvas within the panel.
     - Ensure touch controls collapse or move under the canvas on smaller screens.

6) Accessibility & keyboard flows (HIGH)
   - Files: snake_game.html, snake_game.js
   - Tasks:
     - Add role/aria attributes for panels/modal.
     - Tab order: ensure player name input, submit, skip, play again are reachable in logical order.
     - Add `aria-live` region for success/error messages from submit.
     - Support Esc to close modals and Enter to submit.
     - High-contrast mode: ensure text meets contrast ratio.

7) Microinteractions (LOW)
   - Files: snake_game.css
   - Tasks:
     - Small hover/press animation for buttons.
     - Subtle leaderboard row hover (lift + glow).
     - Optional sound / haptic hints (defer).

8) Testing & QA (HIGH)
   - Checklist:
     - Run pytest -q (CI already added).
     - Manual visual test across desktop and mobile widths: welcome, play, game-over, submit success, submit fail/fallback.
     - Accessibility checks: keyboard-only navigation, screen-reader labels, color contrast.
     - Performance check: canvas rendering with DPR scaling.

Implementation notes (how to implement the "submit input" improvement)
- HTML: change the game-over modal wrapper to use semantics:
  <div id="game-over" role="dialog" aria-modal="true" aria-labelledby="game-over-title" class="modal">
    <h2 id="game-over-title">GAME OVER!</h2>
    ...
    <form id="score-submit-form" novalidate>
      <label for="player-name" class="visually-hidden">Player name (optional)</label>
      <input id="player-name" ... />
      <div class="actions"> <button class="primary" type="submit">Submit</button> ... </div>
    </form>
  </div>
- CSS: `.modal { backdrop-filter, centered card, max-width:420px, padding:20px, border-radius:12px }` and `.player-name-input { font-size:1.05rem; padding:12px 14px; border-radius:10px; box-shadow: 0 8px 30px rgba(var(--accent),0.12) inset; border: 1px solid rgba(255,255,255,0.04); }` plus a focused outline using `box-shadow: 0 0 0 4px rgba(var(--accent-cyan),0.12)`.

Files to change
- snake_game.html — small structural adjustments: wrap submit UI in <form> and modal semantic attributes; add aria-live region for submit status; add data-attributes used by JS toggles.
- snake_game.css — add variables, modal and input styles, transitions, focus states, spinner styles, responsive tweaks.
- snake_game.js — small behavioral changes: autofocus input on open, handle Enter on form submit, disable submit while posting, show/hide modal by toggling `.show` or `.open` classes and set aria-hidden appropriately, add DPR scaling for canvas.

Suggested small tasks (granular)
- T1 (30–60m): Implement modal semantics and input autofocus + focus styles (html + css + js).
- T2 (30–60m): Improve primary/secondary button visuals and add disabled/spinner state (css + js).
- T3 (30m): Leaderboard row styling and empty state (css + js).
- T4 (30–60m): Canvas DPR scaling and spacing polish (js + css).
- T5 (30–60m): Accessibility keyboard handlers and aria-live notifications (js + html).
- T6 (20–30m): Visual QA, minor tweaks and commit.

Acceptance criteria
- Game-over modal visually centered and prominent; input clearly visible and focused on open.
- Submit button is clearly the primary action; pressing Enter submits when input focused.
- On network failure, fallback to local storage happens and the user sees a success/fallback confirmation.
- Leaderboards show top 10, empty-state message if none.
- Keyboard navigation and screen-reader labels work.
- Visuals remain responsive on mobile and desktop.

Example git commands (run from repository root)
```bash
git add snake_game.html snake_game.css snake_game.js
git commit -m "chore(ui): improve game-over modal and scoreboard UI (plan_ui)"
```

How I can help next
- I can produce focused SEARCH/REPLACE edits for the highest-priority changes (T1 and T2) and include the exact code changes to snake_game.html, snake_game.css and snake_game.js. Tell me "apply T1" to proceed and I will create the required SEARCH/REPLACE blocks.

References
- Use prefers-reduced-motion CSS media query when animating.
- Use `devicePixelRatio` scaling for canvases.
