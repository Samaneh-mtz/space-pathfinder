// game.js

// Initialize canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game state
let gameState = {
    level: 1,
    score: 0,
    time: 0,
    path: [],
    planetsReached: [],
    gameOver: false
};

// Player object
const player = {
    x: 50,
    y: canvas.height / 2,
    speed: 2,
    emoji: '🛸',
    radius: 40
};

// Planets array with movement and rotation properties
const planets = [
    { initialX: 200, initialY: 100, x: 700, y: 100, reached: false, emoji: '🪐', rotation: 0, rotationSpeed: 0.1, moveSpeed: 0.5, targetChangeTimer: 0 },
    { initialX: 700, initialY: 250, x: 700, y: 250, reached: false, emoji: '🌍', rotation: 0, rotationSpeed: 0.5, moveSpeed: 0.7, targetChangeTimer: 0 },
    { initialX: 500, initialY: 400, x: 700, y: 400, reached: false, emoji: '🌑', rotation: 0, rotationSpeed: 1, moveSpeed: 0.9, targetChangeTimer: 0 },
    { initialX: 100, initialY: 550, x: 700, y: 550, reached: false, emoji: '☄️', rotation: 0, rotationSpeed: 1.5, moveSpeed: 1.1, targetChangeTimer: 0 }
];

// Rocks array and emoji
let rocks = [];
const rockEmoji = '🪨';

// Interval variables
let timeInterval;
let rockInterval;

// Visual effect variables
let flashTimer = 0;
let flashColor = '';

// Set a random target for the planet
function setRandomTarget(planet) {
    const margin = 50;
    planet.targetX = margin + Math.random() * (canvas.width - 2 * margin);
    planet.targetY = margin + Math.random() * (canvas.height - 2 * margin);
    planet.targetChangeTimer = 100 + Math.random() * 400; // 100 to 300 frames (~1.6 to 5 seconds at 60 FPS)
}

// Start a new level
function startLevel() {
    player.x = 50;
    player.y = canvas.height / 2;
    gameState.path = [];
    gameState.time = 0;
    rocks = [];
    gameState.gameOver = false;
    flashTimer = 0;
    const currentPlanet = planets[gameState.level - 1];
    currentPlanet.x = currentPlanet.initialX;
    currentPlanet.y = currentPlanet.initialY;
    currentPlanet.rotation = 0;
    setRandomTarget(currentPlanet);
    timeInterval = setInterval(() => {
        if (!gameState.gameOver) gameState.time++;
    }, 1000);
    rockInterval = setInterval(spawnRock, 2000);
}

// Spawn a new rock
function spawnRock() {
    if (!gameState.gameOver) {
        const scale = 1 + Math.random();
        rocks.push({
            x: canvas.width,
            y: Math.random() * canvas.height,
            speed: 1 + Math.random() * 7,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 7,
            scale: scale,
            radius: 15 * scale
        });
    }
}

// Handle keyboard input
let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Update game state
function update() {
    if (!gameState.gameOver) {
        // Player movement
        let moved = false;
        if (keys['ArrowUp']) { player.y -= player.speed; moved = true; }
        if (keys['ArrowDown']) { player.y += player.speed; moved = true; }
        if (keys['ArrowLeft']) { player.x -= player.speed; moved = true; }
        if (keys['ArrowRight']) { player.x += player.speed; moved = true; }

        // Clamp player position to canvas
        player.x = Math.max(0, Math.min(player.x, canvas.width));
        player.y = Math.max(0, Math.min(player.y, canvas.height));

        // Update path
        if (moved && (gameState.path.length === 0 ||
            player.x !== gameState.path[gameState.path.length - 1].x ||
            player.y !== gameState.path[gameState.path.length - 1].y)) {
            gameState.path.push({ x: player.x, y: player.y });
        }

        // Move rocks
        rocks.forEach(rock => {
            rock.x -= rock.speed;
            rock.rotation += rock.rotationSpeed;
            rock.rotation = (rock.rotation % 360 + 360) % 360;
        });

        // Remove off-screen rocks
        rocks = rocks.filter(rock => rock.x > -20);

        // Check collision with rocks
        rocks.forEach(rock => {
            const distance = Math.hypot(player.x - rock.x, player.y - rock.y);
            if (distance < player.radius + rock.radius) {
                endGame(false);
            }
        });

        // Update current planet
        const currentPlanet = planets[gameState.level - 1];
        currentPlanet.rotation += currentPlanet.rotationSpeed;
        currentPlanet.rotation = (currentPlanet.rotation % 360 + 360) % 360;
        if (currentPlanet.targetChangeTimer <= 0) {
            setRandomTarget(currentPlanet);
        } else {
            currentPlanet.targetChangeTimer--;
        }

        // Move towards target
        const dx = currentPlanet.targetX - currentPlanet.x;
        const dy = currentPlanet.targetY - currentPlanet.y;
        const angle = Math.atan2(dy, dx);
        const moveDistance = Math.min(currentPlanet.moveSpeed, Math.hypot(dx, dy));
        currentPlanet.x += moveDistance * Math.cos(angle);
        currentPlanet.y += moveDistance * Math.sin(angle);

        // Check collision with planet
        const planetDistance = Math.hypot(player.x - currentPlanet.x, player.y - currentPlanet.y);
        if (planetDistance < 40) {
            currentPlanet.reached = true;
            gameState.planetsReached.push(gameState.level);
            flashColor = 'green';
            flashTimer = 10;
            endGame(true);
        }
    }
}

// Draw game elements
function draw() {
    // Clear canvas with dark background and grid
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#222';
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw player's path
    if (gameState.path.length >= 2) {
        ctx.strokeStyle = 'rgba(148, 223, 17, 0.5)'; // A semi-transparent green trail
        ctx.lineWidth = 2;                            // Thickness of the trail
        drawCatmullRomSpline(gameState.path, 0.5);    // Draw the smooth trail
    }
        ctx.stroke();


    // Draw rocks
    rocks.forEach(rock => {
        ctx.save();
        ctx.translate(rock.x, rock.y);
        ctx.rotate(rock.rotation * Math.PI / 180);
        ctx.scale(rock.scale, rock.scale);
        ctx.font = '30px Arial';
        ctx.fillText(rockEmoji, 0, 0);
        ctx.restore();
    });

    // Draw player
    ctx.font = '32px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(player.emoji, player.x - 16, player.y + 12);

    // Draw current planet with rotation
    const currentPlanet = planets[gameState.level - 1];
    ctx.save();
    ctx.translate(currentPlanet.x, currentPlanet.y);
    ctx.rotate(currentPlanet.rotation * Math.PI / 180);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '70px Arial';
    ctx.fillStyle = currentPlanet.reached ? 'yellow' : 'white';
    ctx.fillText(currentPlanet.emoji, 0, 0);
    ctx.restore();

    // Flash effect
    if (flashTimer > 0) {
        ctx.fillStyle = flashColor;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        flashTimer--;
    }
}

// Update UI elements
function updateUI() {
    const score = Math.max(1000 - gameState.path.length, 0);
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = gameState.time;
}

// End the game
function endGame(won) {
    clearInterval(timeInterval);
    clearInterval(rockInterval);
    gameState.gameOver = true;
    const endScreen = document.getElementById('end-screen');
    endScreen.style.display = 'block';
    document.getElementById('result').textContent = won ? 'Level Complete!' : 'Game Over';
    const score = Math.max(1000 - gameState.path.length, 0);
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-time').textContent = gameState.time;
    if (won) showMap();

    const restartButton = document.getElementById('restart');
    if (won && gameState.level < 4) {
        restartButton.textContent = 'Next Level';
        restartButton.onclick = () => {
            gameState.level++;
            endScreen.style.display = 'none';
            startLevel();
        };
    } else {
        restartButton.textContent = 'Restart';
        restartButton.onclick = resetGame;
    }
}

// Display map of reached planets
function showMap() {
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = '';
    planets.forEach((planet, i) => {
        const p = document.createElement('p');
        p.textContent = `Planet ${i + 1}: ${planet.reached ? 'Reached' : 'Not Reached'}`;
        mapDiv.appendChild(p);
    });
}

// Function to draw a smooth Catmull-Rom spline trail
function drawCatmullRomSpline(points, tension = 0.5) {
    if (points.length < 2) return; // Need at least 2 points to draw

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y); // Start at the first point

    for (let i = 0; i < points.length - 1; i++) {
        // Define the four points needed for each curve segment
        const p0 = i > 0 ? points[i - 1] : points[0]; // Previous point (or first if at start)
        const p1 = points[i];                         // Current point
        const p2 = points[i + 1];                     // Next point
        const p3 = i < points.length - 2 ? points[i + 2] : p2; // Point after next (or last if at end)

        // Calculate control points for the spline
        const t = tension;
        const x1 = p1.x + (p2.x - p0.x) / 6 * t;
        const y1 = p1.y + (p2.y - p0.y) / 6 * t;
        const x2 = p2.x - (p3.x - p1.x) / 6 * t;
        const y2 = p2.y - (p3.y - p1.y) / 6 * t;

        // Draw the smooth curve to the next point
        ctx.bezierCurveTo(x1, y1, x2, y2, p2.x, p2.y);
    }

    ctx.stroke(); // Render the trail
}

// Reset the game to level 1
function resetGame() {
    gameState.level = 1;
    gameState.score = 0;
    gameState.time = 0;
    gameState.path = [];
    gameState.planetsReached = [];
    gameState.gameOver = false;
    rocks = [];
    document.getElementById('end-screen').style.display = 'none';
    startLevel();
}

// Game loop
function gameLoop() {
    update();
    draw();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Initialize the game
startLevel();
gameLoop();