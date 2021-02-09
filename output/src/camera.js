import { Rect, Vector2 } from "./vector.js";
var Camera = /** @class */ (function () {
    function Camera(x, y) {
        var _this = this;
        this.getViewport = function () { return _this.viewport.clone(); };
        this.pos = new Vector2(x, y);
        this.viewport = new Rect();
    }
    Camera.prototype.use = function (c) {
        this.viewport.w = c.width;
        this.viewport.h = c.height;
        this.viewport.x = this.pos.x - this.viewport.w / 2;
        this.viewport.y = this.pos.y - this.viewport.h / 2;
        c.moveTo(-this.viewport.x, -this.viewport.y);
    };
    return Camera;
}());
export { Camera };
