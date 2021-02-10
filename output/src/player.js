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
import { State } from "./util.js";
import { Vector2 } from "./vector.js";
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.friction = new Vector2(0.15, 0.15);
        _this.hitbox = new Vector2(16, 16);
        _this.collisionBox = new Vector2(16, 16);
        _this.center = new Vector2();
        _this.inCamera = true;
        _this.canJump = false;
        _this.jumpTimer = 0;
        _this.jumpMargin = 0;
        _this.sprBody = new Sprite(32, 24);
        _this.sprFeet = new Sprite(16, 8);
        _this.eyePos = new Vector2();
        return _this;
    }
    Player.prototype.control = function (ev) {
        var BASE_GRAVITY = 4.0;
        var BASE_SPEED = 1.5;
        var JUMP_TIME = 15;
        this.target.x = ev.getStick().x * BASE_SPEED;
        this.target.y = BASE_GRAVITY;
        var s = ev.getAction("fire1");
        if (this.jumpMargin > 0 && s == State.Pressed) {
            this.jumpTimer = JUMP_TIME;
        }
        else if (this.jumpTimer > 0 && (s & State.DownOrPressed) == 0) {
            this.jumpTimer = 0;
        }
    };
    Player.prototype.animate = function (ev) {
        var EPS = 0.01;
        var speed;
        this.eyePos.x = 0;
        this.eyePos.y = 0;
        if (Math.abs(this.speed.x) >= 0.5) {
            this.eyePos.x = Math.sign(this.speed.x);
        }
        if (this.canJump) {
            if (Math.abs(this.speed.x) > EPS) {
                speed = 10 - Math.abs(this.speed.x) * 4;
                this.sprFeet.animate(3, 1, 4, speed, ev.step);
            }
            else {
                this.sprFeet.setFrame(0, 3);
            }
        }
        else {
            if (Math.abs(this.speed.y) >= 0.5) {
                this.eyePos.y = Math.sign(this.speed.y);
            }
        }
    };
    Player.prototype.updateTimers = function (ev) {
        var JUMP_SPEED = -3.0;
        if (this.jumpMargin > 0) {
            this.jumpMargin -= ev.step;
        }
        if (this.jumpTimer > 0) {
            this.jumpTimer -= ev.step;
            this.speed.y = JUMP_SPEED;
        }
    };
    Player.prototype.updateLogic = function (ev) {
        this.control(ev);
        this.animate(ev);
        this.updateTimers(ev);
        this.canJump = false;
    };
    Player.prototype.draw = function (c) {
        var px = Math.round(this.pos.x);
        var py = Math.round(this.pos.y);
        var bmp = c.getBitmap("owl");
        c.drawSprite(this.sprBody, bmp, px - 16, py - 16);
        c.drawSprite(this.sprFeet, bmp, px - 8, py + 1);
        px += this.eyePos.x;
        py += this.eyePos.y;
        c.setFillColor(0, 0, 0);
        c.fillRect(px - 3, py - 9, 2, 2);
        c.fillRect(px + 1, py - 9, 2, 2);
    };
    Player.prototype.slopeCollisionEvent = function (dir, ev) {
        var JUMP_MARGIN = 10;
        if (dir > 0) {
            this.canJump = true;
            this.jumpMargin = JUMP_MARGIN;
        }
        else {
            this.jumpTimer = 0;
        }
    };
    return Player;
}(CollisionObject));
export { Player };
