const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
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
let moveSound, collectSound, gameOverSound, backgroundMusic;
let startButton;
let gameStarted = false;

function preload() {
    this.load.image('face', 'assets/your-face.png');
    this.load.image('body', 'assets/snake-body.png');
    this.load.image('pest', 'assets/pest.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('unicorn', 'assets/unicorn.png');
    this.load.image('bumblebee', 'assets/bumblebee.png');
    
    this.load.audio('move', 'assets/move.mp3');
    this.load.audio('collect', 'assets/collect.mp3');
    this.load.audio('gameover', 'assets/gameover.mp3');
    this.load.audio('bgmusic', 'assets/background-music.mp3');
}

function create() {
    this.add.image(960, 540, 'background').setScale(2.4);

    snakeBody = this.add.group();
    
    face = this.add.image(960, 540, 'face').setScale(0.5);
    face.setDepth(1);  // Set face depth to 1 (above 0)

    pestControl = this.add.image(100, 100, 'pest').setScale(0.4);
    unicorn = this.add.image(1800, 900, 'unicorn').setScale(0.2);
    bumblebee = this.add.image(200, 100, 'bumblebee').setScale(0.7);

    cursors = this.input.keyboard.createCursorKeys();

    moveSound = this.sound.add('move');
    collectSound = this.sound.add('collect');
    gameOverSound = this.sound.add('gameover');
    backgroundMusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 });

    startButton = this.add.text(960, 540, 'Start Game', { fontSize: '64px', fill: '#fff' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', startGame.bind(this));

    console.log('Game created');
}

function startGame() {
    startButton.setVisible(true);
    gameStarted = true;
    backgroundMusic.play();
    
    // Create the long snake body
    for (let i = 0; i < 25; i++) {
        let segment = snakeBody.create(960 - i * 30, 540, 'body').setScale(1);
        segment.setDepth(0);  // Ensure all body segments are at depth 0 (below face)
    }
}

function update() {
    if (!gameStarted || gameOver) return;

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

    face.x = Phaser.Math.Clamp(face.x, face.width / 4, config.width - face.width / 4);
    face.y = Phaser.Math.Clamp(face.y, face.height / 4, config.height - face.height / 4);

    moveEnemyTowards(pestControl, 2);
    moveEnemyTowards(unicorn, 1);
    moveEnemyTowards(bumblebee, 1.5);

    if (checkCollision(face, pestControl) || checkCollision(face, unicorn) || checkCollision(face, bumblebee)) {
        gameOver = true;
        backgroundMusic.stop();
        gameOverSound.play();
        this.add.text(960, 540, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
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