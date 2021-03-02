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
import { GameObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";
var FollowerFly = /** @class */ (function (_super) {
    __extends(FollowerFly, _super);
    function FollowerFly(x, y, followedObject, triggerDistance) {
        var _this = _super.call(this, x, y) || this;
        _this.followedObject = followedObject;
        _this.exist = true;
        _this.friction = new Vector2(0.1, 0.1);
        _this.computeDistanceToTarget();
        _this.triggerDistance = triggerDistance;
        _this.spr = new Sprite(16, 16);
        _this.inCamera = true;
        _this.waveTimer = 0;
        return _this;
    }
    FollowerFly.prototype.computeDistanceToTarget = function () {
        this.distanceToObject = Vector2.distance(this.pos, this.followedObject.getPos());
    };
    FollowerFly.prototype.updateLogic = function (ev) {
        var SPEED_MOD = 16.0;
        var ANIM_SPEED = 3;
        var WAVE_SPEED = 0.1;
        this.computeDistanceToTarget();
        var speed;
        if (this.distanceToObject > this.triggerDistance) {
            speed = (this.distanceToObject - this.triggerDistance) / SPEED_MOD;
            this.target = Vector2.scalarMultiply(Vector2.direction(this.pos, this.followedObject.getPos()), speed);
        }
        else {
            this.target.zeros();
        }
        this.spr.animate(0, 0, 3, ANIM_SPEED, ev.step);
        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI * 2);
    };
    FollowerFly.prototype.draw = function (c) {
        var AMPLITUDE = 2;
        if (!this.exist || !this.inCamera)
            return;
        var jump = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
        c.drawSprite(this.spr, c.getBitmap("fly"), Math.round(this.pos.x) - 8, Math.round(this.pos.y) - 8 + jump);
    };
    FollowerFly.prototype.setPos = function (x, y) {
        this.pos = new Vector2(x, y);
    };
    return FollowerFly;
}(GameObject));
export { FollowerFly };
