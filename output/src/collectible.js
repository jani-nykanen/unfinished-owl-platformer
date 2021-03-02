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
import { InteractionTarget } from "./interactiontarget.js";
import { Particle } from "./particle.js";
import { Sprite } from "./sprite.js";
import { nextObject } from "./util.js";
import { Vector2 } from "./vector.js";
var COLLECTIBLE_DEATH_TIME = 32;
var Collectible = /** @class */ (function (_super) {
    __extends(Collectible, _super);
    function Collectible(x, y, id) {
        if (id === void 0) { id = 0; }
        var _this = _super.call(this, x, y) || this;
        _this.spr = new Sprite(24, 24);
        _this.spr.setFrame(0, id);
        _this.hitbox = new Vector2(8, 20);
        _this.waveTimer = Math.random() * (Math.PI * 2);
        _this.deathTimer = 0;
        _this.particles = new Array();
        _this.id = id;
        return _this;
    }
    Collectible.prototype.die = function (ev) {
        for (var _i = 0, _a = this.particles; _i < _a.length; _i++) {
            var p = _a[_i];
            p.update(ev);
        }
        return (this.deathTimer -= ev.step) <= 0;
    };
    Collectible.prototype.updateLogic = function (ev) {
        var ANIM_SPEED = 6;
        var WAVE_SPEED = 0.05;
        this.spr.animate(this.spr.getRow(), 0, 7, ANIM_SPEED, ev.step);
        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI * 2);
    };
    Collectible.prototype.draw = function (c) {
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
    Collectible.prototype.spawnParticles = function (count, speedAmount, angleOffset) {
        if (angleOffset === void 0) { angleOffset = 0; }
        var BASE_JUMP = -0.5;
        var BASE_GRAVITY = 0.2;
        var angle;
        var speed;
        for (var i = 0; i < count; ++i) {
            angle = Math.PI * 2 / count * i + angleOffset;
            speed = new Vector2(Math.cos(angle) * speedAmount, Math.sin(angle) * speedAmount + BASE_JUMP * speedAmount);
            nextObject(this.particles, Particle)
                .spawn(this.pos.x, this.pos.y, speed, COLLECTIBLE_DEATH_TIME - 1, COLLECTIBLE_DEATH_TIME / 4, BASE_GRAVITY, 0);
        }
    };
    Collectible.prototype.playerCollision = function (pl, ev) {
        if (!this.exist || this.dying || !this.inCamera || pl.isDying())
            return false;
        if (pl.overlayObject(this)) {
            this.spawnParticles(5, 3, -Math.PI / 10);
            this.dying = true;
            this.deathTimer = COLLECTIBLE_DEATH_TIME;
            pl.addCollectable(this.id);
            return true;
        }
        return false;
    };
    return Collectible;
}(InteractionTarget));
export { Collectible };
