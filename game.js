const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    audio: {
        disableWebAudio: true
    }
};

const game = new Phaser.Game(config);

let face;
let snakeBody;
let pestControl;
let unicorn;
let bumblebee;
let cursors;
let gameOver = false;
let moveSound, collectSound, gameOverSound;

function preload() {
    this.load.image('face', 'assets/your-face.png');
    this.load.image('body', 'assets/snake-body.png');
    this.load.image('pest', 'assets/pest.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('unicorn', 'assets/unicorn.png');
    this.load.image('bumblebee', 'assets/bumblebee.png');
    
    // Load audio files
    this.load.audio('move', 'assets/move.mp3');
    this.load.audio('collect', 'assets/collect.mp3');
    this.load.audio('gameover', 'assets/gameover.mp3');
}

function create() {
    this.add.image(400, 300, 'background');

    snakeBody = this.add.group();
    for (let i = 0; i < 5; i++) {
        snakeBody.create(400 - i * 30, 300, 'body').setScale(0.5);
    }

    face = this.add.image(400, 300, 'face').setScale(0.2);

    pestControl = this.add.image(100, 100, 'pest').setScale(0.15);
    unicorn = this.add.image(700, 500, 'unicorn').setScale(0.1);
    bumblebee = this.add.image(200, 100, 'bumblebee').setScale(0.1);

    cursors = this.input.keyboard.createCursorKeys();

    // Initialize sounds
    moveSound = this.sound.add('move');
    collectSound = this.sound.add('collect');
    gameOverSound = this.sound.add('gameover');

    console.log('Game created');
}

function update() {
    if (gameOver) return;

    // Player movement
    let velocityX = 0;
    let velocityY = 0;
    if (cursors.left.isDown) {
        velocityX = -4;
        if (!moveSound.isPlaying) moveSound.play();
    } else if (cursors.right.isDown) {
        velocityX = 4;
        if (!moveSound.isPlaying) moveSound.play();
    }
    if (cursors.up.isDown) {
        velocityY = -4;
        if (!moveSound.isPlaying) moveSound.play();
    } else if (cursors.down.isDown) {
        velocityY = 4;
        if (!moveSound.isPlaying) moveSound.play();
    }

    // Update snake body
    let prevX = face.x;
    let prevY = face.y;
    face.x += velocityX;
    face.y += velocityY;
    snakeBody.children.entries.forEach((segment) => {
        let tempX = segment.x;
        let tempY = segment.y;
        segment.x = prevX;
        segment.y = prevY;
        prevX = tempX;
        prevY = tempY;
    });

    // Keep the face within the game boundaries
    face.x = Phaser.Math.Clamp(face.x, face.width / 4, config.width - face.width / 4);
    face.y = Phaser.Math.Clamp(face.y, face.height / 4, config.height - face.height / 4);

    // Move enemies towards the face
    moveEnemyTowards(pestControl, 2);
    moveEnemyTowards(unicorn, 1);
    moveEnemyTowards(bumblebee, 1.5);

    // Check for collisions
    if (checkCollision(face, pestControl) || checkCollision(face, unicorn) || checkCollision(face, bumblebee)) {
        gameOver = true;
        gameOverSound.play();
        this.add.text(400, 300, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        this.scene.pause();
    }
}

function moveEnemyTowards(enemy, speed) {
    let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, face.x, face.y);
    enemy.x += Math.cos(angle) * speed;
    enemy.y += Math.sin(angle) * speed;
}

function checkCollision(object1, object2) {
    return Phaser.Geom.Intersects.RectangleToRectangle(object1.getBounds(), object2.getBounds());
}