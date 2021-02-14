var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { CollisionObject } from "./gameobject.js";
import { Vector2 } from "./vector.js";
var BodyPiece = /** @class */ (function (_super) {
    __extends(BodyPiece, _super);
    function BodyPiece() {
        var _this = _super.call(this, 0, 0) || this;
        _this.exist = false;
        _this.friction = new Vector2(0.01, 0.1);
        _this.collisionBox = new Vector2(4, 6);
        _this.bounceFactor = 0.75;
        return _this;
    }
    BodyPiece.prototype.outsideCameraEvent = function () {
        this.exist = false;
    };
    BodyPiece.prototype.spawn = function (x, y, speed) {
        var BASE_GRAVITY = 4.0;
        this.pos = new Vector2(x, y);
        this.speed = speed.clone();
        this.target = new Vector2(0, BASE_GRAVITY);
        this.exist = true;
        this.inCamera = true;
    };
    BodyPiece.prototype.draw = function (c) {
        if (!this.exist || !this.inCamera)
            return;
        c.drawBitmapRegion(c.getBitmap("pieces"), 0, 0, 16, 16, Math.round(this.pos.x) - 8, Math.round(this.pos.y) - 8);
    };
    BodyPiece.prototype.slopeCollisionEvent = function (dir, k, ev) {
        var EPS = 0.1;
        if (Math.abs(this.speed.y) < EPS)
            this.exist = false;
    };
    return BodyPiece;
}(CollisionObject));
export { BodyPiece };
