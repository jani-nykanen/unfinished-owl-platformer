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
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(x, y, id) {
        if (id === void 0) { id = 0; }
        var _this = _super.call(this, x, y) || this;
        _this.id = id;
        _this.spr = new Sprite(24, 24);
        _this.spr.setFrame(0, id);
        // Default values, in the case I forgot to set them
        // separately for each enemy
        _this.friction = new Vector2(0.1, 0.1);
        _this.hitbox = new Vector2(16, 16);
        _this.collisionBox = _this.hitbox.clone();
        _this.renderOffset = new Vector2();
        _this.slopeFriction = 0;
        _this.canJump = false;
        return _this;
    }
    Enemy.prototype.updateAI = function (ev) { };
    Enemy.prototype.updateLogic = function (ev) {
        this.updateAI(ev);
        this.canJump = false;
        this.slopeFriction = 0;
    };
    Enemy.prototype.draw = function (c) {
        if (!this.exist || !this.inCamera)
            return false;
        var bmp = c.getBitmap("enemies");
        var px = Math.round(this.pos.x) + this.renderOffset.x - this.spr.width / 2;
        var py = Math.round(this.pos.y) + this.renderOffset.y - this.spr.height / 2;
        c.drawSprite(this.spr, bmp, px, py, this.flip);
    };
    Enemy.prototype.playerEvent = function (pl, ev) { };
    Enemy.prototype.playerCollision = function (pl, ev) {
        if (this.dying || !this.exist || !this.inCamera)
            return false;
        this.playerEvent(pl, ev);
        return false;
    };
    Enemy.prototype.slopeCollisionEvent = function (dir, friction, ev) {
        this.canJump = true;
        this.slopeFriction = friction;
    };
    return Enemy;
}(CollisionObject));
export { Enemy };
