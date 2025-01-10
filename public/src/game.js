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
let arrow;

function preload() {
    game.load.image('human', './images/human_temp.png', { crossOrigin: 'anonymous' });
    game.load.image('block', './images/block.jpg', { crossOrigin: 'anonymous' });
    game.load.image('star', './images/star.png', { crossOrigin: 'anonymous' });
    game.load.image('alien', './images/alien.png', { crossOrigin: 'anonymous' });
    game.load.image('arrow', './images/arrow.png', { crossOrigin: 'anonymous' });
}

function create() {
    game.stage.backgroundColor = '#4488AA';
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Create blocks
    blocks = game.add.group();
    blocks.enableBody = true;

    const ground = blocks.create(0, game.world.height - 64, 'block');
    ground.scale.setTo(6, 6);
    ground.body.immovable = true;

    let ledge = blocks.create(400, 450, 'block');
    ledge.body.immovable = true;

    ledge = blocks.create(-75, 350, 'block');
    ledge.body.immovable = true;

    ledge = blocks.create(100, 375, 'block');
    ledge.body.immovable = true;

    // Create player
    human = game.add.sprite(32, game.world.height - 150, 'human');
    game.physics.arcade.enable(human);
    human.scale.setTo(0.5, 0.5);
    human.body.bounce.y = 0.2;
    human.body.gravity.y = 800;
    human.body.collideWorldBounds = true;

    // Create stars
    stars = game.add.group();
    stars.enableBody = true;

    for (let i = 0; i < 12; i++) {
        const star = stars.create(i * 70, 0, 'star');
        star.scale.setTo(0.5, 0.5);
        star.body.gravity.y = 1000;
        star.body.bounce.y = 0.3 + Math.random() * 0.2;
    }

    // Create aliens
    aliens = game.add.group();
    aliens.enableBody = true;

    for (let i = 0; i < 4; i++) {
        const alien = aliens.create(i * 150, 50, 'alien');
        alien.scale.setTo(0.5, 0.5);
    }

    // Add score text
    scoreText = game.add.text(16, 16, 'Score: ' + score, { fontSize: '32px', fill: '#000' });

    // Enable cursors
    cursors = game.input.keyboard.createCursorKeys();

    // Move aliens periodically
    game.time.events.loop(Phaser.Timer.SECOND / 60, moveAliens);

    // Alien shooting
    game.time.events.loop(Phaser.Timer.SECOND, alienShoot);
}

function update() {
    human.body.velocity.x = 0;

    game.physics.arcade.collide(human, blocks);
    game.physics.arcade.collide(stars, blocks);
    game.physics.arcade.collide(aliens, blocks);

    game.physics.arcade.overlap(human, stars, collectStar, null, this);

    // Player movement
    if (cursors.left.isDown) {
        human.body.velocity.x = -150;
    } else if (cursors.right.isDown) {
        human.body.velocity.x = 150;
    }

    if (cursors.up.isDown) {
        human.body.velocity.y = -400;
    }

    // Check for win
    if (score === 120) {
        alert('You win!');
        score = 0;
    }
}

function collectStar(human, star) {
    star.kill();
    score += 10;
    scoreText.text = 'Score: ' + score;
}

function moveAliens() {
    const alienSpeed = 70;

    // Move aliens
    aliens.forEach(alien => {
        // Each alien has its own random direction
        if (!alien.randomDirection) {
            alien.randomDirection = Math.random() < 0.5 ? 1 : -1; // Set random direction initially
        }
        alien.x += alien.randomDirection * alienSpeed * game.time.physicsElapsed;
    });

    // Check if aliens reached edge
    const firstAlien = aliens.getChildAt(0);
    const lastAlien = aliens.getChildAt(aliens.children.length - 1);

    // If the first or last alien reaches the edge, change direction for all aliens
    if (firstAlien.x <= 0 || lastAlien.x >= game.world.width - lastAlien.width) {
        aliens.forEach(alien => {
            // Reverse the direction for each alien
            alien.randomDirection *= -1;
        });
    }

    // Prevent aliens from passing the edge after the direction change
    aliens.forEach(alien => {
        // Ensure aliens stop at the right edge
        if (alien.x > game.world.width - alien.width) {
            alien.x = game.world.width - alien.width;
        }
        // Ensure aliens stop at the left edge
        if (alien.x < 0) {
            alien.x = 0;
        }
    });
}



function alienShoot() {
    aliens.forEach(alien => {
        if (Math.random() < 0.05) {
            const arrow = game.add.sprite(alien.x + alien.width / 2, alien.y + alien.height, 'arrow');
            game.physics.arcade.enable(arrow);
            arrow.scale.setTo(0.3, 0.3); // Scale down arrow
            arrow.body.velocity.y = 300;

            // // Check collision with player
            // game.physics.arcade.overlap(arrow, human, () => {
            //     alert('Game Over!');
            //     game.destroy();
            // });
        }
    });
}
