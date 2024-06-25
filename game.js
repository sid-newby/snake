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

let face;
let pestControl;
let unicorn;
let bumblebee;
let cursors;
let gameOver = false;
let moveSound, collectSound, gameOverSound, backgroundMusic;
let gameStarted = false;
let touchPointer;
let coverScreen;
let startText;

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

  face = this.physics.add.image(800, 450, 'face').setScale(0.5);
  face.setDepth(1);

  pestControl = this.physics.add.image(100, 100, 'pest').setScale(face.scale * 1.5);
  unicorn = this.physics.add.image(1500, 800, 'unicorn').setScale(face.scale * 1.75);
  bumblebee = this.physics.add.image(200, 100, 'bumblebee').setScale(face.scale * 0.7);

  // Hide game objects initially
  [face, pestControl, unicorn, bumblebee].forEach(obj => obj.setVisible(false));

  cursors = this.input.keyboard.createCursorKeys();
  touchPointer = this.input.activePointer;

  moveSound = this.sound.add('move');
  collectSound = this.sound.add('collect');
  gameOverSound = this.sound.add('gameover');
  backgroundMusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 });

  coverScreen = this.add.image(800, 450, 'cover');
  coverScreen.setDisplaySize(1600, 900);
  coverScreen.setDepth(10);

  startText = this.add.text(400, 225, 'you cant read.', { 
    fontSize: '64px', 
    fill: '#ffffff',
    stroke: '#0bb6dd',
    strokeThickness: 6
  });
  startText.setOrigin(0.5);
  startText.setDepth(11);

  coverScreen.setInteractive();
  coverScreen.on('pointerdown', revealGameBoard, this);

  // Bind moveEnemyTowards to the scene
  this.moveEnemyTowards = moveEnemyTowards;
}

function revealGameBoard() {
  this.tweens.add({
      targets: [coverScreen, startText],
      alpha: 0,
      duration: 1000,
      onComplete: () => {
          coverScreen.destroy();
          startText.destroy();
          startGame.call(this);
      }
  });
}

function startGame() {
  gameStarted = true;
  backgroundMusic.play();

  // Make game objects visible
  [face, pestControl, unicorn, bumblebee].forEach(obj => obj.setVisible(true));
}

function update() {
    if (!gameStarted || gameOver) return;
  
    let velocityX = 0;
    let velocityY = 0;
  
    if (cursors.left.isDown || (touchPointer.isDown && touchPointer.x < config.scale.width / 3)) {
      velocityX = -4;
    } else if (cursors.right.isDown || (touchPointer.isDown && touchPointer.x > config.scale.width * 2 / 3)) {
      velocityX = 4;
    }
    if (cursors.up.isDown || (touchPointer.isDown && touchPointer.y < config.scale.height / 3)) {
      velocityY = -4;
    } else if (cursors.down.isDown || (touchPointer.isDown && touchPointer.y > config.scale.height * 2 / 3)) {
      velocityY = 4;
    }
  
    if (velocityX !== 0 || velocityY !== 0) {
      if (!moveSound.isPlaying) moveSound.play();
    }
  
    face.setVelocity(velocityX * 50, velocityY * 50);
  
    this.moveEnemyTowards(pestControl, 2);
    this.moveEnemyTowards(unicorn, 1);
    this.moveEnemyTowards(bumblebee, 1.5);
  
    this.physics.world.collide(face, [pestControl, unicorn, bumblebee], handleCollision, checkCollisionDistance, this);
  }
  
  function checkCollisionDistance(player, enemy) {
    // Define a maximum distance for collision (adjust as needed)
    const maxCollisionDistance = 50; // pixels
  
    // Calculate the distance between the player and the enemy
    const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
  
    // Only allow collision if the distance is less than maxCollisionDistance
    return distance < maxCollisionDistance;
  }
  
  function handleCollision() {
    gameOver = true;
    backgroundMusic.stop();
    gameOverSound.play();
    this.add.text(800, 450, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
    this.scene.pause();
  }