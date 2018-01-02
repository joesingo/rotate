function AudioManager() {
    this.muted = false;
    this.sounds = {};

    for (var name in AUDIO) {
        this.sounds[name] = new Audio(AUDIO[name]["path"]);
        this.sounds[name].volume = AUDIO[name]["volume"] || 1;
    }
}

AudioManager.prototype.play = function(name) {
    if (!this.muted) {
        var s = this.sounds[name];
        if (s.paused) {
            s.play();
        }
        else {
            s.currentTime = 0;
        }
    }
}
