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

