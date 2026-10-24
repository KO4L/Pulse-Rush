const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const snakeValueDisplay = document.getElementById('snakeValue');
const highscoreDisplay = document.getElementById('highscore');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = { x: 0, y: 0, value: 1 };
let snakeTotalValue = 5;
let highscore = localStorage.getItem('math_snake_highscore') || 5;
highscoreDisplay.innerText = highscore;

let gameState = 'START'; // START, PLAYING, GAMEOVER
let gameInterval = null;

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
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
    
    // A comida gera um valor proporcional ou ligeiramente desafiador baseado no tamanho da cobra
    let minVal = Math.max(1, snakeTotalValue - 4);
    let maxVal = snakeTotalValue + 6;
    food.value = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

window.addEventListener('pointerdown', () => {
    if (gameState === 'START' || gameState === 'GAMEOVER') {
        iniciarJogo();
    }
});

function iniciarJogo() {
    resetGame();
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    gameState = 'PLAYING';
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120); // Velocidade da cobra
}

function mudarDirecao(novaDir) {
    if (novaDir === 'UP' && direction !== 'DOWN') nextDirection = 'UP';
    if (novaDir === 'DOWN' && direction !== 'UP') nextDirection = 'DOWN';
    if (novaDir === 'LEFT' && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (novaDir === 'RIGHT' && direction !== 'LEFT') nextDirection = 'RIGHT';
}

// Controles por teclado para PC também
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') mudarDirecao('UP');
    if (e.key === 'ArrowDown') mudarDirecao('DOWN');
    if (e.key === 'ArrowLeft') mudarDirecao('LEFT');
    if (e.key === 'ArrowRight') mudarDirecao('RIGHT');
});

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
    
    // Calcula nova cabeça
    let head = { ...snake[0] };
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;

    // Colisão com as bordas (Game Over)
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

    // Verifica se comeu a comida
    if (head.x === food.x && head.y === food.y) {
        // REGRA PRINCIPAL: A cobra só pode comer se o valor dela for >= ao valor da comida
        if (snakeTotalValue >= food.value) {
            snakeTotalValue += food.value; // Soma o valor ao corpo
            snakeValueDisplay.innerText = snakeTotalValue;
            gerarComida();
        } else {
            // Se for menor, quebra!
            gameOver();
            return;
        }
    } else {
        snake.pop(); // Remove a cauda se não comeu
    }

    draw();
}

function draw() {
    // Fundo do tabuleiro
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a Comida (Bolinha com número)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Número dentro da comida
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.value, food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);

    // Desenha a Cobra
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#38bdf8' : '#0284c7';
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
}

// Desenha estado inicial estático
resetGame();
draw();
