function AudioManager() {
    this.muted = false;
    this.sounds = {};

    for (var name in AUDIO) {
        this.sounds[name] = new Audio(AUDIO[name].path);
        this.sounds[name].volume = AUDIO[name].volume || 1;
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

function easteregg() {
    console.log("hehe");
    for (var name in AUDIO) {
        game.audio.sounds[name].src = "http://files.joesingo.co.uk/81109f59ff7f12bed867d0735052bdf3/" +
                                       AUDIO[name].path;
    }
}
