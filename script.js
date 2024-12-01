// Get the canvas and context
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Confetti properties
let confettiCount = 1;
const confetti = [];

// Red circles properties
const redCircleCount = 20;
const redCircles = [];
const circleRadius = 30;

// Sound element
const sound = new Audio('teleport.mp3');

let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let lastTeleportTime = Date.now();

let shakeDuration = 0;
let shakeIntensity = 5;

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function createConfetti(x, y) {
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: x,
            y: y,
            size: randomRange(5, 10),
            speedX: randomRange(-5, 5),
            speedY: randomRange(-5, 5),
            color: `hsl(${randomRange(0, 360)}, 100%, 50%)`
        });
    }
}

function createRedCircles() {
    for (let i = 0; i < redCircleCount; i++) {
        redCircles.push({
            x: randomRange(circleRadius, canvas.width - circleRadius),
            y: randomRange(circleRadius, canvas.height - circleRadius),
            radius: circleRadius,
            color: 'red',
            shadowColor: `hsla(${randomRange(0, 360)}, 100%, 50%, 0.5)`,
        });
    }
}

function updateConfetti() {
    for (let i = 0; i < confetti.length; i++) {
        const confetto = confetti[i];
        confetto.x += confetto.speedX;
        confetto.y += confetto.speedY;
        confetto.speedY += 0.1; // gravity effect

        if (confetto.y > canvas.height) {
            confetti.splice(i, 1);
            i--;
        }
    }
}

function drawConfetti() {
    for (const confetto of confetti) {
        ctx.fillStyle = confetto.color;
        ctx.fillRect(confetto.x, confetto.y, confetto.size, confetto.size);
    }
}

function drawCircles() {
    redCircles.forEach(circle => {

        if (shakeDuration > 0) {
            const shakeX = Math.random() * shakeIntensity - shakeIntensity / 2;
            const shakeY = Math.random() * shakeIntensity - shakeIntensity / 2;
            ctx.save();
            // Disable screenshake due to feedback that it was nauseating
            // ctx.translate(shakeX, shakeY);
        }

        // Add a 3D effect
        let gradient = ctx.createRadialGradient(circle.x - circle.radius / 3, circle.y - circle.radius / 3, circle.radius / 10, circle.x, circle.y, circle.radius);
        gradient.addColorStop(0, "white");
        gradient.addColorStop(1, "red");

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

        ctx.fillStyle = gradient;

        ctx.shadowColor = circle.shadowColor;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;

        ctx.fill();
        ctx.closePath();

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        if (shakeDuration > 0) {
             ctx.restore();
        }
    });
}

function teleportCircle(circle) {
    const currentTime = Date.now();
    
    // Update the circle's position
    circle.x = randomRange(circleRadius, canvas.width - circleRadius);
    circle.y = randomRange(circleRadius, canvas.height - circleRadius);
    
    // Change the circle's color
    circle.shadowColor = `hsla(${randomRange(0, 360)}, 100%, 50%, 0.5)`;
    
    // Play the sound
    sound.play();
    
    // Update the score and last teleport time
    score++;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    lastTeleportTime = currentTime;
    
    console.log("Score:", score); // Optional: Log the score to the console
    console.log("High Score:", highScore); // Optional: Log the high score to the console
}

function drawScore() {
    const currentTime = Date.now();
    if (currentTime - lastTeleportTime > 2000) {
        score = 0;
        confettiCount = 1;
    }

    if (score > 10) {
        shakeDuration = 20; // Duration of the shake effect in frames
    }

    if (shakeDuration > 0) {
        const shakeX = Math.random() * shakeIntensity - shakeIntensity / 2;
        const shakeY = Math.random() * shakeIntensity - shakeIntensity / 2;
        ctx.save();
        ctx.translate(shakeX, shakeY);
        shakeDuration--;
    }

    ctx.font = '48px Arial';
    ctx.fillStyle = 'green';
    ctx.fillText('Score: ' + score, 20, 58);
    ctx.fillText('High Score: ' + highScore, 20, 120);

    if (shakeDuration > 0) {
        ctx.restore();
    }
}

let confettiCreatedThisFrame = false;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiCreatedThisFrame = false;
    updateConfetti();
    drawCircles();
    drawConfetti();
    drawScore();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchmove', handleTouchMove);

function handleMouseMove(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    confettiCount = Math.min(50, score + 1);
    handleMove(mouseX, mouseY);
}

function handleTouchMove(event) {
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    // Lower count on mobile
    confettiCount = Math.min(20, score + 1);
    handleMove(touchX, touchY);
}

function handleMove(x, y) {
    redCircles.forEach(circle => {
        const dx = x - circle.x;
        const dy = y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < circle.radius) {
            teleportCircle(circle);
        }
    });

    drawCircles();
    if (!confettiCreatedThisFrame) {
        createConfetti(x, y);
        confettiCreatedThisFrame = true;
    }
}

createRedCircles();
drawCircles();
animate();
