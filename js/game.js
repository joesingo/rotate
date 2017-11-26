function Game(canvas) {
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.inProgress = true;

    this.player = new Player(this.width / 2, 100);
    this.enemies = {
        "targets": [], "bombs": []
    };
    this.stars = [];
    this.pressedKeys = {};

    // Queues to handle animations. Have several queues so that unrelated
    // animations can happen concurrently
    this.animationHandlers = {};
    this.animationHandlers.playerRotations = new AnimationHandler();
    this.animationHandlers.targets = new AnimationHandler();
    this.animationHandlers.lives = new AnimationHandler();

    this.timers = {};

    this.gameTime = 0;  // Seconds the game has been in progress for
    this.timers["enemies"] = new Timer(this.getEnemyCreationInterval(), this.createEnemy.bind(this));

    for (var i=0; i<CONSTANTS.numStars; i++) {
        this.createStar();
    }

    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";

    this.scorePopups = [];
    this.livesVisible = true;
}

/*
 * Start timer for main game loop
 */
Game.prototype.start = function() {
    var now = null;
    var then = performance.now();
    var mainLoop = window.setInterval(function() {
        now = performance.now();
        var dt = (now - then) / 1000;
        then = now;

        if (this.inProgress) {
            this.update(dt);
        }
        else {
            window.clearInterval(mainLoop);
        }
    }.bind(this), 10);
}

Game.prototype.update = function(dt) {
    this.gameTime += dt;
    this.timers["enemies"].interval = this.getEnemyCreationInterval();

    this.ctx.fillStyle = COLOURS.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Handle player movement/rotation
    var dx = 0;
    var dy = 0;
    if (KEYS.left in this.pressedKeys) {
        dx = -1;
    }
    else if (KEYS.right in this.pressedKeys) {
        dx = 1;
    }
    if (KEYS.up in this.pressedKeys) {
        dy = -1;
    }
    else if (KEYS.down in this.pressedKeys) {
        dy = 1;
    }
    if (dx != 0 || dy != 0) {
        this.player.move(dt, dx, dy, this);
    }

    // Handle shooting - start a timer if the key is held down and a timer doesn't
    // already exist
    if (KEYS.shoot in this.pressedKeys && !("shoot" in this.timers)) {
        this.player.shoot();
        this.timers["shoot"] = new Timer(TIMINGS.shootInterval, this.player.shoot.bind(this.player));
    }

    // Scroll enemies
    for (var type in this.enemies) {
        for (var i=0; i<this.enemies[type].length; i++) {
            var e = this.enemies[type][i];
            e.y -= e.speed * dt;

            if (e.getBottomYCoord() <= 0) {
                this.loseLife();
                this.enemies[type].splice(i, 1);
                i--;
            }
        }
    }
    // Advance bullets
    for (var i=0; i<this.player.bullets.length; i++) {
        var bullet = this.player.bullets[i];
        bullet.move(dt);

        if (bullet.y - bullet.radius >= this.height) {
            Utils.removeItem(bullet, this.player.bullets);
            i--;
        }
    }

    // Process animation handlers
    for (var a in this.animationHandlers) {
        var anim = this.animationHandlers[a];
        if (anim.queue.length > 0) {
            anim.update(dt);
        }
    }

    // Update timers
    for (var t in this.timers) {
        this.timers[t].update(dt);
    }

    // Update stars
    for (var t in this.stars) {
        this.stars[t].update(dt);
    }

    // Collision detection - enemies with player
    for (var type in this.enemies) {
        for (var i=0; i<this.enemies[type].length; i++) {
            var e = this.enemies[type][i];

            if (e.collidesWithPlayer(this.player)) {
                this.handleEnemyCollision(e, type);
            }
        }
    }
    // Bombs with bullets
    for (var i=0; i<this.enemies["bombs"].length; i++) {
        var bomb = this.enemies["bombs"][i];
        for (var j=0; j<this.player.bullets.length; j++) {
            var bullet = this.player.bullets[j];

            if (bomb.collidesWithBullet(bullet)) {
                this.increasePlayerScore(CONSTANTS.points.bomb, bullet.x, bullet.y);
                Utils.removeItem(bullet, this.player.bullets);
                Utils.removeItem(bomb, this.enemies["bombs"]);
                i--;

                break;
            }
        }
    }

    // Drawing
    for (var i=0; i<this.stars.length; i++) {
        this.stars[i].draw(this.ctx);
    }
    for (var i=0; i<this.player.bullets.length; i++) {
        this.player.bullets[i].draw(this.ctx);
    }
    this.player.draw(this.ctx);
    for (var type in this.enemies) {
        for (var i=0; i<this.enemies[type].length; i++) {
            var e = this.enemies[type][i];
            e.draw(this.ctx);
        }
    }

    if (this.livesVisible) {
        this.drawLives(this.ctx, this.player.lives);
    }

    // Draw score
    this.ctx.font = SIZES.score.total + "px " + CONSTANTS.scoreFont;
    this.ctx.fillStyle = COLOURS.score;
    this.ctx.fillText(this.player.score, this.width - CONSTANTS.padding, CONSTANTS.padding);

    // Draw score popups
    this.ctx.fillStyle = COLOURS.score;
    this.ctx.font = SIZES.score.popup + "px " + CONSTANTS.scoreFont;
    for (var i=0; i<this.scorePopups.length; i++) {
        var p = this.scorePopups[i];
        p.draw(this.ctx);
        p.update(dt);
        if (p.isFinished()) {
            Utils.removeItem(p, this.scorePopups);
            i--;
        }
    }
}

/*
 * Create an enemy - either a target or a bomb
 */
Game.prototype.createEnemy = function() {
    var w = null;
    var h = null;

    var i = Math.floor(Math.random() * 2);
    var type = ["targets", "bombs"][i];
    if (type == "targets") {
        w = SIZES.target.width;
        h = SIZES.target.height;
    }
    else if (type == "bombs") {
        w = 2 * SIZES.bomb.radius;
        h = w;
    }

    var y = this.height + h / 2;
    var x = Utils.random(w / 2, this.width - w / 2);
    var speed = Utils.random(CONSTANTS.enemySpeeds.min, CONSTANTS.enemySpeeds.max);
    var enemy = null;

    if (type == "targets") {
        var colour = COLOURS.player.colours[Math.floor(Math.random() * COLOURS.player.colours.length)];
        enemy = new Target(x, y, colour, speed);
    }
    else if (type == "bombs") {
        enemy = new Bomb(x, y, speed);
    }
    this.enemies[type].push(enemy);
}

Game.prototype.createStar = function() {
    var y = Math.random() * this.height;
    var x = Math.random() * this.width;
    this.stars.push(new Star(x, y));
}

/*
 * Handle player collision with an enemy
 */
Game.prototype.handleEnemyCollision = function(enemy, type) {
    if (type == "targets") {
        var faceNum = enemy.getCollisionFace(this.player);

        if (this.player.getFaceColour(faceNum) == enemy.colour) {
            this.increasePlayerScore(CONSTANTS.points.target, enemy.x, enemy.y);
        }
        else {
            this.loseLife();
        }
    }
    else if (type == "bombs") {
        this.loseLife();
    }

    Utils.removeItem(enemy, this.enemies[type]);
}


Game.prototype.loseLife = function() {
    this.player.lives--;

    if (this.player.lives == 0) {
        this.gameOver();
    }
    else {
        this.animationHandlers["lives"].addToQueue([function(t) {
            // Split interval up into length-1 sections and alternate off/on
            this.livesVisible = (Math.floor(t) % 2 == 1);
        }.bind(this), 0, 2 * CONSTANTS.lifeFlashes - 1, TIMINGS.lifeFlashes]);
    }
}

/*
 * Increase the player's score and create a new score popup at (hitX, hitY)
 */
Game.prototype.increasePlayerScore = function(n, hitX, hitY) {
    this.player.score += n;
    this.scorePopups.push(new ScorePopup(n, hitX, hitY));
}

Game.prototype.handleKeyDown = function(e) {
    this.pressedKeys[e.keyCode] = true;

    if (e.keyCode == KEYS.rotateAnticlockwise || e.keyCode == KEYS.rotateClockwise) {
        var direction = (e.keyCode == KEYS.rotateAnticlockwise) ? ANTI_CLOCKWISE : CLOCKWISE;
        this.animationHandlers.playerRotations.addToQueue([
            this.player.getRotationCallback(direction), 0, 1, TIMINGS.rotationTime
        ]);
    }
}

Game.prototype.handleKeyUp = function(e) {
    delete this.pressedKeys[e.keyCode];

    // Remove bullet-shooting timer
    if (e.keyCode == KEYS.shoot) {
        delete this.timers.shoot;
    }
}

Game.prototype.gameOver = function(e) {
    this.inProgress = false;
}

Game.prototype.drawLives = function(ctx, n) {
    var x = CONSTANTS.padding;
    var y = CONSTANTS.padding;
    for (var i=0; i<n; i++) {
        // Draw solid interior
        ctx.fillStyle = COLOURS.lives.interior;
        var w = SIZES.lives.width;
        var h = SIZES.lives.height;
        ctx.fillRect(x, y, w, h);

        // Draw outline
        ctx.strokeStyle =  COLOURS.lives.outline;
        ctx.lineWidth = SIZES.lives.outlineWidth;
        ctx.strokeRect(x, y, w, h);

        x += SIZES.lives.width + CONSTANTS.padding;
    }
}

/*
 * Return the number of seconds between creating new enemies - used to change the timer interval
 * as the game progresses
 */
Game.prototype.getEnemyCreationInterval = function() {
    // Decrease interval time linearly until a min value
    var c = CONSTANTS.enemyCreation;
    return Math.max(c.initial + c.gradient * this.gameTime, c.min);
}
