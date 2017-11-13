CLOCKWISE = "clockwise";
ANTI_CLOCKWISE = "anticlockwise";

TIMINGS = {
    "rotationTime": 0.1,
    "starCreation": 2,
    // The minimum time between between firing bullets when holding shoot button
    "shootInterval": 0.2,
    "scorePopup": 0.5,  // Amount of time the score popups are shown for
};

SIZES = {
    "player": {
        "size": 60,
        "outlineWidth": 3,
        "gun": {
            "width": 15, "height": 15
        },
    },
    "target": {
        "width": 40, "height": 40
    },
    "starRadius": 5,
    "bomb": {
        "radius": 20, "outlineWidth": 3
    },
    "bullet": {
        "radius": 5, "outlineWidth": 2
    },
    "lives": {
        "width": 15, "height": 30, "outlineWidth": 4
    },
    "score": {
        "total": 30, "popup": 20
    }
};

COLOURS = {
    "player": {
        "colours": ["red", "green", "blue", "orange"],
        "outline": "white"
    },
    "background": "#333",
    "star": "white",
    "bomb": {
        "interior": "black", "outline": "white"
    },
    "bullet": {
        "interior": "white", "outline": "black"
    },
    "lives": {
        "interior": "red", "outline": "white"
    },
    "score": "white",
};

CONSTANTS = {
    "startingLives": 10,
    "numStars": 20,
    "starOpacity": 0.15,
    "starSpeed": 5,
    "bulletSpeed": 500,
    "padding": 15,  // Padding to use between score/lives/etc and edges of canvas
    // Number of points earned for defeating each type of enemy
    "points": {
        "target": 1,
        "bomb": 2
    },
    "scoreFont": "Verdana",
};

KEYS = {
    "up": 87,     // W
    "left": 65,   // A
    "down": 83,   // S
    "right": 68,  // D

    "rotateAnticlockwise": 38,   // Up arrow
    "rotateClockwise": 40,       // Down arrow

    "shoot": 32,  // Space
};

/******************************************************************************/

var Utils = {
    /*
     * Return a mod n, giving a non-negative answer for negative a
     */
    "modulo": function(a, n) {
        if (a >= 0) {
            return a % n;
        }
        else {
            return n - (-a % n);
        }
    },

    /*
     * Return true if two rectangles collide, and false otherwise. The x and y
     * coordinates should be of the top left corner of each rectangle
     */
    "rectanglesCollide": function(x1, y1, width1, height1,
                                  x2, y2, width2, height2) {
        var overlapX = (
            (x1 <= x2 && x2 <= x1 + width1) ||
            (x2 <= x1 && x1 <= x2 + width2)
        )
        var overlapY = (
            (y1 <= y2 && y2 <= y1 + width1) ||
            (y2 <= y1 && y1 <= y2 + width2)
        )

        return overlapX && overlapY;
    },

    "drawBorderedCircle": function(ctx, x, y, radius, borderWidth, borderColour, interiorColour) {
        var d = [
            [radius, borderColour],
            [radius - borderWidth, interiorColour]
        ];
        for (var i=0; i<d.length; i++) {
            ctx.fillStyle = d[i][1];
            ctx.beginPath();
            ctx.arc(x, y, d[i][0], 0, 2 * Math.PI);
            ctx.fill();
        }
    },

    "removeItem": function(item, arr) {
        var idx = arr.indexOf(item);
        if (idx < 0) {
            throw "Item not found in array";
        }
        arr.splice(idx, 1);
    }
};

/******************************************************************************/

/*
 * A player is 4 coloured triangles arranged in a square:
 *          Top (0)
 * Left (1)           Right (3)
 *          Bottom (2)
 */
function Player(x, y) {
    // Coordinates of the center of the player square
    this.x = x;
    this.y = y;

    this.size = SIZES.player.size;

    this.lives = CONSTANTS.startingLives;
    this.speed = 350;
    // Rotation describes how many anti-cw 90 deg. turns the id 0 colour is from
    // the top triangle
    this.rotation = 0;
    this.score = 0;
    this.bullets = [];
}

Player.prototype.getFaceColour = function(faceNum) {
    var r = Math.round(this.rotation);
    var i = Utils.modulo(faceNum - r, 4);
    return COLOURS.player.colours[i];
};


Player.prototype.draw = function(ctx) {
    // Points for the top triangle centered at the origin. These points will
    // be rotated to draw other triangles
    var points = [
        [0, 0],
        [-this.size / 2, -this.size / 2],
        [this.size / 2, - this.size / 2]
    ];

    for (var i=0; i<4; i++) {
        var angle = (i + this.rotation) * Math.PI / 2;

        ctx.fillStyle = COLOURS.player.colours[i];
        ctx.beginPath();
        for (var j=0; j<points.length; j++) {
            // We have -y in place in y in the usual formula since +ve y direction is downwards
            // in canvas coordinates
            var px = Math.cos(angle) * points[j][0] + Math.sin(angle) * points[j][1];
            var py = Math.sin(angle) * points[j][0] - Math.cos(angle) * points[j][1];
            ctx.lineTo(this.x + px, this.y - py);

        }
        ctx.fill();
    }

    // Rotate player and tranlate so player is at (0, 0)
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.rotation * Math.PI / 2);

    // Draw gun
    var gunRectArgs = [
        -SIZES.player.gun.width / 2,
        this.size / 2,
        SIZES.player.gun.width,
        SIZES.player.gun.height
    ];
    ctx.fillStyle = COLOURS.player.colours[2];  // Use bottom face colour
    ctx.fillRect.apply(ctx, gunRectArgs);

    // Draw outlines
    ctx.lineWidth = SIZES.player.outlineWidth;
    ctx.strokeStyle = COLOURS.player.outline;
    ctx.strokeRect.apply(ctx, gunRectArgs);
    ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

    ctx.restore();
};

/*
 * Move the player in the direction [dx, dy]
 */
Player.prototype.move = function(dt, dx, dy, game) {
    var dist = this.speed * dt;
    // Normalise the vector [dx, dy] and then scale by distance to travel
    // in this frame
    var mag = Math.sqrt(dx*dx + dy*dy);
    var scale = dist / mag;
    this.x += dx * scale;
    this.y += dy * scale;

    // Ensure player does not go off the screen
    var hs = this.size / 2;
    this.x = Math.min(game.width - hs, Math.max(hs, this.x));
    this.y = Math.min(game.height - hs, Math.max(hs, this.y));
}

/*
 * Return a callback function to rotate the player in the given direction.
 * To be used with an AnimationHandler with t going from 0 to 1
 */
Player.prototype.getRotationCallback = function(direction) {
    var sign = (direction == CLOCKWISE) ? -1 : 1;
    var startRotation = null;
    var thisPlayer = this;

    var callback = function(t) {
        if (t == 0) {
            startRotation = thisPlayer.rotation;
        }
        thisPlayer.rotation = startRotation + sign * t;

        // Ensure rotation is in range [0, 3] when animtion has finished
        if (thisPlayer.rotation == startRotation + sign) {
            thisPlayer.rotation = Utils.modulo(thisPlayer.rotation, 4);
        }
    }
    return callback;
}

/*
 * Create a new bullet at the center of the bottom edge of the player
 */
Player.prototype.shoot = function() {
    // Retoate angle to fire bullet at, starting from vector (0, 1)
    var angle = -this.rotation * Math.PI / 2;
    var u = -Math.sin(angle);
    var v = Math.cos(angle)

    this.bullets.push(new Bullet(
        this.x + (u * this.size / 2), this.y + (v * this.size / 2),
        u, v
    ));
}

/******************************************************************************/

function Target(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;

    this.width = SIZES.target.width;
    this.height = SIZES.target.height;
}

Target.prototype.draw = function(ctx) {
    ctx.fillStyle = this.colour;
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width,
                 this.height);
    // Use same colour and width as player outline
    ctx.strokeStyle = COLOURS.player.outline;
    ctx.lineWidth = SIZES.player.outlineWidth;
    ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width,
                   this.height);
}

/*
 * Return the y-coordinate of the lowest point of the target
 */
Target.prototype.getBottomYCoord = function() {
    return this.y + this.height / 2;
}

/*
 * Return the face number of the player that has collided with the player, to
 * be used in the event of a collision
 */
Target.prototype.getCollisionFace = function(player) {
    // Calculate distance from center of each edge off player to center of target.
    // Smallest distance will tell us which edge collided with the target
    var points = [
        [player.x, player.y - player.size / 2],  // face 0
        [player.x - player.size / 2, player.y],  // face 1
        [player.x, player.y + player.size / 2],  // face 2
        [player.x + player.size / 2, player.y]   // face 3
    ];
    var distances = points.map(function(point) {
        var dx = point[0] - this.x;
        var dy = point[1] - this.y;
        // No need to sqrt since distance is minimised when squared distance is
        return dx*dx + dy*dy;
    }, this);
    return distances.indexOf(Math.min.apply(null, distances));
}

/*
 * Return true if the target overlaps with the player, and false otherwise
 */
Target.prototype.collidesWithPlayer = function(player) {
    return Utils.rectanglesCollide(
        player.x - player.size / 2, player.y - player.size / 2, player.size, player.size,
        this.x - this.width / 2, this.y - this.width / 2, this.width, this.height
    );
}

/******************************************************************************/

function Bomb(x, y) {
    this.x = x;
    this.y = y;
    this.radius = SIZES.bomb.radius
}

Bomb.prototype.draw = function(ctx) {
    // Draw outline by drawing border circle with full radius, and smaller circle
    // with interior colour
    Utils.drawBorderedCircle(ctx, this.x, this.y, this.radius, SIZES.bomb.outlineWidth,
                             COLOURS.bomb.outline, COLOURS.bomb.interior);
}

/*
 * Return the y-coordinate of the lowest point of the bomb
 */
Bomb.prototype.getBottomYCoord = function() {
    return this.y + this.radius;
}

/*
 * Return true if the bomb overlaps with the player, and false otherwise
 */
Bomb.prototype.collidesWithPlayer = function(player) {
    // Treat bomb as a rectangle for simplicity
    return Utils.rectanglesCollide(
        player.x - player.size / 2, player.y - player.size / 2, player.size,  player.size,
        this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius
    );
}

/*
 * Return true if the bomb collides with the given bullet, and false otherwis
 */
Bomb.prototype.collidesWithBullet = function(bullet) {
    var dx = this.x - bullet.x;
    var dy = this.y - bullet.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    return dist <= this.radius + bullet.radius;
}

/******************************************************************************/

/*
 * A bullet fired by the player, starting at (x, y) in direction (u, v)
 */
function Bullet(x, y, u, v) {
    this.x = x;
    this.y = y;
    this.u = u;
    this.v = v;
    this.radius = SIZES.bullet.radius;
}

Bullet.prototype.draw = function(ctx) {
    Utils.drawBorderedCircle(ctx, this.x, this.y, this.radius, SIZES.bullet.outlineWidth,
                             COLOURS.bullet.outline, COLOURS.bullet.interior);
}

Bullet.prototype.move = function(dt) {
    // Note: This relies on (u, v) being a unit vector
    this.x += CONSTANTS.bulletSpeed * this.u * dt;
    this.y += CONSTANTS.bulletSpeed * this.v * dt;
}

/******************************************************************************/

function Game(canvas) {
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.inProgress = true;

    this.scrollSpeed = 70;
    this.player = new Player(300, 100);
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

    this.timers = {};

    this.enemyCreationInterval = 1.5;
    this.timers["enemies"] = new Timer(this.enemyCreationInterval, this.createEnemy.bind(this));

    for (var i=0; i<CONSTANTS.numStars; i++) {
        this.createStar();
    }

    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";

    this.scorePopups = [];
}

Game.prototype.update = function(dt) {
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
    var scrollAmount = this.scrollSpeed * dt;
    for (var type in this.enemies) {
        for (var i=0; i<this.enemies[type].length; i++) {
            var e = this.enemies[type][i];
            e.y -= scrollAmount;

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

    this.drawLives(this.ctx, this.player.lives);
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
    var x = (w / 2) + Math.random() * (this.width - w);
    var enemy = null;

    if (type == "targets") {
        var colour = COLOURS.player.colours[Math.floor(Math.random() * COLOURS.player.colours.length)];
        enemy = new Target(x, y, colour);
    }
    else if (type == "bombs") {
        enemy = new Bomb(x, y);
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

/******************************************************************************/

/*
 * Object to represent transient labels showing how many points just earned
 */
function ScorePopup(points, x, y) {
    this.text = "+" + points;
    this.x = x;
    this.y = y;
    this.alpha = 1;
}

ScorePopup.prototype.draw = function(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
}

/*
 * Animate opacity of labels to fade out
 */
ScorePopup.prototype.update = function(dt) {
    this.alpha -= dt / TIMINGS.scorePopup;
}

ScorePopup.prototype.isFinished = function() {
    return this.alpha <= 0;
}

/******************************************************************************/

function Star(x, y) {
    this.x = x;
    this.y = y;

    var angle = Math.random() * 2 * Math.PI;
    this.u = CONSTANTS.starSpeed * Math.cos(angle);
    this.v = CONSTANTS.starSpeed * Math.sin(angle);
}

Star.prototype.update = function(dt) {
    this.x += this.u * dt;
    this.y += this.v * dt;

    if (this.x < 0 || this.x > game.width) {
        var s = (this.x < 0) ? 1 : -1;
        this.x += s * game.width;
    }
    if (this.y < 0 || this.y > game.height) {
        var s = (this.y < 0) ? 1 : -1;
        this.y += s * game.height;
    }
}

Star.prototype.draw = function(ctx) {
    ctx.fillStyle = COLOURS.star;
    ctx.beginPath();
    ctx.arc(this.x, this.y, SIZES.starRadius, 0, 2 * Math.PI);
    ctx.globalAlpha = CONSTANTS.starOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
}

/******************************************************************************/

function AnimationHandler() {
    this.queue = [];

    // null t parameters for clarity
    this.t = null;
    this.tEnd = null;
    this.time = null;
}

/*
 * Queue up a new animation. args should be [callback, tStart, tEnd, time], where
 * `callback` is called periodically with a single parameter `t` that varies
 * linearly from `tStart` to `tEnd` over `time` seconds
 */
AnimationHandler.prototype.addToQueue = function(args) {
    this.queue.push(args);

    if (this.queue.length == 1) {
        this.next();
    }
}

/*
 * Setup the next animation
 */
AnimationHandler.prototype.next = function() {
    this.callback = this.queue[0][0];
    this.tStart = this.queue[0][1];
    this.tEnd = this.queue[0][2];
    this.time = this.queue[0][3];
    this.t = this.tStart;
};

AnimationHandler.prototype.update = function(dt) {
    this.callback(this.t);

    if (this.t == this.tEnd) {
        this.queue.shift();

        if (this.queue.length > 0) {
            this.next();
        }
        return;
    }

    this.t += dt * (this.tEnd - this.tStart) / this.time;

    if (this.t >= this.tEnd) {
        this.t = this.tEnd;
    }
}

/******************************************************************************/

function Timer(interval, callback) {
    this.timeLeft = interval;

    this.update = function(dt) {
        this.timeLeft -= dt;

        if (this.timeLeft <= 0) {
            this.timeLeft = interval;
            callback();
        }
    }
}

/******************************************************************************/

var canvas = document.getElementById("game-canvas");
var game = new Game(canvas);

window.addEventListener("keydown", game.handleKeyDown.bind(game));
window.addEventListener("keyup", game.handleKeyUp.bind(game));

// Start game timer
var now = null;
var then = performance.now();
var mainLoop = window.setInterval(function() {
    now = performance.now();
    var dt = (now - then) / 1000;
    then = now;

    if (game.inProgress) {
        game.update(dt);
    }
    else {
        window.clearInterval(mainLoop);
    }
}, 10);

