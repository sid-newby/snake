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
let pestControl;
let cursors;
let gameOver = false;

function preload() {
    this.load.image('face', 'assets/your-face.png');
    this.load.image('pest', 'assets/pest.png');  // Make sure you have a pest.png in your assets folder
}

function create() {
    face = this.add.image(400, 300, 'face');
    face.setScale(0.2);  // Adjust this value to resize your face image

    pestControl = this.add.image(100, 100, 'pest');
    pestControl.setScale(0.1);  // Adjust this value as needed

    cursors = this.input.keyboard.createCursorKeys();

    console.log('Game created');
}

function update() {
    if (gameOver) {
        return;
    }

    console.log('Update called');

    // Player movement
    if (cursors.left.isDown) {
        console.log('Left key pressed');
        face.x -= 4;
    } else if (cursors.right.isDown) {
        console.log('Right key pressed');
        face.x += 4;
    }

    if (cursors.up.isDown) {
        console.log('Up key pressed');
        face.y -= 4;
    } else if (cursors.down.isDown) {
        console.log('Down key pressed');
        face.y += 4;
    }

    // Keep the face within the game boundaries
    face.x = Phaser.Math.Clamp(face.x, face.width / 4, config.width - face.width / 4);
    face.y = Phaser.Math.Clamp(face.y, face.height / 4, config.height - face.height / 4);

    // Move pest control towards the face
    let angle = Phaser.Math.Angle.Between(pestControl.x, pestControl.y, face.x, face.y);
    pestControl.x += Math.cos(angle) * 2;
    pestControl.y += Math.sin(angle) * 2;

    // Check for collision
    if (Phaser.Geom.Intersects.RectangleToRectangle(face.getBounds(), pestControl.getBounds())) {
        gameOver = true;
        this.add.text(400, 300, 'Game Over!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        this.scene.pause();
    }
}