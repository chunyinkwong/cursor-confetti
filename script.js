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
            color: 'red'
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
            ctx.translate(shakeX, shakeY);
        }

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        
        // Add shadow properties
        ctx.shadowColor = "rgba(100, 100, 100, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        ctx.fill();
        ctx.closePath();
        
        // Reset shadow properties to avoid affecting other drawings
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
    
    // Play the sound
    sound.play();
    
    // Update the score and last teleport time
    score++;
    lastTeleportTime = currentTime;

    confettiCount = Math.min(75, score + 1);
    
    console.log("Score:", score); // Optional: Log the score to the console
}

function drawScore() {
    const currentTime = Date.now();
    if (currentTime - lastTeleportTime > 2000) {
        score = 0;
        confettiCount = Math.min(75, score + 1);
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

    if (shakeDuration > 0) {
        ctx.restore();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateConfetti();
    drawCircles();
    drawConfetti();
    drawScore();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    redCircles.forEach(circle => {
        const dx = mouseX - circle.x;
        const dy = mouseY - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < circle.radius) {
            teleportCircle(circle);
        }
    });

    drawCircles();
    createConfetti(event.clientX, event.clientY);
});

createRedCircles();
drawCircles();
animate();
//