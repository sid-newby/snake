const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('face', 'assets/snakeking.png');
    // Load other assets here
}

function create() {
    this.add.image(400, 300, 'face');
    // Set up game objects here
}

function update() {
    // Game logic goes here
}