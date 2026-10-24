const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const snakeValueDisplay = document.getElementById('snakeValue');
const highscoreDisplay = document.getElementById('highscore');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');

const gridSize = 20;
const tileCount = 18; // 18 * 20 = 360px largura/altura do canvas
canvas.width = 360;
canvas.height = 360;

let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = { x: 0, y: 0, value: 1 };
let snakeTotalValue = 5;
let highscore = localStorage.getItem('math_snake_highscore') || 5;
highscoreDisplay.innerText = highscore;

let gameState = 'START';
let gameInterval = null;

function resetGame() {
    snake = [
        { x: 9, y: 9 },
        { x: 8, y: 9 },
        { x: 7, y: 9 }
    ];
    snakeTotalValue = 5;
    snakeValueDisplay.innerText = snakeTotalValue;
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    gerarComida();
}

function gerarComida() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    let minVal = Math.max(1, snakeTotalValue - 4);
    let maxVal = snakeTotalValue + 6;
    food.value = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

// Iniciar ao tocar na tela de início ou game over
startScreen.addEventListener('pointerdown', iniciarJogo);
gameoverScreen.addEventListener('pointerdown', iniciarJogo);

function iniciarJogo(e) {
    e.preventDefault();
    resetGame();
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    gameState = 'PLAYING';
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 130);
}

function mudarDirecao(novaDir) {
    if (gameState !== 'PLAYING') return;
    if (novaDir === 'UP' && direction !== 'DOWN') nextDirection = 'UP';
    if (novaDir === 'DOWN' && direction !== 'UP') nextDirection = 'DOWN';
    if (novaDir === 'LEFT' && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (novaDir === 'RIGHT' && direction !== 'LEFT') nextDirection = 'RIGHT';
}

function gameOver() {
    gameState = 'GAMEOVER';
    clearInterval(gameInterval);
    if (snakeTotalValue > highscore) {
        highscore = snakeTotalValue;
        localStorage.setItem('math_snake_highscore', highscore);
        highscoreDisplay.innerText = highscore;
    }
    gameoverScreen.classList.remove('hidden');
}

function gameLoop() {
    direction = nextDirection;
    
    let head = { ...snake[0] };
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;

    // Colisão com as bordas
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Colisão com o próprio corpo
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Comeu a comida
    if (head.x === food.x && head.y === food.y) {
        if (snakeTotalValue >= food.value) {
            snakeTotalValue += food.value;
            snakeValueDisplay.innerText = snakeTotalValue;
            gerarComida();
        } else {
            gameOver();
            return;
        }
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Comida
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.value, food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);

    // Cobra
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#38bdf8' : '#0284c7';
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
}

resetGame();
draw();
