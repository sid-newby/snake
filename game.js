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
      }, // Add the comma here
      scene: {
        preload: preload,
        create: create,
        update: update
      },
    audio: {
      disableWebAudio: true
    }
  }
  
{game = new Phaser.Game(config)
  
  let face
  let pestControl
  let unicorn
  let bumblebee
  let cursors
  let gameOver = constfalse
  let moveSound, collectSound, gameOverSound, backgroundMusic
  let startButton = true
  let gameStarted = false
  let touchPointer
  let invulnerableTime = 0
  
  function preload() {
    this.load.image('face', 'assets/your-face.png')
    this.load.image('body', 'assets/snake-body.png')
    this.load.image('pest', 'assets/pest.png')
    this.load.image('background', 'assets/background.png')
    this.load.image('unicorn', 'assets/unicorn.png')
    this.load.image('bumblebee', 'assets/bumblebee.png')
    // Load the new cover image
    this.load.image('cover', 'assets/cover.png')
  
    this.load.audio('move', 'assets/move.mp3')
    this.load.audio('collect', 'assets/collect.mp3')
    this.load.audio('gameover', 'assets/gameover.mp3')
    this.load.audio('bgmusic', 'assets/background-music.mp3')
  }
  
  let coverScreen;
  let startText;
  
  function create() {
    this.add.image(800, 450, 'background').setDisplaySize(1600, 900)
  
    // Enable physics for the main character and enemies, but hide them initially
    face = this.physics.add.image(800, 450, 'face').setScale(0.5).setVisible(false)
    face.setDepth(1)
  
    pestControl = this.physics.add.image(100, 100, 'pest').setScale(face.scale * 1.5).setVisible(false)
    unicorn = this.physics.add.image(1500, 800, 'unicorn').setScale(face.scale * 1.75).setVisible(false)
    bumblebee = this.physics.add.image(200, 100, 'bumblebee').setScale(face.scale * 0.7).setVisible(false)
  
    cursors = this.input.keyboard.createCursorKeys()
    touchPointer = this.input.activePointer
  
    moveSound = this.sound.add('move')
    collectSound = this.sound.add('collect')
    gameOverSound = this.sound.add('gameover')
    backgroundMusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 })
  
    // Create cover screen using the custom image
    coverScreen = this.add.image(800, 450, 'cover')
    coverScreen.setDisplaySize(1600, 900)  // Adjust size to match your game dimensions
    coverScreen.setDepth(10)
  
    // Create start text
    startText = this.add.text(400, 225, 'you cant read.', { 
      fontSize: '64px', 
      fill: '#ffffff',
      stroke: '#0bb6dd',
      strokeThickness: 6
    })
    startText.setOrigin(0.5)
    startText.setDepth(11)
  
    // Make the cover screen interactive
    coverScreen.setInteractive()
    coverScreen.on('pointerdown', revealGameBoard, this)
  
    // Bind moveEnemyTowards and handleCollision to the scene
    this.moveEnemyTowards = moveEnemyTowards.bind(this)
    this.handleCollision = handleCollision.bind(this)
  
    console.log('Game created')
  }
  
  function revealGameBoard() {
    // Fade out the cover and start text
    this.tweens.add({
        targets: [coverScreen, startText],
        alpha: 0,
        duration: 1000,
        onComplete: () => {
            coverScreen.destroy();
            startText.destroy();
            this.startGame(); // Start the game after the cover screen is removed
        }
    });
}

function startGame() {
    // Removed startButton.setVisible(false) as startButton is not defined or used
    gameStarted = true;
    backgroundMusic.play();

    // Ensure all game elements are visible
    face.setVisible(true);
    pestControl.setVisible(true);
    unicorn.setVisible(true);
    bumblebee.setVisible(true);
    
}
  
  function update(time, delta) {
    if (!gameStarted || gameOver) return
  
    let velocityX = 0
    let velocityY = 0
  
    if (cursors.left.isDown || (touchPointer.isDown && touchPointer.x < config.width / 3)) {
      velocityX = -4
    } else if (cursors.right.isDown || (touchPointer.isDown && touchPointer.x > config.width * 2 / 3)) {
      velocityX = 4
    }
    if (cursors.up.isDown || (touchPointer.isDown && touchPointer.y < config.height / 3)) {
      velocityY = -4
    } else if (cursors.down.isDown || (touchPointer.isDown && touchPointer.y > config.height * 2 / 3)) {
      velocityY = 4
    }
  
    if (velocityX !== 0 || velocityY !== 0) {
      if (!moveSound.isPlaying) moveSound.play()
    }
  
    face.setVelocity(velocityX * 50, velocityY * 50)
  
    moveEnemyTowards(pestControl, 2)
    moveEnemyTowards(unicorn, 1)
    moveEnemyTowards(bumblebee, 1.5)
  
    // Use Arcade Physics to check for overlaps
    this.physics.world.collide(face, [pestControl, unicorn, bumblebee], handleCollision, null, this)
  }
  
  function moveEnemyTowards(enemy, speed) {
    let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, face.x, face.y)
    this.physics.moveTo(enemy, face.x, face.y, speed * 50)
  }
  
  function handleCollision() {
      gameOver = true
      backgroundMusic.stop()
      gameOverSound.play()
      this.add.text(800, 450, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5)
      this.scene.pause()
    }
  }