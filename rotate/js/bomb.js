function Bomb(x, y, speed) {
    this.x = x;
    this.y = y;
    this.radius = SIZES.bomb.radius
    this.speed = speed;
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

