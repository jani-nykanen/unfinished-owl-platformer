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
import { WeakGameObject } from "./gameobject.js";
import { Particle } from "./particle.js";
import { Sprite } from "./sprite.js";
import { nextObject } from "./util.js";
import { Vector2 } from "./vector.js";
var STAR_DEATH_TIME = 32;
var Star = /** @class */ (function (_super) {
    __extends(Star, _super);
    function Star(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.spr = new Sprite(24, 24);
        _this.hitbox = new Vector2(8, 20);
        _this.waveTimer = Math.random() * (Math.PI * 2);
        _this.deathTimer = 0;
        _this.particles = new Array();
        return _this;
    }
    Star.prototype.die = function (ev) {
        for (var _i = 0, _a = this.particles; _i < _a.length; _i++) {
            var p = _a[_i];
            p.update(ev);
        }
        return (this.deathTimer -= ev.step) <= 0;
    };
    Star.prototype.updateLogic = function (ev) {
        var ANIM_SPEED = 6;
        var WAVE_SPEED = 0.05;
        this.spr.animate(0, 0, 7, ANIM_SPEED, ev.step);
        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI * 2);
    };
    Star.prototype.draw = function (c) {
        var AMPLITUDE = 3;
        if (!this.exist || !this.inCamera)
            return;
        if (this.dying) {
            for (var _i = 0, _a = this.particles; _i < _a.length; _i++) {
                var p = _a[_i];
                p.draw(c);
            }
            return;
        }
        var yoff = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
        c.drawSprite(this.spr, c.getBitmap("star"), Math.round(this.pos.x) - 12, Math.round(this.pos.y) - 12 + yoff);
    };
    Star.prototype.spawnParticles = function (count, speedAmount, angleOffset) {
        if (angleOffset === void 0) { angleOffset = 0; }
        var BASE_JUMP = -0.5;
        var BASE_GRAVITY = 0.2;
        var angle;
        var speed;
        for (var i = 0; i < count; ++i) {
            angle = Math.PI * 2 / count * i + angleOffset;
            speed = new Vector2(Math.cos(angle) * speedAmount, Math.sin(angle) * speedAmount + BASE_JUMP * speedAmount);
            nextObject(this.particles, Particle)
                .spawn(this.pos.x, this.pos.y, speed, STAR_DEATH_TIME - 1, STAR_DEATH_TIME / 4, BASE_GRAVITY, 0);
        }
    };
    Star.prototype.playerCollision = function (pl, ev) {
        if (!this.exist || this.dying || !this.inCamera)
            return false;
        if (pl.overlayObject(this)) {
            this.spawnParticles(5, 3, -Math.PI / 10);
            this.dying = true;
            this.deathTimer = STAR_DEATH_TIME;
            pl.addStar();
            return true;
        }
        return false;
    };
    return Star;
}(WeakGameObject));
export { Star };
