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
import { Sprite } from "./sprite.js";
import { boxOverlay, updateSpeedAxis } from "./util.js";
import { Vector2 } from "./vector.js";
var GameObject = /** @class */ (function () {
    function GameObject(x, y) {
        var _this = this;
        this.getPos = function () { return _this.pos.clone(); };
        this.getSpeed = function () { return _this.speed.clone(); };
        this.getTarget = function () { return _this.target.clone(); };
        this.isInCamera = function () { return _this.inCamera; };
        this.isDying = function () { return _this.dying; };
        this.doesExist = function () { return _this.exist; };
        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);
        this.center = new Vector2();
        this.hitbox = new Vector2();
        this.spr = new Sprite(0, 0);
        this.dying = false;
        this.inCamera = false;
        this.exist = true;
    }
    GameObject.prototype.die = function (ev) {
        return true;
    };
    GameObject.prototype.updateLogic = function (ev) { };
    GameObject.prototype.postUpdate = function (ev) { };
    GameObject.prototype.outsideCameraEvent = function () { };
    GameObject.prototype.updateMovement = function (ev) {
        this.speed.x = updateSpeedAxis(this.speed.x, this.target.x, this.friction.x * ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y, this.target.y, this.friction.y * ev.step);
        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    };
    GameObject.prototype.update = function (ev) {
        if (!this.exist || !this.inCamera)
            return;
        if (this.dying) {
            if (this.die(ev)) {
                this.exist = false;
                this.dying = false;
            }
            return;
        }
        this.oldPos = this.pos.clone();
        this.updateLogic(ev);
        this.updateMovement(ev);
        this.postUpdate(ev);
    };
    GameObject.prototype.stopMovement = function () {
        this.speed.zeros();
        this.target.zeros();
    };
    GameObject.prototype.cameraCheck = function (cam) {
        var view = cam.getViewport();
        var oldState = this.inCamera;
        this.inCamera = boxOverlay(this.pos, this.center, this.hitbox, view.x, view.y, view.w, view.h);
        if (oldState && !this.inCamera) {
            this.outsideCameraEvent();
        }
    };
    GameObject.prototype.overlayObject = function (o) {
        return boxOverlay(this.pos, this.center, this.hitbox, o.pos.x + o.center.x - o.hitbox.x / 2, o.pos.y + o.center.y - o.hitbox.y / 2, o.hitbox.x, o.hitbox.y);
    };
    GameObject.prototype.draw = function (c) { };
    GameObject.prototype.postDraw = function (c) { };
    return GameObject;
}());
export { GameObject };
var CollisionObject = /** @class */ (function (_super) {
    __extends(CollisionObject, _super);
    function CollisionObject(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.getHitbox = function () { return _this.hitbox.clone(); };
        _this.collisionsDisabled = function () { return _this.disableCollisions; };
        _this.collisionBox = new Vector2();
        _this.bounceFactor = 0;
        _this.disableCollisions = false;
        return _this;
    }
    CollisionObject.prototype.wallCollisionEvent = function (dir, ev) { };
    CollisionObject.prototype.slopeCollisionEvent = function (dir, friction, ev) { };
    CollisionObject.prototype.wallCollision = function (x, y, h, dir, ev, force) {
        if (force === void 0) { force = false; }
        var EPS = 0.001;
        var V_MARGIN = 1;
        var NEAR_MARGIN = 2;
        var FAR_MARGIN = 8;
        if (!this.inCamera ||
            (!force && this.disableCollisions) ||
            !this.exist || this.dying ||
            this.speed.x * dir < EPS)
            return false;
        var top = this.pos.y + this.center.y - this.collisionBox.y / 2;
        var bottom = top + this.collisionBox.y;
        if (bottom <= y + V_MARGIN || top >= y + h - V_MARGIN)
            return false;
        var xoff = this.center.x + this.collisionBox.x / 2 * dir;
        var nearOld = this.oldPos.x + xoff;
        var nearNew = this.pos.x + xoff;
        if ((dir > 0 && nearNew >= x - NEAR_MARGIN * ev.step &&
            nearOld <= x + (FAR_MARGIN + this.speed.x) * ev.step) ||
            (dir < 0 && nearNew <= x + NEAR_MARGIN * ev.step &&
                nearOld >= x - (FAR_MARGIN - this.speed.x) * ev.step)) {
            this.pos.x = x - xoff;
            this.speed.x *= -this.bounceFactor;
            this.wallCollisionEvent(dir, ev);
            return true;
        }
        return false;
    };
    CollisionObject.prototype.slopeCollision = function (x1, y1, x2, y2, dir, ev, force) {
        if (force === void 0) { force = false; }
        var EPS = 0.001;
        var NEAR_MARGIN = 2;
        var FAR_MARGIN = 8;
        if (!this.inCamera ||
            (!force && this.disableCollisions) ||
            !this.exist || this.dying ||
            this.speed.y * dir < EPS ||
            Math.abs(x1 - x2) < EPS)
            return false;
        if (this.pos.x < x1 || this.pos.x >= x2)
            return false;
        var k = (y2 - y1) / (x2 - x1);
        var y0 = y1 + k * (this.pos.x - x1);
        var py = this.pos.y + this.center.y + dir * this.collisionBox.y / 2;
        if ((dir > 0 && py > y0 - NEAR_MARGIN * ev.step &&
            py <= y0 + (this.speed.y + FAR_MARGIN) * ev.step) ||
            (dir < 0 && py < y0 + NEAR_MARGIN * ev.step &&
                py >= y0 + (this.speed.y - FAR_MARGIN) * ev.step)) {
            this.speed.y = 0;
            this.pos.y = y0 - this.center.y - dir * this.collisionBox.y / 2;
            this.slopeCollisionEvent(dir, -k, ev);
            return true;
        }
        return false;
    };
    CollisionObject.prototype.constantSlopeCollision = function (x, y, w, dir, leftMargin, rightMargin, ev) {
        if (leftMargin) {
            x -= this.collisionBox.x / 2;
            w += this.collisionBox.x / 2;
        }
        if (rightMargin) {
            w += this.collisionBox.x / 2;
        }
        return this.slopeCollision(x, y, x + w, y, dir, ev);
    };
    CollisionObject.prototype.hurtCollision = function (x, y, w, h, dmg, knockback, ev) {
        return false;
    };
    return CollisionObject;
}(GameObject));
export { CollisionObject };
