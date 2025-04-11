const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let keys = {};
let bullets = [];
let enemies = [];
let powerUps = [];
let money = 0;
let equippedGun = 'default';
let equippedSkin = 'default';
let lastShotTime = 0;
let gameRunning = false;
let showShop = false;

const player = {
    x: 400,
    y: 300,
    width: 30,
    height: 30,
    color: 'green',
    speed: 5,
    vy: 0,
    gravity: 1,
    jumpForce: -15,
    canJump: true
};

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.angle = angle;
        this.size = 5;
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = 'red';
        this.speed = 1.5;
        this.health = 1;
    }
    update() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.color = 'yellow';
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function spawnEnemies() {
    while (enemies.length < 5) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        enemies.push(new Enemy(x, y));
    }
}

function spawnPowerUps() {
    if (powerUps.length < 3 && Math.random() < 0.01) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        powerUps.push(new PowerUp(x, y));
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (keys['KeyW']) player.y -= player.speed;
    if (keys['KeyS']) player.y += player.speed;
    if (keys['KeyA']) player.x -= player.speed;
    if (keys['KeyD']) player.x += player.speed;

    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y > 300) {
        player.y = 300;
        player.vy = 0;
        player.canJump = true;
    }

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.x < 0 || bullet.y < 0 || bullet.x > canvas.width || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        enemy.draw();
        bullets.forEach((bullet, bIndex) => {
            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width && bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                money += 20;
            }
        });
    });

    powerUps.forEach((powerUp, pIndex) => {
        powerUp.draw();
        if (player.x < powerUp.x + powerUp.size && player.x + player.width > powerUp.x && player.y < powerUp.y + powerUp.size && player.y + player.height > powerUp.y) {
            powerUps.splice(pIndex, 1);
            money += 50;
        }
    });

    ctx.fillStyle = player.color;
    ctx.fillRect(canvas.width / 2 - player.width / 2, canvas.height / 2 - player.height / 2, player.width, player.height);

    ctx.fillStyle = 'black';
    ctx.fillText('Money: $' + money, 10, 20);

    spawnEnemies();
    spawnPowerUps();

    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space' && player.canJump) {
        player.vy = player.jumpForce;
        player.canJump = false;
    }
});
window.addEventListener('keyup', e => {
    keys[e.code] = false;
});
window.addEventListener('mousedown', e => {
    if (e.button === 0 && gameRunning) {
        const now = Date.now();
        let fireRate = equippedGun === 'fast' ? 150 : 400;
        if (now - lastShotTime > fireRate) {
            const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
            bullets.push(new Bullet(player.x, player.y, angle));
            lastShotTime = now;
        }
    }
});

function startGame() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('shopScreen').style.display = 'none';
    gameRunning = true;
    gameLoop();
}

function openShop() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('shopScreen').style.display = 'flex';
}

function closeShop() {
    document.getElementById('shopScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'flex';
}

function buyGun() {
    if (money >= 100) {
        money -= 100;
        equippedGun = 'fast';
        alert('You bought and equipped a faster gun!');
    } else {
        alert('Not enough money!');
    }
}

function buySkin() {
    if (money >= 150) {
        money -= 150;
        equippedSkin = 'blue';
        player.color = 'blue';
        alert('You bought and equipped a blue skin!');
    } else {
        alert('Not enough money!');
    }
}
