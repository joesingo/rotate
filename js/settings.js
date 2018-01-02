CLOCKWISE = "clockwise";
ANTI_CLOCKWISE = "anticlockwise";

TIMINGS = {
    "rotationTime": 0.1,
    // The minimum time between between firing bullets when holding shoot button
    "shootInterval": 0.2,
    "scorePopup": 0.5,    // Amount of time the score popups are shown for
    "lifeFlashes": 0.25,  // How long to flash lives for upon life loss
    "powerups": 7,        // How long time-based powerups last for
    "dropItems": 7,       // How long drop items last until expiring
};

SIZES = {
    "canvas": {
        "width": 600, "height": 700
    },
    "player": {
        "size": 60,
        "outlineWidth": {
            "normal": 3, "powerup": 5
        },
        "gun": {
            "width": 15, "height": 15
        },
    },
    "target": {
        "width": 40, "height": 40
    },
    "starRadius": 5,
    "bomb": {
        "radius": 20, "outlineWidth": 3
    },
    "bullet": {
        "radius": 5, "outlineWidth": 2
    },
    "drops": {
        "width": 20, "height": 30, "outlineWidth": 4
    },
    "score": {
        "total": 35, "popup": 25
    },
    "powerupBar": {
        "width": 200, "height": 10, "outline": 2
    },
};

COLOURS = {
    "player": {
        "colours": ["red", "green", "blue", "orange"],
        "outline": "white",
    },
    "background": "#333",
    "star": "white",
    "bomb": {
        "interior": "black", "outline": "white"
    },
    "bullet": {
        "interior": "white", "outline": "black"
    },
    "score": "white",
    "drops": {
        "outline": "white",
        "life": "red",
        "speedBoost": "cornflowerblue",
        "multiGun": "limegreen",
        "anyColour": "purple",
    },
};

CONSTANTS = {
    "startingLives": 10,
    "numStars": 20,
    "starOpacity": 0.15,
    "starSpeed": 5,
    "bulletSpeed": 500,
    "padding": 15,  // Padding to use between score/lives/etc and edges of canvas
    // Number of points earned for defeating each type of enemy
    "points": {
        "target": 1,
        "bomb": 2
    },
    "scoreFont": "Ranga",
    "lifeFlashes": 2,  // How many times to flash lives
    "enemyCreation": {
        "initial": 1.5,
        "min": 0.5,
        "gradient": -0.1 / 30,  // Decrease by 0.1 every 30 seconds
    },
    "enemySpeeds": {
        "min": 45, "max": 120
    },
    "playerSpeeds": {
        "normal": 350, "boost": 600
    },
    "powerups": {
        "probability": 0.03,  // The probability that a powerup will spawn when an enemy is created
        "flashes": 2,         // The number of times to flash per second
    },
};

KEYS = {
    "up": 87,     // W
    "left": 65,   // A
    "down": 83,   // S
    "right": 68,  // D

    "rotateAnticlockwise": 38,   // Up arrow
    "rotateClockwise": 40,       // Down arrow

    "shoot": 32,  // Space

    "pause": 27,  // Escape

    "mute": 77,   // M
};

AUDIO = {
    "shoot": {"path": "audio/shoot.wav", "volume": 0.7},
    "explosion": {"path": "audio/explosion.wav", "volume": 0.7},
    "rotate": {"path": "audio/rotate.wav"},
    "success": {"path": "audio/coin.wav", "volume": 0.3},
}
