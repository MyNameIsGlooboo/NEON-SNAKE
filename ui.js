function updateScore() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        // Save new high score to cookie
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        document.cookie = `high_score=${highScore}; expires=${d.toUTCString()}; path=/`;
    }
}

// Hide welcome screen when game starts
function startGame() {
    if (!gameRunning) {
        welcomeScreen.style.display = 'none';
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

// Function to get cookie by name
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return parseInt(cookieValue);
        }
    }
    return 0;
}

// Get initial high score from cookie
highScore = getCookie('high_score');
highScoreElement.textContent = highScore;
