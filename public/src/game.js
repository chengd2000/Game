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
let arrows;
let hearts;
let lives = 3; // מספר הלבבות (חיים)

function preload() {
    game.load.image('human', './images/human_temp.png', { crossOrigin: 'anonymous' });
    game.load.image('block', './images/block.jpg', { crossOrigin: 'anonymous' });
    game.load.image('star', './images/star.png', { crossOrigin: 'anonymous' });
    game.load.image('alien', './images/alien.png', { crossOrigin: 'anonymous' });
    game.load.image('arrow', './images/arrow.png', { crossOrigin: 'anonymous' });
    game.load.image('heart', './images/heart.png', { crossOrigin: 'anonymous' });
}

function create() {
    game.stage.backgroundColor = '#4488AA';
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Create blocks
    blocks = game.add.group();
    blocks.enableBody = true;

    const ground = blocks.create(0, game.world.height - 52, 'block');
    ground.scale.setTo(game.world.width / ground.width, 1); // Stretch ground to screen width
    ground.body.immovable = true;

    // Create random ledges with space between them
    let ledges = [];
    const ledgeCount = 5; // Number of ledges
    const minDistance = 150; // Minimum distance between ledges
    const totalHeight = game.world.height - 200; // Total available height for placing ledges
    const ledgeSpacing = totalHeight / ledgeCount; // Space between each ledge

    // Set maximum height for ledges to be below aliens
    const alienHeight = 50; // Height of aliens
    const maxLedgeHeight = game.world.height - alienHeight - 100; // Maximum height below aliens

    for (let i = 0; i < ledgeCount; i++) {
        const x = Math.random() * (game.world.width - 200); // Horizontal position within screen limits
        const y = Math.min(i * ledgeSpacing + 200, maxLedgeHeight); // Ensure ledge is below aliens

        const ledge = blocks.create(x, y, 'block');

        // Apply random width scaling for variety
        const randomScale = Math.random() * (1.75 - 0.75) + 0.75; // Slightly larger minimum width for better platforming
        ledge.scale.setTo(randomScale, 1); // Apply random width scale

        ledge.body.immovable = true;
        ledges.push(ledge);
    }

    // Create player
    human = game.add.sprite(32, game.world.height - 150, 'human');
    game.physics.arcade.enable(human);
    human.scale.setTo(0.4, 0.4);
    human.body.bounce.y = 0.2;
    human.body.gravity.y = 800;
    human.body.collideWorldBounds = true;

    // Create stars
    stars = game.add.group();
    stars.enableBody = true;

    for (let i = 0; i < 12; i++) {
        const star = stars.create(i * 60, 0, 'star');
        star.scale.setTo(0.5, 0.5);
        star.body.gravity.y = 1000;
        star.body.bounce.y = 0.3 + Math.random() * 0.2;
    }

    // Create hearts (lives) on the right
    hearts = game.add.group();
    const startX = game.world.width - lives * 32; // Align hearts on the right
    for (let i = 0; i < lives; i++) {
        const heart = hearts.create(startX + i * 24, 16, 'heart');
        heart.scale.setTo(0.5, 0.5);
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
    arrows = game.add.group();
    arrows.enableBody = true;
    game.time.events.loop(Phaser.Timer.SECOND, alienShoot);
}

function update() {
    human.body.velocity.x = 0;

    game.physics.arcade.collide(human, blocks);
    game.physics.arcade.collide(stars, blocks);
    game.physics.arcade.collide(aliens, blocks);

    game.physics.arcade.overlap(human, stars, collectStar, null, this);
    game.physics.arcade.overlap(human, arrows, player_injured, null, this);

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

    aliens.forEach(alien => {
        if (!alien.randomDirection) {
            alien.randomDirection = Math.random() < 0.5 ? 1 : -1;
        }
        alien.x += alien.randomDirection * alienSpeed * game.time.physicsElapsed;
    });

    const firstAlien = aliens.getChildAt(0);
    const lastAlien = aliens.getChildAt(aliens.children.length - 1);

    if (firstAlien.x <= 0 || lastAlien.x >= game.world.width - lastAlien.width) {
        aliens.forEach(alien => {
            alien.randomDirection *= -1;
        });
    }

    aliens.forEach(alien => {
        if (alien.x > game.world.width - alien.width) {
            alien.x = game.world.width - alien.width;
        }
        if (alien.x < 0) {
            alien.x = 0;
        }
    });
}

function alienShoot() {
    aliens.forEach(alien => {
        if (Math.random() < 0.05) {
            const arrow = arrows.create(alien.x + alien.width / 2, alien.y + alien.height, 'arrow');
            arrow.scale.setTo(0.3, 0.3);
            arrow.body.velocity.y = 300;
        }
    });
}

function player_injured(human, arrow) {
    arrow.kill();
    lives--;

    if (hearts.children.length > 0) {
        hearts.getChildAt(hearts.children.length - 1).kill();
    }

    if (lives <= 0) {
        alert('Game Over');
        game.destroy();
    }
}
