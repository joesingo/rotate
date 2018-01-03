function AudioManager() {
    this.muted = false;
    this.sounds = {};
    this.loadSounds();
}

/*
 * Populate `this.sounds` with Audio objects
 */
AudioManager.prototype.loadSounds = function() {
    // Allow a variable AUDIO_PREFIX to be added to the start URLs pointing to
    // audio files, in case game needs to be deployed into an existing web page
    // in which case a relative link won't work
    prefix = (typeof(AUDIO_PREFIX) !== "undefined" ? AUDIO_PREFIX : "");

    for (var name in AUDIO) {
        this.sounds[name] = new Audio(prefix + AUDIO[name].path);
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
    AUDIO_PREFIX = "http://files.joesingo.co.uk/81109f59ff7f12bed867d0735052bdf3/";
    game.audio.loadSounds();
}
