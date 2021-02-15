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
import { Enemy } from "./enemy.js";
import { computeFriction } from "./util.js";
import { Vector2 } from "./vector.js";
export var getEnemyType = function (id) {
    return [Turtle, SpikedTurtle, Mushroom, Apple][id];
};
var Turtle = /** @class */ (function (_super) {
    __extends(Turtle, _super);
    function Turtle(x, y) {
        var _this = this;
        var BASE_GRAVITY = 4.0;
        _this = _super.call(this, x, y, 0) || this;
        _this.dir = (-1 + 2 * ((x / 16 | 0) % 2));
        _this.target.y = BASE_GRAVITY;
        _this.hitbox = new Vector2(14, 12);
        _this.collisionBox = new Vector2(8, 10);
        _this.center.y = 4;
        _this.knockOffset = 1;
        _this.oldCanJump = false;
        return _this;
    }
    Turtle.prototype.updateAI = function (ev) {
        var BASE_SPEED = 0.25;
        if (!this.canJump && this.oldCanJump) {
            this.dir *= -1;
        }
        this.target.x = computeFriction(this.dir * BASE_SPEED, this.slopeFriction);
        this.speed.x = this.target.x;
        if (this.canJump) {
            this.spr.animate(this.id, 0, 3, 6, ev.step);
        }
        this.flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;
        this.oldCanJump = this.canJump;
    };
    Turtle.prototype.wallCollisionEvent = function (dir, ev) {
        this.dir = -dir;
    };
    Turtle.prototype.enemyCollisionEvent = function (dirx, diry, ev) {
        if (dirx != 0)
            this.dir = -dirx;
    };
    return Turtle;
}(Enemy));
export { Turtle };
var SpikedTurtle = /** @class */ (function (_super) {
    __extends(SpikedTurtle, _super);
    function SpikedTurtle(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.id = 1;
        _this.spr.setFrame(0, 1);
        _this.canBeStomped = false;
        return _this;
    }
    return SpikedTurtle;
}(Turtle));
export { SpikedTurtle };
var Mushroom = /** @class */ (function (_super) {
    __extends(Mushroom, _super);
    function Mushroom(x, y) {
        var _this = this;
        var BASE_GRAVITY = 4.0;
        _this = _super.call(this, x, y, 2) || this;
        _this.target.y = BASE_GRAVITY;
        _this.friction.y = 0.1;
        _this.jumpTimer = Mushroom.JUMP_TIME +
            (Mushroom.JUMP_TIME / 2) * (((x / 16) | 0) % 2);
        _this.collisionBox = new Vector2(10, 10);
        _this.hitbox = new Vector2(16, 16);
        _this.center.y = 4;
        _this.renderOffset.y = -2;
        _this.knockOffset = 1;
        _this.canBeStomped = true;
        return _this;
    }
    Mushroom.prototype.updateAI = function (ev) {
        var JUMP_HEIGHT = -3.0;
        var EPS = 0.5;
        var frame;
        if (this.canJump) {
            this.spr.setFrame(0, this.id);
            if ((this.jumpTimer -= ev.step) <= 0) {
                this.speed.y = JUMP_HEIGHT;
                this.jumpTimer += Mushroom.JUMP_TIME;
                this.spr.setFrame(1, this.id);
            }
        }
        else {
            frame = 0;
            if (this.speed.y < -EPS)
                frame = 1;
            else if (this.speed.y > EPS)
                frame = 2;
            this.spr.setFrame(frame, this.id);
        }
    };
    Mushroom.prototype.playerEvent = function (pl, ev) {
        this.flip = pl.getPos().x > this.pos.x ? Flip.Horizontal : Flip.None;
    };
    Mushroom.JUMP_TIME = 60;
    return Mushroom;
}(Enemy));
export { Mushroom };
var Apple = /** @class */ (function (_super) {
    __extends(Apple, _super);
    function Apple(x, y) {
        var _this = _super.call(this, x, y, 3) || this;
        _this.hitbox = new Vector2(16, 16);
        _this.collisionBox = new Vector2(10, 10);
        _this.center.y = 4;
        _this.canBeKnocked = false;
        _this.waveTimer = 0;
        _this.dir = 0;
        return _this;
    }
    Apple.prototype.updateAI = function (ev) {
        var AMPLITUDE = 4;
        var BASE_SPEED = 0.25;
        var WAVE_SPEED = 0.05;
        this.target.x = this.dir * BASE_SPEED;
        this.speed.x = this.target.x;
        this.spr.animate(this.id, 0, 3, 4, ev.step);
        this.flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;
        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI * 2);
        this.pos.y = this.startPos.y + Math.sin(this.waveTimer) * AMPLITUDE;
    };
    Apple.prototype.wallCollisionEvent = function (dir, ev) {
        this.dir = -dir;
    };
    Apple.prototype.enemyCollisionEvent = function (dirx, diry, ev) {
        if (dirx != 0)
            this.dir = -dirx;
    };
    Apple.prototype.playerEvent = function (pl, ev) {
        if (!this.dirDetermined) {
            // We do not use Math.sign here since the value 0
            // is not accepted here
            this.dir = pl.getPos().x > this.pos.x ? 1 : -1;
            this.dirDetermined = true;
        }
    };
    return Apple;
}(Enemy));
export { Apple };
