const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let face;
let cursors;

function preload() {
    this.load.image('face', 'assets/snakeking.png');
}

function create() {
    face = this.add.image(400, 300, 'face');
    face.setScale(0.2);  // Adjust this value to resize your face image
    
    cursors = this.input.keyboard.createCursorKeys();
    
    console.log('Game created');  // Debug log
}

function update() {
    if (cursors.left.isDown) {
        face.x -= 4;
    } else if (cursors.right.isDown) {
        face.x += 4;
    }

    if (cursors.up.isDown) {
        face.y -= 4;
    } else if (cursors.down.isDown) {
        face.y += 4;
    }
}