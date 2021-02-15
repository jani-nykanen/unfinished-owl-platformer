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
import { Particle } from "./particle.js";
import { Sprite } from "./sprite.js";
import { nextObject } from "./util.js";
import { Vector2 } from "./vector.js";
var ENEMY_DEATH_TIME = 32;
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(x, y, id) {
        if (id === void 0) { id = 0; }
        var _this = _super.call(this, x, y) || this;
        _this.isDeactivated = function () { return (_this.dying || !_this.exist || !_this.inCamera); };
        _this.startPos = _this.pos.clone();
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
        _this.particles = new Array();
        _this.deathTime = 0;
        _this.canBeKnocked = true;
        _this.knockTimer = 0;
        _this.knockOffset = 0;
        _this.canBeStomped = true;
        return _this;
    }
    Enemy.prototype.updateAI = function (ev) { };
    Enemy.prototype.die = function (ev) {
        for (var _i = 0, _a = this.particles; _i < _a.length; _i++) {
            var p = _a[_i];
            p.update(ev);
        }
        return (this.deathTime -= ev.step) <= 0;
    };
    Enemy.prototype.updateLogic = function (ev) {
        var KNOCK_TIME = 120;
        var KNOCK_JUMP = -2.0;
        if (this.knockTimer > 0) {
            this.knockTimer -= ev.step;
            return;
        }
        if (this.canBeKnocked &&
            ev.isShaking() && this.canJump) {
            this.target.x = 0;
            this.speed.y = KNOCK_JUMP;
            this.knockTimer = KNOCK_TIME;
            return;
        }
        this.updateAI(ev);
        this.canJump = false;
        this.slopeFriction = 0;
    };
    Enemy.prototype.preDraw = function (c) {
        if (!this.exist || !this.dying)
            return;
        for (var _i = 0, _a = this.particles; _i < _a.length; _i++) {
            var p = _a[_i];
            p.draw(c);
        }
    };
    Enemy.prototype.draw = function (c) {
        if (this.isDeactivated())
            return;
        var bmp = c.getBitmap("enemies");
        var px = Math.round(this.pos.x) + this.renderOffset.x - this.spr.width / 2;
        var py = Math.round(this.pos.y) + this.renderOffset.y - this.spr.height / 2;
        var flip = this.flip;
        if (this.knockTimer > 0) {
            flip |= Flip.Vertical;
            py += this.center.y + this.knockOffset;
        }
        c.drawSprite(this.spr, bmp, px, py, flip);
    };
    Enemy.prototype.playerEvent = function (pl, ev) { };
    Enemy.prototype.spawnParticles = function (count, speedAmount, angleOffset) {
        if (angleOffset === void 0) { angleOffset = 0; }
        var ANIM_SPEED = 4.0;
        var angle;
        var speed;
        for (var i = 0; i < count; ++i) {
            angle = Math.PI * 2 / count * i + angleOffset;
            speed = new Vector2(Math.cos(angle) * speedAmount, Math.sin(angle) * speedAmount);
            nextObject(this.particles, Particle)
                .spawn(this.pos.x, this.pos.y, speed, ENEMY_DEATH_TIME - 1, ANIM_SPEED, 0, 1);
        }
    };
    Enemy.prototype.playerCollision = function (pl, ev) {
        var NEAR_MARGIN = 1;
        var FAR_MARGIN = 8;
        var STOMP_MARGIN_TIME = 8;
        var STOMP_MARGIN_H = 0.25;
        var STOMP_EPS = 0.1;
        if (this.isDeactivated() || pl.isDying())
            return false;
        this.playerEvent(pl, ev);
        // Stomp
        var top = this.pos.y + this.center.y - this.hitbox.y / 2;
        var hbox = pl.getHitbox();
        var px = pl.getPos().x;
        var py = pl.getBottom();
        var margin = this.hitbox.x * STOMP_MARGIN_H;
        if ((this.canBeStomped || this.knockTimer > 0) &&
            pl.getSpeed().y >= this.speed.y - STOMP_EPS &&
            px + hbox.x / 2 >= this.pos.x - this.hitbox.x / 2 - margin &&
            px - hbox.x / 2 < this.pos.x + this.hitbox.x / 2 + margin &&
            py >= top - NEAR_MARGIN * ev.step &&
            py < top + (FAR_MARGIN + Math.max(0, this.speed.y)) * ev.step) {
            if (!pl.isThumping())
                pl.setStompMargin(STOMP_MARGIN_TIME);
            this.dying = true;
            this.deathTime = ENEMY_DEATH_TIME;
            this.spawnParticles(6, 1.5);
            return true;
        }
        // Hurt player
        if (pl.canBeHurt() &&
            this.overlayObject(pl)) {
            pl.kill(ev);
            return true;
        }
        return false;
    };
    Enemy.prototype.enemyCollisionEvent = function (dirx, diry, ev) { };
    ;
    Enemy.prototype.enemyCollision = function (e, ev) {
        if (this.isDeactivated() || e.isDeactivated())
            return false;
        if (this.overlayObject(e)) {
            this.enemyCollisionEvent(Math.sign(e.pos.x - this.pos.x), Math.sign(e.pos.y - this.pos.y), ev);
            return true;
        }
        return false;
    };
    Enemy.prototype.slopeCollisionEvent = function (dir, friction, ev) {
        this.canJump = true;
        this.slopeFriction = friction;
    };
    return Enemy;
}(CollisionObject));
export { Enemy };
