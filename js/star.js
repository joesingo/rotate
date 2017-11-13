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

