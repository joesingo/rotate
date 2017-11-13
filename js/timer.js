function Timer(interval, callback) {
    this.timeLeft = interval;

    this.update = function(dt) {
        this.timeLeft -= dt;

        if (this.timeLeft <= 0) {
            this.timeLeft = interval;
            callback();
        }
    }
}

