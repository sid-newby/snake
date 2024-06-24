const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let snake;
let food;
let cursors;
let pestControl;

function preload() {
    this.load.image('face', 'assets/your-face.png');
    this.load.image('food', 'assets/food.png');
    this.load.image('pest', 'assets/pest.png');
}

function create() {
    snake = this.physics.add.image(400, 300, 'face').setScale(0.1);
    snake.setCollideWorldBounds(true);

    food = this.physics.add.image(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'food').setScale(0.05);

    pestControl = this.physics.add.image(0, 0, 'pest').setScale(0.1);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(snake, food, eatFood, null, this);
    this.physics.add.overlap(snake, pestControl, gameOver, null, this);
}

function update() {
    if (cursors.left.isDown) {
        snake.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        snake.setVelocityX(160);
    } else {
        snake.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        snake.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        snake.setVelocityY(160);
    } else {
        snake.setVelocityY(0);
    }

    // Move pest control towards snake
    this.physics.moveToObject(pestControl, snake, 100);
}

function eatFood(snake, food) {
    food.setPosition(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550));
}

function gameOver() {
    this.physics.pause();
    snake.setTint(0xff0000);
    this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#000' }).setOrigin(0.5);
}