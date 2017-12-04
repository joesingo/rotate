/*
 * Object to represent an item that can be picked up by the player to activate a
 * powerup
 */
function DropItem(x, y, type, timeToLive) {
    if (Object.values(POWERUP_TYPES).indexOf(type) < 0) {
        throw `Invalid drop item type '${type}'`;
    }

    Expirable.call(this, TIMINGS.dropItems);
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = SIZES.drops.width;
    this.height = SIZES.drops.height;
}

DropItem.prototype = Object.create(Expirable.prototype)
DropItem.prototype.constructor = DropItem;

/*
 * Draw method as a 'static' method so can use to draw lives without reference
 * to an instance. (x, y) is the coordinates of the center of the rectangle.
 */
DropItem.draw = function(ctx, type, x, y) {
    // Draw solid interior
    ctx.fillStyle = COLOURS.drops[type];
    var w = SIZES.drops.width;
    var h = SIZES.drops.height;
    var rectArgs = [x - w / 2, y - h / 2, w, h];
    ctx.fillRect.apply(ctx, rectArgs);

    // Draw outline
    ctx.strokeStyle = COLOURS.drops.outline;
    ctx.lineWidth = SIZES.drops.outlineWidth;
    ctx.strokeRect.apply(ctx, rectArgs);
}

DropItem.prototype.draw = function(ctx) {
    ctx.globalAlpha = Math.abs(Math.sin(CONSTANTS.powerups.flashes * Math.PI * this.timeRemaining));
    DropItem.draw(ctx, this.type, this.x, this.y);
    ctx.globalAlpha = 1;
}

DropItem.prototype.collidesWithPlayer = function(player) {
    return Utils.rectanglesCollide(
        this.x - this.width / 2, this.y - this.height / 2, this.width, this.height,
        player.x - player.size / 2, player.y - player.size / 2,
        player.size, player.size
    );
}
