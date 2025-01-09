//import Phaser from 'phaser';
const game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
});

let score = 0;
let scoreText;
let blocks;
let stars;
let cursors;
let human;
let aliens;

function preload () {
    game.load.image('human', './images/human_temp.png', { crossOrigin: 'anonymous' });
    game.load.image('block', './images/block.jpg', { crossOrigin: 'anonymous' });
    game.load.image('star', './images/star.png', { crossOrigin: 'anonymous' });
    game.load.image('alien', './images/alien.png', { crossOrigin: 'anonymous' });
}

function create () {
    game.stage.backgroundColor = '#4488AA'; 
    game.physics.startSystem(Phaser.Physics.ARCADE);

    blocks = game.add.group();
    blocks.enableBody = true;

    const ground = blocks.create(0, game.world.height - 64, 'block');
    ground.scale.setTo(6, 6); // Adjust the size
    ground.body.immovable = true;

    let ledge = blocks.create(400, 450, 'block');
    ledge.body.immovable = true;
  
    ledge = blocks.create(-75, 350, 'block');
    ledge.body.immovable = true;

    ledge = blocks.create(100, 375, 'block');
    ledge.body.immovable = true;

    human = game.add.sprite(32, game.world.height - 150, 'human');
    game.physics.arcade.enable(human);
    human.scale.setTo(0.5, 0.5); // Adjust the size
    human.body.bounce.y = 0.2;
    human.body.gravity.y = 800;
    human.body.collideWorldBounds = true;

    stars = game.add.group();
    stars.enableBody = true;

    for (var i = 0; i < 12; i++) {
        const star = stars.create(i * 70, 0, 'star');
        star.scale.setTo(0.5, 0.5); // Adjust the size
        star.body.gravity.y = 1000;
        star.body.bounce.y = 0.3 + Math.random() * 0.2;
    }

    aliens = game.add.group();
    aliens.enableBody = true;

    for (var i = 0; i < 4; i++) {
        const alien = aliens.create(i * 150, 0, 'alien');
        alien.scale.setTo(0.5, 0.5); // Adjust the size
        alien.body.gravity.y = 1000;
        alien.body.bounce.y = 0.3 + Math.random() * 0.2;
    }

    scoreText = game.add.text(16, 16, 'Score: ' + score, { fontSize: '32px', fill: '#000' });

    cursors = game.input.keyboard.createCursorKeys();
}

function update () {
    human.body.velocity.x = 0;

    game.physics.arcade.collide(human, blocks);
    game.physics.arcade.collide(stars, blocks);
    game.physics.arcade.collide(aliens, blocks);

    game.physics.arcade.overlap(human, stars, collectStar, null, this);

    if (cursors.left.isDown) {
        human.body.velocity.x = -150;
    } else if (cursors.right.isDown) {
        human.body.velocity.x = 150;
    }

    if (cursors.up.isUp && human.body.touching.down) {
        human.body.velocity.y = -400;
    }

    if (score === 120) {
        alert('You win!');
        score = 0;
    }
}

function collectStar (human, star) {
    star.kill();

    score += 10;
    scoreText.text = 'Score: ' + score;
}
