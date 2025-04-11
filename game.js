window.onload = function() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'none';

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let player = {
        x: 50,
        y: canvas.height / 2,
        width: 50,
        height: 50,
        color: "blue",
        speed: 5,
        dx: 0,
        dy: 0,
        money: 0,
        gun: "pistol",
        skin: "blue"
    };

    let enemies = [
        { x: 300, y: 100, width: 50, height: 50, color: "red", health: 100, respawnTimer: 0 },
        { x: 500, y: 300, width: 50, height: 50, color: "green", health: 100, respawnTimer: 0 }
    ];

    let bullets = [];
    let powerUps = [
        { x: 200, y: 200, width: 30, height: 30, color: "yellow", type: "health", collected: false },
        { x: 600, y: 100, width: 30, height: 30, color: "purple", type: "speed", collected: false }
    ];
    let trees = [
        { x: 150, y: 150, width: 50, height: 70, color: "green" },
        { x: 400, y: 400, width: 50, height: 70, color: "green" }
    ];
    let houses = [
        { x: 600, y: 400, width: 100, height: 100, color: "brown" }
    ];

    canvas.addEventListener("click", function(e) {
        let bullet = {
            x: player.x + player.width,
            y: player.y + player.height / 2 - 5,
            width: 10,
            height: 5,
            color: "black",
            speed: 7
        };
        bullets.push(bullet);
    });

    function respawnEnemy(enemy) {
        enemy.x = Math.random() * canvas.width;
        enemy.y = Math.random() * canvas.height;
        enemy.health = 100;
        enemy.respawnTimer = 0;
    }

    function updateGameArea() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.x += player.dx;
        player.y += player.dy;

        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

        ctx.fillStyle = player.skin;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        for (let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            if (enemy.health <= 0) {
                if (enemy.respawnTimer === 0) {
                    enemy.respawnTimer = Date.now();
                }
                let respawnDelay = 5000; // 5 seconds respawn delay
                if (Date.now() - enemy.respawnTimer > respawnDelay) {
                    respawnEnemy(enemy);
                }
            } else {
                ctx.fillStyle = enemy.color;
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        }

        for (let i = 0; i < trees.length; i++) {
            let tree = trees[i];
            ctx.fillStyle = tree.color;
            ctx.fillRect(tree.x, tree.y, tree.width, tree.height);
        }

        for (let i = 0; i < houses.length; i++) {
            let house = houses[i];
            ctx.fillStyle = house.color;
            ctx.fillRect(house.x, house.y, house.width, house.height);
        }

        for (let i = 0; i < powerUps.length; i++) {
            let powerUp = powerUps[i];
            if (!powerUp.collected) {
                ctx.fillStyle = powerUp.color;
                ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            }
        }

        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i];
            bullet.x += bullet.speed;

            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            for (let j = 0; j < enemies.length; j++) {
                let enemy = enemies[j];
                if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                    enemy.health -= 10;
                    bullets.splice(i, 1);
                    i--;
                    if (enemy.health <= 0) {
                        player.money += 20;
                    }
                    break;
                }
            }
        }

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Money: $" + player.money, 10, 30);
    }

    function movePlayer(e) {
        if (e.key === "w") player.dy = -player.speed;
        if (e.key === "s") player.dy = player.speed;
        if (e.key === "a") player.dx = -player.speed;
        if (e.key === "d") player.dx = player.speed;
    }

    function stopPlayer(e) {
        if (e.key === "w" || e.key === "s") player.dy = 0;
        if (e.key === "a" || e.key === "d") player.dx = 0;
    }

    window.addEventListener("keydown", movePlayer);
    window.addEventListener("keyup", stopPlayer);

    function gameLoop() {
        updateGameArea();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();

    function showShop() {
        const shopMenu = document.createElement('div');
        shopMenu.style.position = 'absolute';
        shopMenu.style.top = '50%';
        shopMenu.style.left = '50%';
        shopMenu.style.transform = 'translate(-50%, -50%)';
        shopMenu.style.background = '#fff';
        shopMenu.style.padding = '20px';
        shopMenu.style.borderRadius = '10px';
        shopMenu.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
        shopMenu.innerHTML = `
            <h2>Shop</h2>
            <p>Money: $${player.money}</p>
            <button id="buyGun">Buy Gun (Cost: $100)</button><br><br>
            <button id="buySkin">Buy Skin (Cost: $50)</button><br><br>
            <button id="closeShop">Close Shop</button>
        `;

        document.body.appendChild(shopMenu);

        document.getElementById('buyGun').addEventListener('click', function() {
            if (player.money >= 100) {
                player.money -= 100;
                player.gun = "rifle";
                alert('You have purchased a Rifle!');
            } else {
                alert('Not enough money!');
            }
        });

        document.getElementById('buySkin').addEventListener('click', function() {
            if (player.money >= 50) {
                player.money -= 50;
                player.skin = "red";
                alert('You have purchased a new skin!');
            } else {
                alert('Not enough money!');
            }
        });

        document.getElementById('closeShop').addEventListener('click', function() {
            document.body.removeChild(shopMenu);
        });
    }

    window.addEventListener("keydown", function(e) {
        if (e.key === "p") {
            showShop();
        }
    });
};
