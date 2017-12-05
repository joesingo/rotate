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
    this.speed = CONSTANTS.playerSpeeds.normal;
    // Rotation describes how many anti-cw 90 deg. turns the id 0 colour is from
    // the top triangle
    this.rotation = 0;
    this.score = 0;
    this.bullets = [];
    this.powerups = {};
}

Player.prototype.hasMaxLives = function() {
    return this.lives == CONSTANTS.startingLives;
}

Player.prototype.getFaceColour = function(faceNum) {
    var r = Math.round(this.rotation);
    var i = Utils.modulo(faceNum - r, 4);
    return COLOURS.player.colours[i];
};


Player.prototype.draw = function(ctx) {
    if (POWERUP_TYPES.ANY_COLOUR in this.powerups) {
        ctx.fillStyle = COLOURS.drops.anyColour;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
    else {
        // Points for the top triangle centred at the origin. These points will
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
    }

    // Rotate player and translate so player is at (0, 0)
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.rotation * Math.PI / 2);

    // Set outline width and colour depending on whether powerup is active
    var w = SIZES.player.outlineWidth;
    var ps = Object.keys(this.powerups);
    ctx.strokeStyle = (ps.length > 0 ? COLOURS.drops[ps[ps.length - 1]] : COLOURS.player.outline);
    ctx.lineWidth = (ps.length > 0 ? w.powerup : w.normal);

    // Special case for if any-colour powerup is active - use normal outline since interior will be
    // drop colour
    if (POWERUP_TYPES.ANY_COLOUR in this.powerups) {
        ctx.strokeStyle = COLOURS.player.outline;
    }

    // Fill and stroke gun(s)
    var gunAngles = [0];
    if (POWERUP_TYPES.MULTI_GUN in this.powerups) {
        gunAngles.push(Math.PI / 2, Math.PI, 3 * Math.PI / 2);
    }
    for (var i=0; i<gunAngles.length; i++) {
        ctx.save();
        // Translate to centre of edge gun will be on by rotating [0, 1]
        ctx.translate(this.size / 2 * -Math.sin(gunAngles[i]), this.size / 2 * Math.cos(gunAngles[i]));
        ctx.rotate(gunAngles[i]);
        // Draw 'downwards' facing gun
        var rectArgs = [
            -SIZES.player.gun.width / 2, 0, SIZES.player.gun.width, SIZES.player.gun.height
        ];

        if (POWERUP_TYPES.ANY_COLOUR in this.powerups) {
            ctx.fillStyle = COLOURS.drops.anyColour;
        }
        else {
            // i==0 corresponds to bottom colour, i.e. colour 2
            ctx.fillStyle = COLOURS.player.colours[(2 - i) % 4];
        }

        ctx.fillRect.apply(ctx, rectArgs);
        ctx.strokeRect.apply(ctx, rectArgs);
        ctx.restore();
    }

    // Stroke player outline
    ctx.strokeRect(
        -this.size / 2 + ctx.lineWidth / 2,
        -this.size / 2 + ctx.lineWidth / 2,
        this.size - ctx.lineWidth,
        this.size - ctx.lineWidth
    );

    ctx.restore();
};

/*
 * Move the player in the direction [dx, dy]
 */
Player.prototype.move = function(dt, dx, dy, game) {
    var speed = (POWERUP_TYPES.SPEED_BOOST in this.powerups ?
                 CONSTANTS.playerSpeeds.boost : this.speed);

    var dist = speed * dt;
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
    // Rotate angle to fire bullet at, starting from vector (0, 1)
    var angle = -this.rotation * Math.PI / 2;

    var angles = [angle];
    if (POWERUP_TYPES.MULTI_GUN in this.powerups) {
        for (var i=1; i<=3; i++) {
            angles.push(angle + i * Math.PI / 2);
        }
    }

    for (var i=0; i<angles.length; i++) {
        var u = -Math.sin(angles[i]);
        var v = Math.cos(angles[i])

        this.bullets.push(new Bullet(
            this.x + (u * this.size / 2), this.y + (v * this.size / 2),
            u, v
        ));
    }
}
