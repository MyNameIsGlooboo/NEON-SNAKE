const upButton = document.getElementById('up-btn');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');
const downButton = document.getElementById('down-btn');

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

// Touch controls
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

// Event listeners for touch controls
upButton.addEventListener('click', goUp);
leftButton.addEventListener('click', goLeft);
rightButton.addEventListener('click', goRight);
downButton.addEventListener('click', goDown);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
