/* Extracted script from snake_game.html */
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over');
const upButton = document.getElementById('up-btn');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');
const downButton = document.getElementById('down-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const startWelcomeButton = document.getElementById('start-welcome-btn');

let gridSize;
const tileCount = 20; // Reduced for 50% bigger tiles
let canvasSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let directionQueue = [];
let score = 0;
let highScore = 0;
let gameSpeed = 84; // 30% faster (120 * 0.7 = 84)
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Initialize game
function initGame() {
    // Set canvas size based on container and devicePixelRatio for crisp rendering
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvasSize = Math.min(canvas.parentElement.clientWidth, 400);
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    canvas.width = Math.floor(canvasSize * dpr);
    canvas.height = Math.floor(canvasSize * dpr);
    // scale the drawing context so 1 unit = 1 CSS pixel
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gridSize = canvasSize / tileCount;
    
    snake = [
        {x: 10, y: 10}, // Adjusted for new grid size (20 tiles)
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    generateFood();
    score = 0;
    dx = 1;
    dy = 0;
    gameSpeed = 120; // Reset game speed to initial value
    updateScore();
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

/* Update score display and persist high score to localStorage */
function updateScore() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        if (highScoreElement) highScoreElement.textContent = highScore;
        try {
            localStorage.setItem('neon_snake_high_score', String(highScore));
        } catch (e) {
            // ignore storage errors (e.g., quota, privacy modes)
        }
    }
}

// Draw game elements
function draw() {
    // Clear canvas using CSS pixel canvasSize (works correctly with DPR scaling)
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw snake
    snake.forEach((segment, index) => {
        // save/restore so shadows don't leak between elements
        ctx.save();
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ffaa';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffaa';
        } else if (index === snake.length - 1) {
            // Tail - no shadow and different color
            ctx.fillStyle = '#00aaff';
            ctx.shadowBlur = 0;
        } else {
            // Body
            ctx.fillStyle = '#00d9ff';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#00d9ff';
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = 'rgba(0, 0, 30, 0.5)';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.restore();
    });
    
    // Draw food
    ctx.save();
    ctx.fillStyle = '#ff0066';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0066';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2, 
        food.y * gridSize + gridSize/2, 
        gridSize/2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
}

// Move snake
function move() {
    // Process direction queue
    while (directionQueue.length > 0) {
        const nextDir = directionQueue.shift();
        // Only allow 90-degree turns
        if (dx !== -nextDir.dx || dy !== -nextDir.dy) {
            dx = nextDir.dx;
            dy = nextDir.dy;
            break; // only process one direction change per frame
        }
    }
    
    // Create new head
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Game over conditions
    if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= tileCount || 
        head.y >= tileCount ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        endGame();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
        
        // Increase speed slightly
        if (gameSpeed > 70) {
            gameSpeed -= 2;
            // Restart the game loop with the new speed
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        // Remove tail
        snake.pop();
    }
}

// Main game loop
function gameStep() {
    if (gameRunning && !gamePaused) {
        move();
        draw();
    }
}

// Start game

// Pause game
function pauseGame() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? 'RESUME' : 'PAUSE';
        const pausedScreen = document.getElementById('game-paused');
        if (gamePaused) {
            pausedScreen.classList.add('show');
        } else {
            pausedScreen.classList.remove('show');
        }
    }
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('show');
}

// Handle keyboard input
function handleKeyPress(e) {
    // Prevent arrow keys from scrolling page
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }

    // If game-over modal is shown, allow Esc to close and Enter to submit
    if (gameOverScreen && gameOverScreen.classList.contains('show')) {
        if (e.keyCode === 27) { // Esc
            gameOverScreen.classList.remove('show');
            gameOverScreen.setAttribute('aria-hidden', 'true');
        } else if (e.keyCode === 13) { // Enter
            const form = document.getElementById('score-submit-form');
            if (form) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
        return;
    }

    // Left arrow
    if (e.keyCode === 37 && dx !== 1) {
        directionQueue.push({ dx: -1, dy: 0 });
    }
    // Up arrow
    else if (e.keyCode === 38 && dy !== 1) {
        directionQueue.push({ dx: 0, dy: -1 });
    }
    // Right arrow
    else if (e.keyCode === 39 && dx !== -1) {
        directionQueue.push({ dx: 1, dy: 0 });
    }
    // Down arrow
    else if (e.keyCode === 40 && dy !== -1) {
        directionQueue.push({ dx: 0, dy: 1 });
    }
    // Space bar to pause
    else if (e.keyCode === 32) {
        pauseGame();
    }
}

// Touch controls
function goUp() {
    if (dy !== 1) {
        directionQueue.push({ dx: 0, dy: -1 });
    }
}

function goLeft() {
    if (dx !== 1) {
        directionQueue.push({ dx: -1, dy: 0 });
    }
}

function goRight() {
    if (dx !== -1) {
        directionQueue.push({ dx: 1, dy: 0 });
    }
}

function goDown() {
    if (dy !== -1) {
        directionQueue.push({ dx: 0, dy: 1 });
    }
}

// Swipe controls
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Only consider it a swipe if the movement is significant
    if (Math.max(Math.abs(diffX), Math.abs(diffY)) < 20) return;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0 && dx !== 1) {
            // Swipe left
            directionQueue.push({ dx: -1, dy: 0 });
        } else if (diffX < 0 && dx !== -1) {
            // Swipe right
            directionQueue.push({ dx: 1, dy: 0 });
        }
    } else {
        // Vertical swipe
        if (diffY > 0 && dy !== 1) {
            // Swipe up
            directionQueue.push({ dx: 0, dy: -1 });
        } else if (diffY < 0 && dy !== -1) {
            // Swipe down
            directionQueue.push({ dx: 0, dy: 1 });
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
}

// Event listeners
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', startGame);
startWelcomeButton.addEventListener('click', startGame);
upButton.addEventListener('click', goUp);
leftButton.addEventListener('click', goLeft);
rightButton.addEventListener('click', goRight);
downButton.addEventListener('click', goDown);
document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);

/* Focus trap for modal: keep Tab focus inside modal when open */
function trapModalFocus(e) {
    if (!gameOverScreen || !gameOverScreen.classList.contains('show')) return;
    if (e.key !== 'Tab') return;
    const focusable = gameOverScreen.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
        if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
    } else {
        if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
}
document.addEventListener('keydown', trapModalFocus, true);

/* Load initial high score from localStorage (fallback to 0) */
(function loadHighScore() {
    try {
        const hs = localStorage.getItem('neon_snake_high_score');
        highScore = hs ? (parseInt(hs, 10) || 0) : 0;
    } catch (e) {
        highScore = 0;
    }
    if (highScoreElement) highScoreElement.textContent = highScore;
})();

/* --- Leaderboard / score persistence (client-first, localStorage fallback) --- */

function _escapeHtml(s) {
    return String(s || '').replace(/[&<>"'`=\/]/g, function (c) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        }[c];
    });
}

function getLocalScores() {
    try {
        return JSON.parse(localStorage.getItem('neon_snake_scores') || '[]');
    } catch (e) {
        return [];
    }
}

function saveLocalScores(scores) {
    try {
        localStorage.setItem('neon_snake_scores', JSON.stringify(scores));
    } catch (e) {
        // ignore quota errors
    }
}

function addLocalScore(name, score, ts) {
    const scores = getLocalScores();
    scores.push({ name: name || null, score: score, ts: ts });
    scores.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.ts || '').localeCompare(b.ts || '');
    });
    if (scores.length > 100) scores.length = 100;
    saveLocalScores(scores);
    // Keep high score in sync with localStorage when adding a local score
    if (typeof score === 'number' && score > highScore) {
        highScore = score;
        if (highScoreElement) highScoreElement.textContent = highScore;
        try {
            localStorage.setItem('neon_snake_high_score', String(highScore));
        } catch (e) {
            // ignore
        }
    }
    return scores;
}

function renderLeaderboardToElem(scores, olElem, limit = 10) {
    if (!olElem) return;
    olElem.innerHTML = '';
    const list = (scores || []).slice(0, limit);
    if (list.length === 0) {
        olElem.insertAdjacentHTML('beforeend', '<li class="empty">No scores yet</li>');
        return;
    }
    let rank = 1;
    for (const item of list) {
        const name = item.name ? _escapeHtml(item.name) : '—';
        let tsHtml = '';
        if (item.ts) {
            try {
                const d = new Date(item.ts);
                tsHtml = `<span class="score-ts">${_escapeHtml(d.toLocaleString())}</span>`;
            } catch (e) {
                tsHtml = `<span class="score-ts">${_escapeHtml(item.ts)}</span>`;
            }
        }
        const html = `
<li class="score-row">
  <span class="rank">${rank}</span>
  <span class="player" title="${_escapeHtml(name)}">${name}</span>
  <span class="score">${item.score}</span>
  ${tsHtml}
</li>`;
        olElem.insertAdjacentHTML('beforeend', html);
        rank++;
    }
}

/* Try to submit to remote API; resolves with returned JSON on success, rejects on failure */
function submitToApi(name, score) {
    return fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || null, score: score })
    }).then(resp => {
        if (!resp.ok) throw new Error('remote submit failed');
        return resp.json();
    });
}

/* UI wiring */
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardListGameOver = document.getElementById('leaderboard-list-gameover');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const welcomeLeaderboard = document.getElementById('welcome-leaderboard');
const gameOverLeaderboard = document.getElementById('game-over-leaderboard');
const playerNameInput = document.getElementById('player-name');
const submitScoreBtn = document.getElementById('submit-score-btn');
const skipSubmitBtn = document.getElementById('skip-submit-btn');
const scoreSubmitForm = document.getElementById('score-submit-form');
const closeGameOverBtn = document.getElementById('close-game-over');
/* remember what had focus before opening modal so we can restore it */
let _prevActiveElement = null;

/* Input improvements: reflect filled state, enforce maxlength defensively */
if (playerNameInput) {
    playerNameInput.addEventListener('input', function () {
        if (this.value && this.value.trim().length > 0) {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
        // enforce max length defensively
        if (this.value.length > 32) this.value = this.value.slice(0, 32);
    });
}

/* Refresh both leaderboards from localStorage */
function refreshLeaderboards() {
    const scores = getLocalScores();
    renderLeaderboardToElem(scores, leaderboardList);
    renderLeaderboardToElem(scores, leaderboardListGameOver);
}

/* Utility: toast notifications */
function showToast(message, timeout = 2200) {
    try {
        let el = document.getElementById('toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
        el.setAttribute('aria-hidden','false');
        if (el._hideTimer) clearTimeout(el._hideTimer);
        el._hideTimer = setTimeout(() => {
            el.classList.remove('show');
            el.setAttribute('aria-hidden','true');
        }, timeout);
    } catch (e) {}
}

/* Public function to be called when game ends to show leaderboard and prepare submission */
function onGameOverShowLeaderboard(currentScore) {
    refreshLeaderboards();
    if (playerNameInput) playerNameInput.value = '';
    // show leaderboard area
    if (gameOverLeaderboard) gameOverLeaderboard.style.display = 'block';

    // Save previous focus and prevent background scroll
    try {
        _prevActiveElement = document.activeElement;
        document.body.classList.add('modal-open');
    } catch (e) {
        _prevActiveElement = null;
    }

    // show modal overlay and focus input
    if (gameOverScreen) {
        gameOverScreen.classList.add('show');
        gameOverScreen.setAttribute('aria-hidden', 'false');
        try {
            gameOverScreen.focus();
        } catch (e) {
            // ignore focus errors
        }
    }

    // Focus the name input when available
    setTimeout(function () {
        try {
            if (playerNameInput) playerNameInput.focus();
        } catch (e) {
            // ignore focus errors in some browsers / headless
        }
    }, 120);
}

/* Hook into existing endGame behavior by augmenting endGame (endGame already calls showing UI) */
const _originalEndGame = endGame;
endGame = function () {
    // call original endGame to set UI and final score
    _originalEndGame();

    // Decorative standalone GAME OVER element removed; modal now displays the end state.

    // Then show the client-side leaderboard and ensure submission UI is visible
    onGameOverShowLeaderboard(score);
};

/* Submit / skip handlers (use form submit for accessibility) */
if (scoreSubmitForm) {
    scoreSubmitForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        const name = playerNameInput ? playerNameInput.value.trim() : '';
        const ts = new Date().toISOString();
        if (submitScoreBtn) {
            submitScoreBtn.disabled = true;
            submitScoreBtn.classList.add('loading');
        }
        const statusElem = document.getElementById('submit-status');
        if (statusElem) {
            statusElem.classList.remove('visually-hidden');
            statusElem.textContent = 'Submitting…';
        }

        submitToApi(name || null, score).then(remoteObj => {
            const rname = remoteObj && remoteObj.name !== undefined ? remoteObj.name : name || null;
            const rscore = remoteObj && remoteObj.score !== undefined ? remoteObj.score : score;
            const rts = remoteObj && remoteObj.ts ? remoteObj.ts : ts;
            addLocalScore(rname, rscore, rts);
            refreshLeaderboards();
            if (statusElem) statusElem.textContent = 'Score saved';
        }).catch(() => {
            // Fallback: save locally
            addLocalScore(name || null, score, ts);
            refreshLeaderboards();
            if (statusElem) statusElem.textContent = 'Saved locally';
        }).finally(() => {
            if (submitScoreBtn) {
                submitScoreBtn.disabled = false;
                submitScoreBtn.classList.remove('loading');
            }
            if (playerNameInput) playerNameInput.value = '';
            // keep modal visible briefly then close
            setTimeout(function () {
                if (gameOverScreen) {
                    gameOverScreen.classList.remove('show');
                    gameOverScreen.setAttribute('aria-hidden', 'true');
                }
                if (statusElem) {
                    const msg = statusElem.textContent || 'Score saved';
                    try { showToast(msg, 2400); } catch (e) {}
                    statusElem.classList.add('visually-hidden');
                }
                // restore body state and previous focus
                try {
                    document.body.classList.remove('modal-open');
                    if (_prevActiveElement && typeof _prevActiveElement.focus === 'function') _prevActiveElement.focus();
                } catch (e) {}
            }, 800);
        });
    });
}

if (skipSubmitBtn) {
    skipSubmitBtn.addEventListener('click', function () {
        const ts = new Date().toISOString();
        addLocalScore(null, score, ts);
        refreshLeaderboards();
        if (playerNameInput) playerNameInput.value = '';
        if (gameOverScreen) {
            gameOverScreen.classList.remove('show');
            gameOverScreen.setAttribute('aria-hidden', 'true');
        }
        // restore focus and body state
        try {
            document.body.classList.remove('modal-open');
            if (_prevActiveElement && typeof _prevActiveElement.focus === 'function') _prevActiveElement.focus();
        } catch (e) {}
    });
}

if (closeGameOverBtn) {
    closeGameOverBtn.addEventListener('click', function () {
        if (gameOverScreen) {
            gameOverScreen.classList.remove('show');
            gameOverScreen.setAttribute('aria-hidden', 'true');
        }
        try {
            document.body.classList.remove('modal-open');
            if (_prevActiveElement && typeof _prevActiveElement.focus === 'function') _prevActiveElement.focus();
        } catch (e) {}
    });
}

/* Welcome screen view leaderboard toggle */
if (viewLeaderboardBtn && welcomeLeaderboard) {
    viewLeaderboardBtn.addEventListener('click', function () {
        const opened = welcomeLeaderboard.classList.toggle('open');
        welcomeLeaderboard.setAttribute('aria-hidden', opened ? 'false' : 'true');
        if (opened) {
            refreshLeaderboards();
            const closeBtn = document.getElementById('close-welcome-leaderboard');
            if (closeBtn) closeBtn.focus();
        } else {
            viewLeaderboardBtn.focus();
        }
    });
    const closeWelcomeBtn = document.getElementById('close-welcome-leaderboard');
    if (closeWelcomeBtn) closeWelcomeBtn.addEventListener('click', function () {
        welcomeLeaderboard.classList.remove('open');
        welcomeLeaderboard.setAttribute('aria-hidden', 'true');
        viewLeaderboardBtn.focus();
    });
}

/* Initialize leaderboards on load */
document.addEventListener('DOMContentLoaded', function () {
    refreshLeaderboards();
    // Keep welcome leaderboard and any modals hidden by default on initial load
    if (welcomeLeaderboard) {
        welcomeLeaderboard.classList.remove('open');
        welcomeLeaderboard.setAttribute('aria-hidden', 'true');
    }
    if (gameOverScreen) {
        gameOverScreen.classList.remove('show');
        gameOverScreen.setAttribute('aria-hidden', 'true');
    }
});

/* Initial setup (preserve existing behavior) */
initGame();
window.addEventListener('resize', initGame);

// Hide welcome screen when game starts
function startGame() {
    if (!gameRunning) {
        // Decorative standalone GAME OVER element removed; modal handles visibility now.

        welcomeScreen.style.display = 'none';
        if (welcomeLeaderboard) welcomeLeaderboard.style.display = 'none';
        initGame();
        gameRunning = true;
        gamePaused = false;
        // Clear any existing game loop
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        gameLoop = setInterval(gameStep, gameSpeed);
        gameOverScreen.classList.remove('show');
        // Also hide pause screen if visible
        document.getElementById('game-paused').classList.remove('show');
    }
}
