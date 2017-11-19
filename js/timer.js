function Timer(interval, callback) {
    this.interval = interval;
    this.timeLeft = this.interval;

    this.update = function(dt) {
        this.timeLeft -= dt;

        if (this.timeLeft <= 0) {
            this.timeLeft = this.interval;
            callback();
        }
    }
}

