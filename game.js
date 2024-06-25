const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      parent: 'phaser-example',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1600,
      height: 900
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
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

function preload() {
    this.load.image('face', 'assets/your-face.png');
    this.load.image('body', 'assets/snake-body.png');
    this.load.image('pest', 'assets/pest.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('unicorn', 'assets/unicorn.png');
    this.load.image('bumblebee', 'assets/bumblebee.png');
    this.load.image('cover', 'assets/cover.png');

    this.load.audio('move', 'assets/move.mp3');
    this.load.audio('collect', 'assets/collect.mp3');
    this.load.audio('gameover', 'assets/gameover.mp3');
    this.load.audio('bgmusic', 'assets/background-music.mp3');
}

function create() {
    this.add.image(800, 450, 'background').setDisplaySize(1600, 900);

    this.face = this.physics.add.image(800, 450, 'face').setScale(0.5);
    this.face.setDepth(1);

    this.pestControl = this.physics.add.image(100, 100, 'pest').setScale(this.face.scale * 1.5);
    this.unicorn = this.physics.add.image(1500, 800, 'unicorn').setScale(this.face.scale * 1.75);
    this.bumblebee = this.physics.add.image(200, 100, 'bumblebee').setScale(this.face.scale * 0.7);

    // Hide game objects initially
    [this.face, this.pestControl, this.unicorn, this.bumblebee].forEach(obj => obj.setVisible(false));

    this.cursors = this.input.keyboard.createCursorKeys();
    this.touchPointer = this.input.activePointer;

    this.moveSound = this.sound.add('move');
    this.collectSound = this.sound.add('collect');
    this.gameOverSound = this.sound.add('gameover');
    this.backgroundMusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 });

    this.coverScreen = this.add.image(800, 450, 'cover');
    this.coverScreen.setDisplaySize(1600, 900);
    this.coverScreen.setDepth(10);

    this.startText = this.add.text(400, 225, 'you cant read.', { 
        fontSize: '64px', 
        fill: '#ffffff',
        stroke: '#0bb6dd',
        strokeThickness: 6
    });
    this.startText.setOrigin(0.5);
    this.startText.setDepth(11);

    this.coverScreen.setInteractive();
    this.coverScreen.on('pointerdown', this.revealGameBoard, this);

    this.gameOver = false;
    this.gameStarted = false;
}

function update() {
    if (!this.gameStarted || this.gameOver) return;

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || (this.touchPointer.isDown && this.touchPointer.x < config.scale.width / 3)) {
        velocityX = -4;
    } else if (this.cursors.right.isDown || (this.touchPointer.isDown && this.touchPointer.x > config.scale.width * 2 / 3)) {
        velocityX = 4;
    }
    if (this.cursors.up.isDown || (this.touchPointer.isDown && this.touchPointer.y < config.scale.height / 3)) {
        velocityY = -4;
    } else if (this.cursors.down.isDown || (this.touchPointer.isDown && this.touchPointer.y > config.scale.height * 2 / 3)) {
        velocityY = 4;
    }

    if (velocityX !== 0 || velocityY !== 0) {
        if (!this.moveSound.isPlaying) this.moveSound.play();
    }

    this.face.setVelocity(velocityX * 50, velocityY * 50);

    this.moveEnemyTowards(this.pestControl, 2);
    this.moveEnemyTowards(this.unicorn, 1);
    this.moveEnemyTowards(this.bumblebee, 1.5);

    this.physics.world.collide(this.face, [this.pestControl, this.unicorn, this.bumblebee], this.handleCollision, this.checkCollisionDistance, this);
}

function revealGameBoard() {
    this.tweens.add({
        targets: [this.coverScreen, this.startText],
        alpha: 0,
        duration: 1000,
        onComplete: () => {
            this.coverScreen.destroy();
            this.startText.destroy();
            this.startGame();
        }
    });
}

function startGame() {
    this.gameStarted = true;
    this.backgroundMusic.play();

    // Make game objects visible
    [this.face, this.pestControl, this.unicorn, this.bumblebee].forEach(obj => obj.setVisible(true));
}

function moveEnemyTowards(enemy, speed) {
    this.physics.moveTo(enemy, this.face.x, this.face.y, speed * 50);
}

function checkCollisionDistance(player, enemy) {
    const maxCollisionDistance = 50; // pixels
    const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
    return distance < maxCollisionDistance;
}

function handleCollision() {
    this.gameOver = true;
    this.backgroundMusic.stop();
    this.gameOverSound.play();
    this.add.text(800, 450, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
    this.scene.pause();
}