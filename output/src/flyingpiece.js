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
import { Flip } from "./canvas.js";
import { CollisionObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";
var FlyingPiece = /** @class */ (function (_super) {
    __extends(FlyingPiece, _super);
    function FlyingPiece() {
        var _this = _super.call(this, 0, 0) || this;
        _this.exist = false;
        _this.friction = new Vector2(0.01, 0.1);
        _this.collisionBox = new Vector2(4, 8);
        _this.spr = new Sprite(16, 16);
        _this.spr.setFrame(0, 0);
        _this.bounceFactor = 0.90;
        _this.animate = false;
        return _this;
    }
    FlyingPiece.prototype.outsideCameraEvent = function () {
        this.exist = false;
    };
    FlyingPiece.prototype.spawn = function (x, y, speed, row, frame) {
        if (row === void 0) { row = 0; }
        if (frame === void 0) { frame = -1; }
        var BASE_GRAVITY = 4.0;
        this.pos = new Vector2(x, y);
        this.speed = speed.clone();
        this.target = new Vector2(0, BASE_GRAVITY);
        this.exist = true;
        this.inCamera = true;
        this.animate = frame < 0;
        this.spr.setFrame(Math.max(0, frame), row);
    };
    FlyingPiece.prototype.updateLogic = function (ev) {
        var speed = 12 - 6 * Math.abs(this.speed.x);
        if (this.animate)
            this.spr.animate(this.spr.getRow(), 0, 3, speed, ev.step);
    };
    FlyingPiece.prototype.draw = function (c) {
        if (!this.exist || !this.inCamera)
            return;
        var flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;
        c.drawSprite(this.spr, c.getBitmap("pieces"), Math.round(this.pos.x) - 8, Math.round(this.pos.y) - 8, flip);
    };
    FlyingPiece.prototype.slopeCollisionEvent = function (dir, k, ev) {
        var EPS = 0.1;
        if (Math.abs(this.speed.y) < EPS &&
            Math.abs(this.speed.x) < EPS)
            this.exist = false;
    };
    return FlyingPiece;
}(CollisionObject));
export { FlyingPiece };
