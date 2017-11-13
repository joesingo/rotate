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

