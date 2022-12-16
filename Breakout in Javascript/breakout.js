const canvas = document.getElementById('breakout');
const ctx = canvas.getContext('2d');
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

const sounds = {
    ballLost: new Audio('./sounds/ball-lost.mp3'),
    breakout: new Audio('./sounds/breakout.mp3'),
    brick: new Audio('./sounds/brick.mp3'),
    gameOver: new Audio('./sounds/game-over.mp3'),
    levelCompleted: new Audio('./sounds/level-completed.mp3'),
    music: new Audio('./sounds/music.mp3'),
    paddle: new Audio('./sounds/paddle.mp3')
};

var gameSpeed = 10;
gameSpeed = parseInt(prompt("Choose your game speed. If you don't answer, your answer is not a number, or your answer is 0, the game speed will be set to the default value of 10. Warning: High Speeds Break the Game."))
if (isNaN(gameSpeed) || gameSpeed == 0) {
    gameSpeed = 10;
};

var game = {
    requestId: null,
    timeoutId: null,
    leftKey: false,
    rightKey: false,
    on: false,
    music: true,
    sfx: true
};
var paddle = {
    height: 20,
    width: 100,
    get y() { return canvas.height - this.height; }
};
var ball = {
    radius: 13
};
var brick = {
    rows: 5,
    cols: 10,
    get width() { return canvas.width / this.cols; },
    height: 30
};
var images = {
    background: new Image(),
    ball: new Image(),
    paddle: new Image()
};
var brickField = [];

function play() {
    cancelAnimationFrame(game.requestId);
    clearTimeout(game.timeoutId);
    game.on = true;

    resetGame();
    resetBall();
    resetPaddle();
    initBricks();

    game.sfx && sounds.breakout.play();
    // Start music after starting sound ends.
    setTimeout(() => game.music && sounds.music.play(), 2000);

    animate();
};
function onImageLoad(e) {
    resetGame();
    initBricks();
    resetPaddle();
    paint();
    ctx.font = '50px ArcadeClassic';
    ctx.fillStyle = 'lime';
    ctx.fillText('BREAKOUT!', canvas.width / 2 - 120, canvas.height / 2);
};
images.background.addEventListener('load', onImageLoad);
images.background.src = './images/bg-space.png';
images.ball.src = './images/ball.png';
images.paddle.src = './images/paddle.png';

function resetGame() {
    game.speed = gameSpeed;
    game.score = 0;
    game.level = 1;
    game.lives = 3;
    game.time = { start: performance.now(), elapsed: 0, refreshRate: 16 };
};
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - paddle.height - 2 * ball.radius;
    ball.dx = game.speed * (Math.random() * 2 - 1);  // Random trajectory
    ball.dy = -game.speed; // Up
};
function resetPaddle() {
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.dx = game.speed + 10;
};
function initBricks() {
    brickField = [];
    const topMargin = 30;
    const colors = ['purple', 'blue', 'lime', 'yellow', 'red'];

    for (let row = 0; row < brick.rows; row++) {
        for (let col = 0; col < brick.cols; col++) {
            brickField.push({
                x: col * brick.width,
                y: row * brick.height + topMargin,
                height: brick.height,
                width: brick.width,
                color: colors[row],
                points: (5 - row) * 2,
                hitsLeft: row == 0 ? 2 : 1
            });
        };
    };
};

function animate(now = 0) {
    game.time.elapsed = now - game.time.start;
    if (game.time.elapsed > game.time.refreshRate) {
        game.time.start = now;

        paint();
        update();
        detectCollision();
        detectBrickCollision();

        if (isLevelCompleted() || isGameOver()) return;
    };
    game.requestId = requestAnimationFrame(animate);
};
function paint() {
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.ball, ball.x, ball.y, 2 * ball.radius, 2 * ball.radius);
    ctx.drawImage(images.paddle, paddle.x, paddle.y, paddle.width, paddle.height);
    drawBricks();
    drawScore();
    drawLives();
};
function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (game.rightKey) {
        paddle.x += paddle.dx;
        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        };
    };
    if (game.leftKey) {
        paddle.x -= paddle.dx;
        if (paddle.x < 0) {
            paddle.x = 0;
        };
    };
};

function detectCollision() {
    const hitTop = () => ball.y < 0;
    const hitLeftWall = () => ball.x < 0;
    const hitRightWall = () => ball.x + ball.radius * 2 > canvas.width;
    const hitPaddle = () =>
        ball.y + 2 * ball.radius > canvas.height - paddle.height &&
        ball.y + ball.radius < canvas.height &&
        ball.x + ball.radius > paddle.x &&
        ball.x + ball.radius < paddle.x + paddle.width;

    if (hitLeftWall()) {
        ball.dx = -ball.dx;
        ball.x = 0;
    };
    if (hitRightWall()) {
        ball.dx = -ball.dx;
        ball.x = canvas.width - 2 * ball.radius;
    };
    if (hitTop()) {
        ball.dy = -ball.dy;
        ball.y = 0;
    };
    if (hitPaddle()) {
        ball.dy = -ball.dy;
        ball.y = canvas.height - paddle.height - 2 * ball.radius;
        game.sfx && sounds.paddle.play();
        const drawingConst = 5
        const paddleMiddle = 2;
        const algo = (((ball.x - paddle.x) / paddle.width) * drawingConst);
        ball.dx = ball.dx + algo - paddleMiddle;
    };
};
function detectBrickCollision() {
    let directionChanged = false;
    const isBallInsideBrick = (brick) =>
        ball.x + 2 * ball.radius > brick.x &&
        ball.x < brick.x + brick.width &&
        ball.y + 2 * ball.radius > brick.y &&
        ball.y < brick.y + brick.height;

    brickField.forEach((brick) => {
        if (brick.hitsLeft && isBallInsideBrick(brick)) {
            sounds.brick.currentTime = 0;
            game.sfx && sounds.brick.play();
            brick.hitsLeft--;
            if (brick.hitsLeft == 1) {
                brick.color = 'darkgray';
            };
            game.score += brick.points;

            if (!directionChanged) {
                directionChanged = true;
                detectCollisionDirection(brick);
            };
        };
    });
};
function detectCollisionDirection(brick) {
    const hitFromLeft = () => ball.x + 2 * ball.radius - ball.dx <= brick.x;
    const hitFromRight = () => ball.x - ball.dx >= brick.x + brick.width;

    if (hitFromLeft() || hitFromRight()) {
        ball.dx = -ball.dx;
    } else { // Hit from above or below
        ball.dy = -ball.dy;
    };
};

function drawBricks() {
    brickField.forEach((brick) => {
        if (brick.hitsLeft) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        };
    });
};
function drawScore() {
    ctx.font = '24px ArcadeClassic';
    ctx.fillStyle = 'white';
    const { level, score } = game;
    ctx.fillText(`Level: ${level};`, 5, 23);
    ctx.fillText(`Score: ${score};`, canvas.width / 2 - 50, 23);
};
function drawLives() {
    if (game.lives > 2) { ctx.drawImage(images.paddle, canvas.width - 150, 9, 40, 13); };
    if (game.lives > 1) { ctx.drawImage(images.paddle, canvas.width - 100, 9, 40, 13); };
    if (game.lives > 0) { ctx.drawImage(images.paddle, canvas.width - 50, 9, 40, 13); };
};

function keyDownHandler(e) {
    if (!game.on && e.key == ' ') {
        play();
    };
    if (game.on && (e.key == 'm' || e.key == 'M')) {
        game.music = !game.music;
        game.music ? sounds.music.play() : sounds.music.pause();
    };
    if (game.on && (e.key == 's' || e.key == 'S')) {
        game.sfx = !game.sfx;
    };
    if (e.key == 'ArrowUp') {
        volumeUp();
    };
    if (e.key == 'ArrowDown') {
        volumeDown();
    };
    if (e.key == 'ArrowRight') {
        game.rightKey = true;
    } else if (e.key == 'ArrowLeft') {
        game.leftKey = true;
    };
};
function keyUpHandler(e) {
    if (e.key == 'ArrowRight') {
        game.rightKey = false;
    } else if (e.key == 'ArrowLeft') {
        game.leftKey = false;
    };
};

function isLevelCompleted() {
    const levelComplete = brickField.every((b) => b.hitsLeft == 0);

    if (levelComplete) {
        initNextLevel();
        resetBall();
        resetPaddle();
        initBricks();
        game.timeoutId = setTimeout(() => {
            animate();
            sounds.music.play();
        }, 3000);

        return true;
    };
    return false;
};
function initNextLevel() {
    game.level++;
    game.speed++;
    sounds.music.pause();
    game.sfx && sounds.levelCompleted.play();
    ctx.font = '50px ArcadeClassic';
    ctx.fillStyle = 'yellow';
    ctx.fillText(`LEVEL ${game.level};!`, canvas.width / 2 - 80, canvas.height / 2);
};
function isGameOver() {
    const isBallLost = () => ball.y - ball.radius > canvas.height;

    if (isBallLost()) {
        game.lives -= 1;
        game.sfx && sounds.ballLost.play();
        if (game.lives == 0) {
            gameOver();
            return true;
        };
        resetBall();
        resetPaddle();
    };
    return false;
};

function gameOver() {
    game.on = false;
    sounds.music.pause();
    sounds.currentTime = 0;
    game.sfx && sounds.gameOver.play();
    ctx.font = '50px ArcadeClassic';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
};

function initSounds() {
    sounds.music.loop = true;
    for (const [key] of Object.entries(sounds)) {
        sounds[key].volume = 0.5;
    };
};
function volumeDown() {
    if (sounds.music.volume >= 0.1) {
        for (const [key] of Object.entries(sounds)) {
            sounds[key].volume -= 0.1;
        };
    };
};
function volumeUp() {
    if (sounds.music.volume <= 0.9) {
        for (const [key] of Object.entries(sounds)) {
            sounds[key].volume += 0.1;
        };
    };
};
initSounds();

// Controller Support
var direction = 0
window.addEventListener('gamepadconnected', (event) => {
    // Update Controller
    const update = () => {
        //Only read the first controller
        const cont = navigator.getGamepads()[0];
        if (cont.axes[0] >= 0.3) { //Right
            paddle.x += paddle.dx;
            if (paddle.x + paddle.width > canvas.width) {
                paddle.x = canvas.width - paddle.width;
            };
        }
        if (cont.axes[0] <= -0.3) { //Left
            paddle.x -= paddle.dx;
            if (paddle.x < 0) {
                paddle.x = 0;
            };
        }
        if (cont.buttons[9].pressed) {
            play();
        }
        if (game.on && cont.buttons[0].pressed) {
            game.music = !game.music;
            game.music ? sounds.music.play() : sounds.music.pause();
        }
        if (game.on && cont.buttons[1].pressed) {
            game.sfx = !game.sfx;
        }
        if (game.on && cont.buttons[4].pressed) {
            volumeDown();
        }
        if (game.on && cont.buttons[5].pressed) {
            volumeUp();
        }
        //This will loop the update every "animation frame"
        requestAnimationFrame(update);
    }; //End Update Controller
    //Kick off the loop
    update();
});

// Touch Support
document.addEventListener("touchmove", touchMoveHandler, false);
function touchMoveHandler(event) {
    var relativeX = event.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
};
