const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1600,
        height: 900
    },
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
let touchPointer;

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
    this.add.image(800, 450, 'background').setDisplaySize(1600, 900);

    snakeBody = this.add.group();
    
    face = this.add.image(800, 450, 'face').setScale(0.5);
    face.setDepth(1);

    pestControl = this.add.image(100, 100, 'pest').setScale(face.scale * 1.5);
    unicorn = this.add.image(1500, 800, 'unicorn').setScale(face.scale * 1.75);
    bumblebee = this.add.image(200, 100, 'bumblebee').setScale(face.scale * 0.7);

    cursors = this.input.keyboard.createCursorKeys();
    touchPointer = this.input.activePointer;

    moveSound = this.sound.add('move');
    collectSound = this.sound.add('collect');
    gameOverSound = this.sound.add('gameover');
    backgroundMusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 });

    startButton = this.add.text(800, 450, 'Start Game', { fontSize: '64px', fill: '#fff' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', startGame.bind(this));

    console.log('Game created');
}

function startGame() {
    startButton.setVisible(false);
    gameStarted = true;
    backgroundMusic.play();
    
    for (let i = 0; i < 25; i++) {
        let segment = snakeBody.create(800 - i * 30, 450, 'body').setScale(face.scale * 0.8);
        segment.setDepth(0);
    }
}

function update() {
    if (!gameStarted || gameOver) return;

    let velocityX = 0;
    let velocityY = 0;

    // Keyboard controls
    if (cursors.left.isDown) {
        velocityX = -4;
    } else if (cursors.right.isDown) {
        velocityX = 4;
    }
    if (cursors.up.isDown) {
        velocityY = -4;
    } else if (cursors.down.isDown) {
        velocityY = 4;
    }

    // Touch controls
    if (touchPointer.isDown) {
        const touchX = touchPointer.x;
        const touchY = touchPointer.y;
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        if (touchX < gameWidth / 3) velocityX = -4;
        if (touchX > gameWidth * 2 / 3) velocityX = 4;
        if (touchY < gameHeight / 3) velocityY = -4;
        if (touchY > gameHeight * 2 / 3) velocityY = 4;
    }

    if (velocityX !== 0 || velocityY !== 0) {
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
        this.add.text(800, 450, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
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