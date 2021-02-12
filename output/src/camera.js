import { updateSpeedAxis } from "./util.js";
import { Rect, Vector2 } from "./vector.js";
var Camera = /** @class */ (function () {
    function Camera(x, y) {
        var _this = this;
        this.getViewport = function () { return _this.viewport.clone(); };
        this.pos = new Vector2(x, y);
        this.viewport = new Rect();
        this.centerOff = new Vector2();
        this.centerOffTarget = this.centerOff.clone();
    }
    Camera.prototype.computeViewport = function (c) {
        this.viewport.w = c.width;
        this.viewport.h = c.height;
        this.viewport.x = this.pos.x + this.centerOff.x - this.viewport.w / 2;
        this.viewport.y = this.pos.y + this.centerOff.y - this.viewport.h / 2;
    };
    Camera.prototype.use = function (c) {
        this.computeViewport(c);
        c.moveTo(-Math.round(this.viewport.x), -Math.round(this.viewport.y));
    };
    Camera.prototype.followObject = function (o, ev) {
        var EPS = 0.1;
        var FORWARD = 48;
        var MOVE_SPEED_X = 1.0;
        var VERTICAL_DEADZONE = 32;
        this.pos.x = o.getPos().x;
        var d = this.pos.y - o.getPos().y;
        if (Math.abs(d) >= VERTICAL_DEADZONE) {
            this.pos.y = o.getPos().y + VERTICAL_DEADZONE * Math.sign(d);
        }
        var target = o.getTarget().x;
        var dir = 0;
        if (Math.abs(target) > EPS) {
            dir = Math.sign(target);
        }
        this.centerOffTarget.x = dir * FORWARD;
        if (this.viewport.x < EPS && this.centerOffTarget.x < 0)
            this.centerOffTarget.x = 0.0;
        this.centerOff.x = updateSpeedAxis(this.centerOff.x, this.centerOffTarget.x, MOVE_SPEED_X * ev.step);
    };
    Camera.prototype.restrictCamera = function (x, y, w, h) {
        var oldViewport = this.viewport.clone();
        // Left
        if (this.viewport.x < x) {
            if (this.centerOff.x < 0) {
                this.centerOff.x += (x - this.viewport.x);
                if (this.centerOff.x > 0)
                    this.centerOff.x = 0;
            }
            if (this.centerOff.x >= 0) {
                this.viewport.x = x;
                this.pos.x += this.viewport.x - oldViewport.x;
            }
        }
        // Right
        if (this.viewport.x + this.viewport.w > x + w) {
            if (this.centerOff.x > 0) {
                this.centerOff.x += (x + w - this.viewport.x - this.viewport.w);
                if (this.centerOff.x < 0)
                    this.centerOff.x = 0;
            }
            if (this.centerOff.x <= 0) {
                this.viewport.x = (x + w) - this.viewport.w;
                this.pos.x += this.viewport.x - oldViewport.x;
            }
        }
        // Top
        if (this.viewport.y < y) {
            this.viewport.y = y;
        }
        // Bottom
        if (this.viewport.y + this.viewport.h > (y + h)) {
            this.viewport.y = (y + h) - this.viewport.h;
        }
        this.pos.y += this.viewport.y - oldViewport.y;
    };
    return Camera;
}());
export { Camera };
