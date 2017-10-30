CLOCKWISE = "clockwise";
ANTI_CLOCKWISE = "anticlockwise";

TIMINGS = {
    "rotationTime": 0.1
};

SIZES = {
    "player": {
        "width": 60, "height": 60
    },
    "target": {
        "width": 20, "height": 20
    }
};

COLOURS = {
    "player": ["red", "green", "blue", "orange"],
    "background": "#333"
};

KEYS = {
    "up": 87,     // W
    "left": 65,   // A
    "down": 83,   // S
    "right": 68,  // D

    "rotateAnticlockwise": 38,   // Up arrow
    "rotateClockwise": 40,       // Down arrow
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

    this.width = SIZES.player.width;
    this.height = SIZES.player.height;

    this.speed = 350;
    // Rotation describes how many anti-cw 90 deg. turns the id 0 colour is from
    // the top triangle
    this.rotation = 0;
}

Player.prototype.getFaceColour = function(faceNum) {
    var r = Math.round(this.rotation);
    var i = Utils.modulo(faceNum - r, 4);
    return COLOURS.player[i];
};


Player.prototype.draw = function(ctx) {
    ctx.fillStyle = COLOURS.player;

    // Points for the top triangle centered at the origin. These points will
    // be rotated to draw other triangles
    var points = [
        [0, 0],
        [-this.width / 2, -this.height / 2],
        [this.width / 2, - this.height / 2]
    ];

    for (var i=0; i<4; i++) {
        var angle = (i + this.rotation) * Math.PI / 2;

        ctx.fillStyle = COLOURS.player[i];
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
};

/*
 * Move the player in the direction [dx, dy]
 */
Player.prototype.move = function(dt, dx, dy) {
    var dist = this.speed * dt;
    // Normalise the vector [dx, dy] and then scale by distance to travel
    // in this frame
    var mag = Math.sqrt(dx*dx + dy*dy);
    var scale = dist / mag;
    this.x += dx * scale;
    this.y += dy * scale;
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
}

/******************************************************************************/

function Game(canvas) {
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;

    this.scrollSpeed = 70;
    this.player = new Player(300, 100);
    this.targets = [];

    this.topY = 0;  // y-coordinate of the top of the screen

    this.pressedKeys = {};

    // Queues to handle animations. Have several queues so that unrelated
    // animations can happen concurrently
    this.animationHandlers = {};
    this.animationHandlers.playerRotations = new AnimationHandler();
}

Game.prototype.update = function(dt) {
    var scrollAmount = this.scrollSpeed * dt;
    this.ctx.translate(0, -scrollAmount);
    this.topY += scrollAmount;

    this.ctx.fillStyle = COLOURS.background;
    this.ctx.fillRect(0, this.topY, this.width, this.height);

    // Handle player movement/rotation
    this.player.y += scrollAmount;
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
        this.player.move(dt, dx, dy);
    }

    // Process animation handlers
    for (var a in this.animationHandlers) {
        var anim = this.animationHandlers[a];
        if (anim.queue.length > 0) {
            anim.update(dt);
        }
    }

    // Spawn some targets in a very crude way
    if (Math.random() < 0.01) {
        var x = Math.random() * this.width;
        var colour = COLOURS.player[Math.floor(Math.random() * 4)];
        this.targets.push(new Target(x, this.height + this.topY, colour));
    }

    // Collision detection
    for (var i=0; i<this.targets.length; i++) {
        var p = this.player;
        var t = this.targets[i];

        // Note: here we assume each side of the targets are smaller than all
        // sides of the player
        var corners = [
            [t.x - t.width / 2, t.y - t.height / 2],
            [t.x - t.width / 2, t.y + t.height / 2],
            [t.x + t.width / 2, t.y + t.height / 2],
            [t.x + t.width / 2, t.y - t.height / 2]
        ];
        for (var j=0; j<corners.length; j++) {
            var x = corners[j][0];
            var y = corners[j][1];
            if (p.x - p.width / 2 <= x && x <= p.x + p.width / 2 &&
                p.y - p.height / 2 <= y && y <= p.y + p.height / 2) {

                var distances = [
                    y - (p.y - p.height / 2),
                    x - (p.x - p.width / 2),
                    p.y + p.height / 2 - y,
                    p.x + p.width / 2 - x
                ];
                var faceNum = distances.indexOf(Math.min.apply(null, distances));
                this.handleTargetCollision(faceNum, t);
                break;
            }
        }
    }

    // Drawing
    for (var i=0; i<this.targets.length; i++) {
        this.targets[i].draw(this.ctx);
    }
    this.player.draw(this.ctx);
}

Game.prototype.handleTargetCollision = function(faceNum, target) {
    if (this.player.getFaceColour(faceNum) != target.colour) {
        console.log("oops");
    }
    this.targets.splice(this.targets.indexOf(target), 1);
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

var canvas = document.getElementById("game-canvas");
var game = new Game(canvas);

window.addEventListener("keydown", function(e) {
    game.handleKeyDown(e);
});
window.addEventListener("keyup", function(e) {
    game.handleKeyUp(e);
});

// Start game timer
var now = null;
var then = performance.now();
window.setInterval(function() {
    now = performance.now();
    var dt = (now - then) / 1000;
    then = now;
    game.update(dt);
}, 10);

