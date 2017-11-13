CLOCKWISE = "clockwise";
ANTI_CLOCKWISE = "anticlockwise";

TIMINGS = {
    "rotationTime": 0.1,
    "starCreation": 2,
    // The minimum time between between firing bullets when holding shoot button
    "shootInterval": 0.2,
    "scorePopup": 0.5,  // Amount of time the score popups are shown for
    "lifeFlashes": 0.25,   // How long to flash lives for upon life loss
};

SIZES = {
    "player": {
        "size": 60,
        "outlineWidth": 3,
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
    "lives": {
        "width": 15, "height": 30, "outlineWidth": 4
    },
    "score": {
        "total": 30, "popup": 20
    }
};

COLOURS = {
    "player": {
        "colours": ["red", "green", "blue", "orange"],
        "outline": "white"
    },
    "background": "#333",
    "star": "white",
    "bomb": {
        "interior": "black", "outline": "white"
    },
    "bullet": {
        "interior": "white", "outline": "black"
    },
    "lives": {
        "interior": "red", "outline": "white"
    },
    "score": "white",
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
    "scoreFont": "Verdana",
    "lifeFlashes": 2,  // How many times to flash lives
};

KEYS = {
    "up": 87,     // W
    "left": 65,   // A
    "down": 83,   // S
    "right": 68,  // D

    "rotateAnticlockwise": 38,   // Up arrow
    "rotateClockwise": 40,       // Down arrow

    "shoot": 32,  // Space
};

