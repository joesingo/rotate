/*
 * Object to represent transient labels showing how many points just earned.
 * Inherit from Expirable and fade out opacity with time.
 */
function ScorePopup(points, x, y) {
    Expirable.call(this, TIMINGS.scorePopup);
    this.text = "+" + points;
    this.x = x;
    this.y = y;
}

ScorePopup.prototype = Object.create(Expirable.prototype);
ScorePopup.prototype.constructor = ScorePopup;

ScorePopup.prototype.draw = function(ctx) {
    // Calculate alpha from timeRemaining - inherited from Expirable
    var alpha = this.timeRemaining / this.timeToLive;
    ctx.globalAlpha = alpha;
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
}

