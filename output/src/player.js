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
import { BodyPiece } from "./bodypiece.js";
import { Flip } from "./canvas.js";
import { Dust } from "./dust.js";
import { CollisionObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { computeFriction, nextObject, State } from "./util.js";
import { Vector2 } from "./vector.js";
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(x, y, state) {
        var _this = _super.call(this, x, y) || this;
        _this.isThumping = function () { return _this.thumping; };
        _this.canBeHurt = function () { return _this.hurtTimer <= 0; };
        _this.checkpoint = _this.pos.clone();
        _this.friction = new Vector2(0.125, 0.125);
        _this.hitbox = new Vector2(16, 16);
        _this.collisionBox = new Vector2(12, 16);
        _this.spinHitbox = new Vector2(28, _this.hitbox.y / 2);
        _this.center = new Vector2();
        _this.inCamera = true;
        _this.canJump = false;
        _this.doubleJump = false;
        _this.jumpTimer = 0;
        _this.jumpMargin = 0;
        _this.stompMargin = 0;
        _this.spr = new Sprite(24, 24);
        _this.sprBody = new Sprite(24, 24);
        _this.sprFeet = new Sprite(16, 8);
        _this.sprWing = new Sprite(12, 24);
        _this.eyePos = new Vector2();
        _this.dust = new Array();
        _this.dustTimer = 0;
        _this.pieces = new Array();
        _this.thumping = false;
        _this.thumpWait = 0;
        _this.hurtTimer = 0;
        _this.respawning = false;
        _this.spinning = false;
        _this.spinCount = 0;
        _this.canSpin = true;
        _this.flip = Flip.None;
        _this.state = state;
        return _this;
    }
    Player.prototype.respawn = function () {
        this.dying = false;
        this.stopMovement();
        this.thumping = false;
        this.inCamera = true;
        this.canJump = false;
        this.doubleJump = false;
        this.jumpTimer = 0;
        this.jumpMargin = 0;
        this.stompMargin = 0;
    };
    Player.prototype.die = function (ev) {
        var NEAR = 4.0;
        var RETURN_SPEED_MIN = 2.0;
        var HURT_TIME = 90.0;
        var FLAP_SPEED = 6;
        var REFORM_TIME = 8;
        this.updatePieces(ev);
        for (var _i = 0, _a = this.dust; _i < _a.length; _i++) {
            var d = _a[_i];
            d.update(ev);
        }
        if (this.respawning) {
            this.spr.animate(4, 0, 4, REFORM_TIME, ev.step);
            if (this.spr.getColumn() == 4) {
                this.respawn();
                this.respawning = false;
                this.hurtTimer = HURT_TIME;
            }
            return false;
        }
        var dir = new Vector2(this.checkpoint.x - this.pos.x, this.checkpoint.y - this.pos.y);
        var speed = Math.max(RETURN_SPEED_MIN, dir.length() / 64);
        this.target = Vector2.scalarMultiply(Vector2.normalize(dir), speed);
        this.updateMovement(ev);
        this.spr.animate(3, 0, 3, FLAP_SPEED, ev.step);
        if (dir.length() < NEAR) {
            this.respawning = true;
            this.stopMovement();
            this.pos = this.checkpoint.clone();
            this.spr.setFrame(0, 4);
        }
        return false;
    };
    Player.prototype.updatePieces = function (ev) {
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var p = _a[_i];
            p.update(ev);
        }
    };
    Player.prototype.control = function (ev) {
        var THUMP_EPS = 0.5;
        var BASE_GRAVITY = 3.0;
        var BASE_SPEED = 1.25;
        var JUMP_TIME = 15;
        var DJUMP_TIME = 60;
        var STOMP_BONUS = 8;
        var THUMP_TARGET = 8.0;
        var THUMP_JUMP = -3.0;
        var BASE_Y_FRICTION = 0.125;
        var THUMP_Y_FRICTION = 0.5;
        var SPIN_GRAVITY = 0.5;
        this.friction.y = BASE_Y_FRICTION;
        if (this.thumping) {
            this.friction.y = THUMP_Y_FRICTION;
            this.target.x = 0;
            this.target.y = THUMP_TARGET;
            return;
        }
        this.target.x = ev.getStick().x * BASE_SPEED;
        this.target.y = this.spinning ? SPIN_GRAVITY : BASE_GRAVITY;
        // Spin
        var s = ev.getAction("fire2");
        if (this.canSpin &&
            !this.spinning && s == State.Pressed) {
            this.canSpin = false;
            this.spinning = true;
            this.spinCount = 0;
            this.spr.setFrame(0, 5);
            this.flip = this.target.x <= 0.0 ? Flip.Horizontal : Flip.None;
        }
        else if (this.spinning && this.spinCount > 0 &&
            (s & State.DownOrPressed) != 1) {
            this.spinning = false;
            this.spinCount = 0;
        }
        s = ev.getAction("fire1");
        var canDoDoubleJump = this.jumpMargin <= 0 && !this.doubleJump;
        // Thump
        if (!this.spinning &&
            !this.canJump &&
            ev.getStick().y > THUMP_EPS) {
            this.speed.y = THUMP_JUMP;
            this.thumping = true;
            this.thumpWait = 0;
            return;
        }
        // Stomp jump
        if (this.stompMargin > 0 && (s & State.DownOrPressed) == 1) {
            this.jumpTimer = this.stompMargin + STOMP_BONUS;
            this.stompMargin = 0;
            this.jumpMargin = 0;
        }
        // Normal & double jump
        else if ((this.jumpMargin > 0 || canDoDoubleJump) &&
            s == State.Pressed) {
            if (canDoDoubleJump) {
                this.speed.y = Math.max(this.speed.y, 0);
                this.doubleJump = true;
                this.canSpin = true;
            }
            this.jumpTimer = canDoDoubleJump ? DJUMP_TIME : JUMP_TIME;
            this.jumpMargin = 0;
        }
        else if (this.jumpTimer > 0 && (s & State.DownOrPressed) == 0) {
            this.jumpTimer = 0;
        }
        this.target.x = computeFriction(this.target.x, this.slopeFriction);
    };
    Player.prototype.animate = function (ev) {
        var EPS = 0.01;
        var SPIN_SPEED = 2;
        var SPIN_MAX = 2;
        var speed;
        var bodyFrame;
        var wingFrame;
        this.eyePos.x = 0;
        this.eyePos.y = 0;
        var oldFrame = this.spr.getColumn();
        if (this.spinning) {
            this.spr.animate(5, 0, 7, SPIN_SPEED, ev.step);
            if (oldFrame > this.spr.getColumn()) {
                if ((++this.spinCount) >= SPIN_MAX) {
                    this.spinning = false;
                    this.spinCount = 0;
                }
            }
            if (this.spinning)
                return;
        }
        if (this.thumping) {
            this.sprBody.setFrame(0, 0);
            this.sprFeet.setFrame(1, 7);
            this.sprWing.setFrame(1, 1);
            this.flip = Flip.Vertical;
            return;
        }
        this.flip = Flip.None;
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
    Player.prototype.updateDust = function (ev) {
        var DUST_TIME = 8;
        var DUST_SPEED = 8;
        var DUST_OFFSET = 4;
        var EPS = 0.1;
        for (var _i = 0, _a = this.dust; _i < _a.length; _i++) {
            var d = _a[_i];
            d.update(ev);
        }
        if (!this.canJump || Math.abs(this.speed.x) <= EPS) {
            this.dustTimer = 0;
            return;
        }
        if ((this.dustTimer += ev.step) >= DUST_TIME) {
            nextObject(this.dust, Dust)
                .spawn(this.pos.x - Math.sign(this.speed.x) * DUST_OFFSET, this.pos.y + 6, DUST_SPEED);
            this.dustTimer -= DUST_TIME;
        }
    };
    Player.prototype.updateTimers = function (ev) {
        var JUMP_SPEED = -2.5;
        var DOUBLE_JUMP_SPEED = -0.225;
        var DOUBLE_JUMP_MIN_SPEED = -1.5;
        if (this.hurtTimer > 0) {
            this.hurtTimer -= ev.step;
        }
        if (this.jumpMargin > 0) {
            this.jumpMargin -= ev.step;
        }
        if (this.jumpTimer > 0 || this.stompMargin > 0) {
            if (this.jumpTimer > 0)
                this.jumpTimer -= ev.step;
            if (this.stompMargin > 0)
                this.stompMargin -= ev.step;
            if (this.doubleJump)
                this.speed.y = Math.max(DOUBLE_JUMP_MIN_SPEED, this.speed.y + DOUBLE_JUMP_SPEED * ev.step);
            else
                this.speed.y = JUMP_SPEED;
        }
        if (this.thumping && this.thumpWait > 0) {
            if ((this.thumpWait -= ev.step) <= 0) {
                this.thumping = false;
            }
        }
    };
    Player.prototype.updateLogic = function (ev) {
        this.control(ev);
        this.animate(ev);
        this.updateTimers(ev);
        this.updateDust(ev);
        this.updatePieces(ev);
        this.canJump = false;
        this.slopeFriction = 0;
    };
    Player.prototype.specialCameraCheck = function (cam) {
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var p = _a[_i];
            p.cameraCheck(cam);
        }
    };
    Player.prototype.bodypieceCollisions = function (stage, ev) {
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var p = _a[_i];
            stage.objectCollisions(p, ev);
        }
    };
    Player.prototype.preDraw = function (c) {
        for (var _i = 0, _a = this.dust; _i < _a.length; _i++) {
            var d = _a[_i];
            d.draw(c);
        }
    };
    Player.prototype.draw = function (c) {
        var bmp = c.getBitmap("owl");
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var p = _a[_i];
            p.draw(c);
        }
        if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 4) % 2 == 0)
            return;
        var px = Math.round(this.pos.x);
        var py = Math.round(this.pos.y);
        if (this.dying) {
            c.drawSprite(this.spr, bmp, px - 12, py - 15, this.flip);
            return;
        }
        if (this.spinning) {
            c.drawSprite(this.spr, bmp, px - 12, py - 15, this.flip);
            return;
        }
        if (this.flip == Flip.Vertical) {
            py += 4;
        }
        // Wings
        c.drawSprite(this.sprWing, bmp, px - 16, py - 16, this.flip);
        c.drawSprite(this.sprWing, bmp, px + 4, py - 16, Flip.Horizontal | this.flip);
        // Body
        c.drawSprite(this.sprBody, bmp, px - 12, py - 16, this.flip);
        // Feet
        var feetPos = py;
        if (this.flip == Flip.Vertical) {
            feetPos -= 18;
        }
        c.drawSprite(this.sprFeet, bmp, px - 8, feetPos + 1, this.flip);
        px += this.eyePos.x;
        py += this.eyePos.y;
        if (this.flip == Flip.Vertical) {
            py += 8;
        }
        // Eyes
        // TODO: "Flip" if horizontal flip
        c.setFillColor(0, 0, 0);
        c.fillRect(px - 3, py - 9, 2, 2);
        c.fillRect(px + 1, py - 9, 2, 2);
    };
    Player.prototype.slopeCollisionEvent = function (dir, friction, ev) {
        var JUMP_MARGIN = 12;
        var THUMP_WAIT = 30;
        if (dir > 0) {
            this.canJump = true;
            this.jumpTimer = 0;
            this.stompMargin = 0;
            this.doubleJump = false;
            this.jumpMargin = JUMP_MARGIN;
            this.slopeFriction = friction;
            if (this.thumping && this.thumpWait <= 0) {
                this.thumpWait = THUMP_WAIT;
                ev.shake(30, 4);
            }
            this.canSpin = true;
        }
        else {
            this.jumpTimer = 0;
            this.stompMargin = 0;
        }
    };
    Player.prototype.setPosition = function (x, y) {
        this.pos = new Vector2(x, y);
        this.checkpoint = this.pos.clone();
        this.oldPos = this.pos.clone();
    };
    Player.prototype.addStar = function () {
        this.state.addStar();
    };
    Player.prototype.getBottom = function () {
        return this.pos.y + this.center.y + this.hitbox.y / 2;
    };
    Player.prototype.setStompMargin = function (time) {
        this.stompMargin = time;
        this.jumpTimer = 0;
        this.doubleJump = false;
        this.canSpin = true;
    };
    Player.prototype.setCheckpoint = function (p) {
        // NOTE: we do not clone p
        this.checkpoint = p;
    };
    Player.prototype.getCheckpointRef = function () {
        return this.checkpoint;
    };
    Player.prototype.spawnPieces = function (count, angleOffset, speedAmount) {
        var BASE_SPEED = 1.0;
        var BASE_JUMP = -1.5;
        var angle;
        var speed;
        for (var i = 0; i < count; ++i) {
            angle = Math.PI * 2 / count * i + angleOffset;
            speed = new Vector2(Math.cos(angle) * BASE_SPEED * speedAmount, (Math.sin(angle) * BASE_SPEED + BASE_JUMP) * speedAmount);
            nextObject(this.pieces, BodyPiece)
                .spawn(this.pos.x, this.pos.y, speed);
        }
    };
    Player.prototype.kill = function (ev) {
        var ESCAPE_SPEED = 3.0;
        if (this.dying)
            return;
        this.spawnPieces(6, 0, 1.5);
        this.dying = true;
        this.stopMovement();
        this.flip = Flip.None;
        var dir = new Vector2(this.checkpoint.x - this.pos.x, this.checkpoint.y - this.pos.y);
        dir.normalize();
        this.speed = Vector2.scalarMultiply(dir, -ESCAPE_SPEED);
    };
    Player.prototype.doesCollideSpinning = function (o) {
        if (!this.spinning)
            return false;
        var hbox = this.hitbox;
        this.hitbox = this.spinHitbox;
        var ret = this.spinning && this.overlayObject(o);
        this.hitbox = hbox;
        return ret;
    };
    return Player;
}(CollisionObject));
export { Player };
