var Utils = {
    /*
     * Return a mod n, giving a non-negative answer for negative a
     */
    "modulo": function(a, n) {
        if (a >= 0) {
            return a % n;
        }
        else {
            return n - (-a % n);
        }
    },

    /*
     * Return true if two rectangles collide, and false otherwise. The x and y
     * coordinates should be of the top left corner of each rectangle
     */
    "rectanglesCollide": function(x1, y1, width1, height1,
                                  x2, y2, width2, height2) {
        var overlapX = (
            (x1 <= x2 && x2 <= x1 + width1) ||
            (x2 <= x1 && x1 <= x2 + width2)
        )
        var overlapY = (
            (y1 <= y2 && y2 <= y1 + width1) ||
            (y2 <= y1 && y1 <= y2 + width2)
        )

        return overlapX && overlapY;
    },

    "drawBorderedCircle": function(ctx, x, y, radius, borderWidth, borderColour, interiorColour) {
        var d = [
            [radius, borderColour],
            [radius - borderWidth, interiorColour]
        ];
        for (var i=0; i<d.length; i++) {
            ctx.fillStyle = d[i][1];
            ctx.beginPath();
            ctx.arc(x, y, d[i][0], 0, 2 * Math.PI);
            ctx.fill();
        }
    },

    "removeItem": function(item, arr) {
        var idx = arr.indexOf(item);
        if (idx < 0) {
            throw "Item not found in array";
        }
        arr.splice(idx, 1);
    },

    /*
     * Return a random number in [min, max)
     */
    "random": function(min, max) {
        if (min > max) {
            throw "Max must be greater than min";
        }
        var r = Math.random();
        return (max - min) * r + min;
    }
};

