const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const highscoreDisplay = document.getElementById('highscore');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');

let score = 0;
let highscore = localStorage.getItem('pulse_highscore') || 0;
highscoreDisplay.innerText = highscore;

let gameState = 'START'; // START, PLAYING, GAMEOVER

// Cores neon do jogo
const colors = ['#00f3ff', '#ff0055', '#ffe600', '#00ff66'];
let playerColorIndex = 0;

// Objeto Jogador (A Esfera central)
let player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    radius: 14
};

// Obstáculos em queda
let obstacles = [];
let gameSpeed = 3;
let spawnTimer = 0;

function resetGame() {
    score = 0;
    scoreDisplay.innerText = score;
    obstacles = [];
    gameSpeed = 3;
    playerColorIndex = 0;
    spawnTimer = 0;
}

// Controles (Toque na tela ou clique)
window.addEventListener('pointerdown', () => {
    if (gameState === 'START') {
        startGame();
    } else if (gameState === 'PLAYING') {
        // Cicla a cor da esfera ao tocar
        playerColorIndex = (playerColorIndex + 1) % colors.length;
    } else if (gameState === 'GAMEOVER') {
        startGame();
    }
});

function startGame() {
    resetGame();
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    gameState = 'PLAYING';
}

function gameOver() {
    gameState = 'GAMEOVER';
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('pulse_highscore', highscore);
        highscoreDisplay.innerText = highscore;
    }
    gameoverScreen.classList.remove('hidden');
}

function spawnObstacle() {
    let size = 45;
    obstacles.push({
        x: canvas.width / 2,
        y: -50,
        size: size,
        colorIndex: Math.floor(Math.random() * colors.length)
    });
}

function update() {
    if (gameState !== 'PLAYING') return;

    spawnTimer++;
    if (spawnTimer > 70) {
        spawnObstacle();
        spawnTimer = 0;
        gameSpeed += 0.05; // Aumenta a dificuldade progressivamente
    }

    // Atualiza obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += gameSpeed;

        // Condição de colisão simples com o jogador na base
        if (
            obstacles[i].y + obstacles[i].size / 2 >= player.y - player.radius &&
            obstacles[i].y - obstacles[i].size / 2 <= player.y + player.radius
        ) {
            // Verifica se a cor bate com a do obstáculo
            if (obstacles[i].colorIndex === playerColorIndex) {
                score += 10;
                scoreDisplay.innerText = score;
                obstacles.splice(i, 1); // Passou com sucesso!
                continue;
            } else {
                gameOver(); // Bateu na cor errada!
            }
        }

        // Remove obstáculos que passaram da tela
        if (obstacles[i].y > canvas.height + 50) {
            obstacles.splice(i, 1);
        }
    }
}

function draw() {
    // Limpa o canvas
    ctx.fillStyle = '#090914';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha obstáculos
    for (let obs of obstacles) {
        ctx.fillStyle = colors[obs.colorIndex];
        ctx.shadowBlur = 12;
        ctx.shadowColor = colors[obs.colorIndex];
        ctx.fillRect(obs.x - obs.size / 2, obs.y - 15, obs.size, 30);
    }
    ctx.shadowBlur = 0; // Reseta sombra

    // Desenha o Jogador (Esfera neon)
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = colors[playerColorIndex];
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors[playerColorIndex];
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Inicia o loop de renderização
loop();
