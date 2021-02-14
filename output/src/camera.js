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
        this.centerOff.x = updateSpeedAxis(this.centerOff.x, this.centerOffTarget.x, MOVE_SPEED_X * ev.step);
    };
    Camera.prototype.setPosition = function (v) {
        this.pos = v.clone();
    };
    Camera.prototype.restrictCamera = function (c, x, y, w, h) {
        // Left
        var px = this.pos.x + this.centerOff.x;
        if (px < x + c.width / 2) {
            if (this.centerOff.x < 0) {
                this.centerOff.x += (x + c.width / 2 - px);
            }
            if (this.centerOff.x >= 0) {
                this.centerOff.x = 0;
                this.pos.x = x + c.width / 2;
            }
        }
        // Right
        px = this.pos.x + this.centerOff.x;
        if (px > x + w - c.width / 2) {
            if (this.centerOff.x > 0) {
                this.centerOff.x -= (px - (x + w - c.width / 2));
            }
            if (this.centerOff.x <= 0) {
                this.centerOff.x = 0;
                this.pos.x = x + w - c.width / 2;
            }
        }
        // Top
        if (this.pos.y < y + c.height / 2) {
            this.pos.y = y + c.height / 2;
        }
        // Bottom
        if (this.pos.y > (y + h) - c.height / 2) {
            this.pos.y = (y + h) - c.height / 2;
        }
    };
    return Camera;
}());
export { Camera };
