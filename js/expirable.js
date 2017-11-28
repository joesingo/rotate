/*
 * An object to represent an entity that expires after a certain amount of time
 */
function Expirable(timeToLive) {
    this.timeToLive = timeToLive;
    this.timeRemaining = this.timeToLive;
}

Expirable.prototype.update = function(dt) {
    this.timeRemaining -= dt;
}

Expirable.prototype.isFinished = function(dt) {
    return this.timeRemaining <= 0;
}

