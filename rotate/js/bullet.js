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

