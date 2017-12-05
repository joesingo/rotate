function Target(x, y, colour, speed) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.speed = speed;

    this.width = SIZES.target.width;
    this.height = SIZES.target.height;
}

/*
 * Draw the target. `anyColourPowerup` is true is any-colour powerup is currently active, since
 * then the target is not drawn in its true colour
 */
Target.prototype.draw = function(ctx, anyColourPowerup) {
    ctx.fillStyle = (anyColourPowerup ? COLOURS.drops.anyColour : this.colour);
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

