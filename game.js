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
  }
  
  const game = new Phaser.Game(config)
  
  let face
  let pestControl
  let unicorn
  let bumblebee
  let cursors
  let gameOver = false
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
  
    this.load.audio('move', 'assets/move.mp3')
    this.load.audio('collect', 'assets/collect.mp3')
    this.load.audio('gameover', 'assets/gameover.mp3')
    this.load.audio('bgmusic', 'assets/background-music.mp3')
  }
  
  function create() {
    this.add.image(800, 450, 'background').setDisplaySize(1600, 900)
  
    // Enable physics for the main character and enemies
    face = this.physics.add.image(800, 450, 'face').setScale(0.5)
    face.setDepth(1)
  
    pestControl = this.physics.add.image(100, 100, 'pest').setScale(face.scale * 1.5)
    unicorn = this.physics.add.image(1500, 800, 'unicorn').setScale(face.scale * 1.75)
    bumblebee = this.physics.add.image(200, 100, 'bumblebee').setScale(face.scale * 0.7)
  
    cursors = this.input.keyboard.createCursorKeys()
    touchPointer = this.input.activePointer
  
    moveSound = this.sound.add('move')
    collectSound = this.sound.add('collect')
    gameOverSound = this.sound.add('gameover')
    backgroundMusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 })
  
    startButton = this.add.text(800, 450, 'Start Game', { fontSize: '64px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', startGame.bind(this))
  
    console.log('Game created')
  }
  
  function startGame() {
    startButton.setVisible(false)
    gameStarted = true
    backgroundMusic.play()
  
    // Ensure all game elements are visible
    face.setVisible(true)
    pestControl.setVisible(true)
    unicorn.setVisible(true)
    bumblebee.setVisible(true)
  
    // Set invulnerability for 2 seconds
    invulnerableTime = 2000
  }
  
  function update(time, delta) {
    if (!gameStarted || gameOver) return
  
    invulnerableTime = Math.max(0, invulnerableTime - delta)
  
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
    if (invulnerableTime === 0) {
      gameOver = true
      backgroundMusic.stop()
      gameOverSound.play()
      this.add.text(800, 450, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5)
      this.scene.pause()
    }
  }
  