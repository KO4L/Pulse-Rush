const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const snakeValueDisplay = document.getElementById('snakeValue');
const highscoreDisplay = document.getElementById('highscore');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');

const gridSize = 20;
const tileCount = 18; // 18 * 20 = 360px
canvas.width = 360;
canvas.height = 360;

let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let foods = []; // Lista com múltiplos consumíveis
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
    
    foods = [];
    gerarAlvosIniciais();
}

function gerarAlvosIniciais() {
    // Mantém sempre 4 consumíveis diferentes na tela
    while (foods.length < 4) {
        adicionarComidaUnica();
    }
}

function adicionarComidaUnica() {
    let novaX, novaY, conflito;
    do {
        novaX = Math.floor(Math.random() * tileCount);
        novaY = Math.floor(Math.random() * tileCount);
        
        conflito = false;
        // Evita gerar em cima da cobra
        for (let part of snake) {
            if (part.x === novaX && part.y === novaY) conflito = true;
        }
        // Evita gerar em cima de outra comida
        for (let f of foods) {
            if (f.x === novaX && f.y === novaY) conflito = true;
        }
    } while (conflito);

    // Gera um valor numérico desafiador em torno do valor atual da cobra
    let minVal = Math.max(1, snakeTotalValue - 6);
    let maxVal = snakeTotalValue + 8;
    let valor = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;

    foods.push({ x: novaX, y: novaY, value: valor });
}

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

    // Atravessar paredes (Efeito Pac-Man)
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    // Colisão com o próprio corpo
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Verifica se comeu algum dos consumíveis na tela
    let comeuIndex = -1;
    for (let i = 0; i < foods.length; i++) {
        if (head.x === foods[i].x && head.y === foods[i].y) {
            comeuIndex = i;
            break;
        }
    }

    if (comeuIndex !== -1) {
        let alvo = foods[comeuIndex];
        // Validação matemática: se a cobra for maior ou igual ao número, absorve e cresce
        if (snakeTotalValue >= alvo.value) {
            snakeTotalValue += alvo.value;
            snakeValueDisplay.innerText = snakeTotalValue;
            foods.splice(comeuIndex, 1); // Remove o consumível comido
            adicionarComidaUnica();     // Repõe um novo consumível
        } else {
            // Se for menor, quebra!
            gameOver();
            return;
        }
    } else {
        snake.pop(); // Remove a cauda se não comeu nada
    }

    draw();
}

function draw() {
    // Fundo limpo
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha todos os consumíveis redondos com seus números
    foods.forEach(f => {
        let posX = f.x * gridSize + gridSize / 2;
        let posY = f.y * gridSize + gridSize / 2;

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(posX, posY, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.value, posX, posY);
    });

    // Desenha a cobra redonda (cabeça e corpo)
    snake.forEach((part, index) => {
        let posX = part.x * gridSize + gridSize / 2;
        let posY = part.y * gridSize + gridSize / 2;

        ctx.fillStyle = index === 0 ? '#38bdf8' : '#0284c7';
        ctx.beginPath();
        ctx.arc(posX, posY, gridSize / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
    });
}

resetGame();
draw();
