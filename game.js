const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 600;

const keys = {};
let player = {
    x: 500,
    y: 300,
    size: 40,
    color: 'blue',
    speed: 4,
    money: 0
};

let bullets = [];
let enemies = [];
let objects = [];

function spawnEnemy() {
    enemies.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        size: 40,
        color: 'red',
        alive: true
    });
}

function spawnObjects() {
    for (let i = 0; i < 50; i++) {
        objects.push({
            x: Math.random() * 2000 - 1000,
            y: Math.random() * 2000 - 1000,
            type: Math.random() > 0.5 ? 'tree' : 'house'
        });
    }
}

spawnObjects();
setInterval(spawnEnemy, 3000);

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

canvas.addEventListener('click', e => {
    bullets.push({
        x: player.x,
        y: player.y,
        dx: Math.cos(0) * 10,
        dy: Math.sin(0) * 10
    });
});

function updatePlayer() {
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;
}

function updateBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
    });
    bullets = bullets.filter(b => b.x > -2000 && b.x < 2000 && b.y > -2000 && b.y < 2000);
}

function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (enemy.alive && Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < enemy.size) {
                enemy.alive = false;
                bullets.splice(bIndex, 1);
                player.money += 20;
            }
        });
    });

    enemies = enemies.filter(e => e.alive);
}

function drawFloor() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#6db3f2");
    gradient.addColorStop(1, "#1e3c72");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawObjects() {
    objects.forEach(obj => {
        const dx = obj.x - player.x;
        const dy = obj.y - player.y;
        const scale = Math.max(0.5, 1 - dy / 1000);

        if (obj.type === 'tree') {
            ctx.fillStyle = 'green';
            ctx.beginPath();
            ctx.arc(canvas.width / 2 + dx, canvas.height / 2 + dy, 30 * scale, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'house') {
            ctx.fillStyle = 'brown';
            ctx.fillRect(canvas.width / 2 + dx - 30 * scale, canvas.height / 2 + dy - 30 * scale, 60 * scale, 60 * scale);
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const scale = Math.max(0.5, 1 - dy / 1000);

        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + dx, canvas.height / 2 + dy, enemy.size * 0.5 * scale, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, player.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawBullets() {
    bullets.forEach(bullet => {
        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;

        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + dx, canvas.height / 2 + dy, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Money: $${player.money}`, 20, 30);
}

function gameLoop() {
    updatePlayer();
    updateBullets();
    checkCollisions();

    drawFloor();
    drawObjects();
    drawEnemies();
    drawPlayer();
    drawBullets();
    drawHUD();

    requestAnimationFrame(gameLoop);
}

gameLoop();
