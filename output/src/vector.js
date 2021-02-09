var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        var _this = this;
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        this.length = function () { return Math.hypot(_this.x, _this.y); };
        this.clone = function () { return new Vector2(_this.x, _this.y); };
        this.x = x;
        this.y = y;
    }
    Vector2.prototype.normalize = function (forceUnit) {
        if (forceUnit === void 0) { forceUnit = false; }
        var EPS = 0.0001;
        var l = this.length();
        if (l < EPS) {
            this.x = forceUnit ? 1 : 0;
            this.y = 0;
            return this.clone();
        }
        this.x /= l;
        this.y /= l;
        return this.clone();
    };
    Vector2.prototype.zeros = function () {
        this.x = 0;
        this.y = 0;
    };
    Vector2.prototype.scalarMultiply = function (s) {
        this.x *= s;
        this.y *= s;
    };
    Vector2.dot = function (u, v) { return u.x * v.x + u.y * v.y; };
    Vector2.normalize = function (v, forceUnit) {
        if (forceUnit === void 0) { forceUnit = false; }
        return v.clone().normalize(forceUnit);
    };
    Vector2.scalarMultiply = function (v, s) { return new Vector2(v.x * s, v.y * s); };
    Vector2.distance = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
    Vector2.direction = function (a, b) { return (new Vector2(b.x - a.x, b.y - a.y)).normalize(true); };
    return Vector2;
}());
export { Vector2 };
var Rect = /** @class */ (function () {
    function Rect(x, y, w, h) {
        var _this = this;
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (w === void 0) { w = 0; }
        if (h === void 0) { h = 0; }
        this.clone = function () { return new Rect(_this.x, _this.y, _this.w, _this.h); };
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return Rect;
}());
export { Rect };
