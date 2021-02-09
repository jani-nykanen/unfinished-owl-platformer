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
        this.updateTimers(ev);
        this.canJump = false;
    };
    Player.prototype.draw = function (c) {
        var px = Math.round(this.pos.x) - 8;
        var py = Math.round(this.pos.y) - 8;
        c.setFillColor(0, 0, 0);
        c.fillRect(px - 1, py - 1, 18, 18);
        c.setFillColor(255, 0, 0);
        c.fillRect(px, py, 16, 16);
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
