function AnimationHandler() {
    this.queue = [];

    // null t parameters for clarity
    this.t = null;
    this.tEnd = null;
    this.time = null;
}

/*
 * Queue up a new animation. args should be [callback, tStart, tEnd, time], where
 * `callback` is called periodically with a single parameter `t` that varies
 * linearly from `tStart` to `tEnd` over `time` seconds
 */
AnimationHandler.prototype.addToQueue = function(args) {
    this.queue.push(args);

    if (this.queue.length == 1) {
        this.next();
    }
}

/*
 * Setup the next animation
 */
AnimationHandler.prototype.next = function() {
    this.callback = this.queue[0][0];
    this.tStart = this.queue[0][1];
    this.tEnd = this.queue[0][2];
    this.time = this.queue[0][3];
    this.t = this.tStart;
};

AnimationHandler.prototype.update = function(dt) {
    this.callback(this.t);

    if (this.t == this.tEnd) {
        this.queue.shift();

        if (this.queue.length > 0) {
            this.next();
        }
        return;
    }

    this.t += dt * (this.tEnd - this.tStart) / this.time;

    if (this.t >= this.tEnd) {
        this.t = this.tEnd;
    }
}

