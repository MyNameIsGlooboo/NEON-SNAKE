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
const tileCount = 20;
let canvasSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let directionQueue = [];
let score = 0;
let highScore = 0;
let gameSpeed = 84;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

function initGame() {
    canvasSize = Math.min(canvas.parentElement.clientWidth, 400);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = canvasSize / tileCount;
    
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    generateFood();
    score = 0;
    dx = 1;
    dy = 0;
    gameSpeed = 120;
    updateScore();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

function updateScore() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        document.cookie = `high_score=${highScore}; expires=${d.toUTCString()}; path=/`;
    }
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#00ffaa';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffaa';
        } else if (index === snake.length - 1) {
            ctx.fillStyle = '#00aaff';
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#00d9ff';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#00d9ff';
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = 'rgba(0, 0, 30, 0.5)';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
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
}

function move() {
    while (directionQueue.length > 0) {
        const nextDir = directionQueue.shift();
        if (dx !== -nextDir.dx || dy !== -nextDir.dy) {
            dx = nextDir.dx;
            dy = nextDir.dy;
            break;
        }
    }
    
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
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
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
        
        if (gameSpeed > 70) {
            gameSpeed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

function gameStep() {
    if (gameRunning && !gamePaused) {
        move();
        draw();
    }
}

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

function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('show');
}

function handleKeyPress(e) {
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
    
    if (e.keyCode === 37 && dx !== 1) {
        directionQueue.push({ dx: -1, dy: 0 });
    }
    else if (e.keyCode === 38 && dy !== 1) {
        directionQueue.push({ dx: 0, dy: -1 });
    }
    else if (e.keyCode === 39 && dx !== -1) {
        directionQueue.push({ dx: 1, dy: 0 });
    }
    else if (e.keyCode === 40 && dy !== -1) {
        directionQueue.push({ dx: 0, dy: 1 });
    }
    else if (e.keyCode === 32) {
        pauseGame();
    }
}

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
    
    if (Math.max(Math.abs(diffX), Math.abs(diffY)) < 20) return;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && dx !== 1) {
            directionQueue.push({ dx: -1, dy: 0 });
        } else if (diffX < 0 && dx !== -1) {
            directionQueue.push({ dx: 1, dy: 0 });
        }
    } else {
        if (diffY > 0 && dy !== 1) {
            directionQueue.push({ dx: 0, dy: -1 });
        } else if (diffY < 0 && dy !== -1) {
            directionQueue.push({ dx: 0, dy: 1 });
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
}

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

highScore = getCookie('high_score');
highScoreElement.textContent = highScore;

initGame();
window.addEventListener('resize', initGame);

function startGame() {
    if (!gameRunning) {
        welcomeScreen.style.display = 'none';
        initGame();
        gameRunning = true;
        gamePaused = false;
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        gameLoop = setInterval(gameStep, gameSpeed);
        gameOverScreen.classList.remove('show');
        document.getElementById('game-paused').classList.remove('show');
    }
}
