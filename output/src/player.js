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
import { State } from "./util.js";
import { Vector2 } from "./vector.js";
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.friction = new Vector2(0.125, 0.125);
        _this.hitbox = new Vector2(16, 16);
        _this.collisionBox = new Vector2(12, 16);
        _this.center = new Vector2();
        _this.inCamera = true;
        _this.canJump = false;
        _this.doubleJump = false;
        _this.jumpTimer = 0;
        _this.jumpMargin = 0;
        _this.sprBody = new Sprite(24, 24);
        _this.sprFeet = new Sprite(16, 8);
        _this.sprWing = new Sprite(12, 24);
        _this.eyePos = new Vector2();
        return _this;
    }
    Player.prototype.control = function (ev) {
        var BASE_GRAVITY = 3.0;
        var BASE_SPEED = 1.25;
        var JUMP_TIME = 15;
        var DJUMP_TIME = 60;
        this.target.x = ev.getStick().x * BASE_SPEED;
        this.target.y = BASE_GRAVITY;
        var s = ev.getAction("fire1");
        var canDoDoubleJump = this.jumpMargin <= 0 && !this.doubleJump;
        if ((this.jumpMargin > 0 || canDoDoubleJump) &&
            s == State.Pressed) {
            this.jumpTimer = canDoDoubleJump ? DJUMP_TIME : JUMP_TIME;
            if (canDoDoubleJump) {
                this.speed.y = Math.max(this.speed.y, 0);
                this.doubleJump = true;
            }
        }
        else if (this.jumpTimer > 0 && (s & State.DownOrPressed) == 0) {
            this.jumpTimer = 0;
        }
        // Not quite working yet
        if (this.slopeFriction > 0 &&
            Math.sign(this.target.x) != Math.sign(this.slopeFriction)) {
            //this.target.x *= 1.0 - 0.5 * Math.abs(this.slopeFriction);
        }
    };
    Player.prototype.animate = function (ev) {
        var EPS = 0.01;
        var speed;
        var bodyFrame;
        var wingFrame;
        this.eyePos.x = 0;
        this.eyePos.y = 0;
        if (Math.abs(this.speed.x) >= 0.5) {
            this.eyePos.x = Math.sign(this.speed.x);
        }
        if (this.canJump) {
            if (Math.abs(this.speed.x) > EPS) {
                speed = 10 - Math.abs(this.speed.x) * 4;
                this.sprFeet.animate(6, 1, 4, speed, ev.step);
            }
            else {
                this.sprFeet.setFrame(0, 6);
            }
            this.sprBody.setFrame(0, 0);
            this.sprWing.setFrame(0, 1);
        }
        else {
            bodyFrame = 0;
            wingFrame = 2;
            if (Math.abs(this.speed.y) >= 0.5) {
                this.eyePos.y = Math.sign(this.speed.y) * 2;
                bodyFrame = this.speed.y < 0 ? 1 : 2;
                wingFrame = this.speed.y < 0 ? 1 : 3;
            }
            this.sprBody.setFrame(bodyFrame, 0);
            this.sprFeet.setFrame(bodyFrame, 7);
            if (!this.doubleJump || this.jumpTimer <= 0) {
                this.sprWing.setFrame(wingFrame, 1);
            }
            else {
                this.sprWing.animate(1, 1, 4, 4, ev.step);
            }
        }
    };
    Player.prototype.updateTimers = function (ev) {
        var JUMP_SPEED = -2.5;
        var DOUBLE_JUMP_SPEED = -0.225;
        var DOUBLE_JUMP_MIN_SPEED = -1.5;
        if (this.jumpMargin > 0) {
            this.jumpMargin -= ev.step;
        }
        if (this.jumpTimer > 0) {
            this.jumpTimer -= ev.step;
            if (this.doubleJump)
                this.speed.y = Math.max(DOUBLE_JUMP_MIN_SPEED, this.speed.y + DOUBLE_JUMP_SPEED * ev.step);
            else
                this.speed.y = JUMP_SPEED;
        }
    };
    Player.prototype.updateLogic = function (ev) {
        this.control(ev);
        this.animate(ev);
        this.updateTimers(ev);
        this.canJump = false;
        this.slopeFriction = 0;
    };
    Player.prototype.draw = function (c) {
        var px = Math.round(this.pos.x);
        var py = Math.round(this.pos.y);
        var bmp = c.getBitmap("owl");
        // Wings
        c.drawSprite(this.sprWing, bmp, px - 16, py - 16);
        c.drawSprite(this.sprWing, bmp, px + 4, py - 16, Flip.Horizontal);
        // Body
        c.drawSprite(this.sprBody, bmp, px - 12, py - 16);
        // Feet
        c.drawSprite(this.sprFeet, bmp, px - 8, py + 1);
        px += this.eyePos.x;
        py += this.eyePos.y;
        // Eyes
        c.setFillColor(0, 0, 0);
        c.fillRect(px - 3, py - 9, 2, 2);
        c.fillRect(px + 1, py - 9, 2, 2);
    };
    Player.prototype.slopeCollisionEvent = function (dir, friction, ev) {
        var JUMP_MARGIN = 12;
        if (dir > 0) {
            this.canJump = true;
            this.jumpTimer = 0;
            this.doubleJump = false;
            this.jumpMargin = JUMP_MARGIN;
            this.slopeFriction = friction;
        }
        else {
            this.jumpTimer = 0;
        }
    };
    return Player;
}(CollisionObject));
export { Player };
