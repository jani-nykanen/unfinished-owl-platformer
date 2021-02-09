import { Flip } from "./canvas.js";
var Sprite = /** @class */ (function () {
    function Sprite(w, h) {
        var _this = this;
        this.getRow = function () { return _this.row; };
        this.getColumn = function () { return _this.column; };
        this.getTimer = function () { return _this.timer; };
        this.width = w;
        this.height = h;
        this.row = 0;
        this.column = 0;
        this.timer = 0.0;
    }
    Sprite.prototype.animate = function (row, start, end, speed, steps) {
        if (steps === void 0) { steps = 1.0; }
        row |= 0;
        start |= 0;
        end |= 0;
        speed |= 0;
        if (start == end) {
            this.timer = 0;
            this.column = start;
            this.row = row;
            return;
        }
        if (this.row != row) {
            this.timer = 0;
            this.column = end > start ? start : end;
            this.row = row;
        }
        if ((start < end && this.column < start) ||
            (start > end && this.column > start)) {
            this.column = start;
        }
        this.timer += steps;
        if (this.timer > speed) {
            // Loop the animation, if end reached
            if (start < end) {
                if (++this.column > end) {
                    this.column = start;
                }
            }
            else {
                if (--this.column < end) {
                    this.column = start;
                }
            }
            this.timer -= speed;
        }
    };
    Sprite.prototype.setFrame = function (column, row, preserveTimer) {
        if (preserveTimer === void 0) { preserveTimer = false; }
        this.column = column;
        this.row = row;
        if (!preserveTimer)
            this.timer = 0;
    };
    Sprite.prototype.drawFrame = function (c, bmp, column, row, dx, dy, flip) {
        if (flip === void 0) { flip = Flip.None; }
        c.drawBitmapRegion(bmp, this.width * column, this.height * row, this.width, this.height, dx, dy, flip);
    };
    Sprite.prototype.draw = function (c, bmp, dx, dy, flip) {
        if (flip === void 0) { flip = Flip.None; }
        this.drawFrame(c, bmp, this.column, this.row, dx, dy, flip);
    };
    return Sprite;
}());
export { Sprite };
