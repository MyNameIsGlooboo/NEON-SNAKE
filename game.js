const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over');
const welcomeScreen = document.getElementById('welcome-screen');

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
    // Set canvas size based on container
    canvasSize = Math.min(canvas.parentElement.clientWidth, 400);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
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

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
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
    });

    // Draw food
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

// End game
function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('show');
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
window.addEventListener('resize', initGame);

// Initial setup
initGame();
gameLoop = setInterval(gameStep, gameSpeed);
