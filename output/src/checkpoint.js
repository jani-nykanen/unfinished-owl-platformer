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
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";
var Checkpoint = /** @class */ (function (_super) {
    __extends(Checkpoint, _super);
    function Checkpoint(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.spr = new Sprite(24, 24);
        _this.hitbox = new Vector2(8, 20);
        _this.waveTimer = Math.random() * (Math.PI * 2);
        _this.active = false;
        return _this;
    }
    Checkpoint.prototype.updateLogic = function (ev) {
        var ANIM_SPEED = 6;
        var WAVE_SPEED = 0.05;
        if (!this.active)
            return;
        this.spr.animate(0, 1, 5, ANIM_SPEED, ev.step);
        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI * 2);
    };
    Checkpoint.prototype.draw = function (c) {
        var AMPLITUDE = 3;
        if (!this.exist || !this.inCamera)
            return;
        var yoff = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
        c.drawSprite(this.spr, c.getBitmap("checkpoint"), Math.round(this.pos.x) - 12, Math.round(this.pos.y) - 12 + yoff);
    };
    Checkpoint.prototype.playerCollision = function (pl, ev) {
        if (!this.exist || this.dying || !this.inCamera)
            return false;
        if (pl.overlayObject(this)) {
            this.active = true;
            pl.setCheckPoint(this.pos);
            return true;
        }
        return false;
    };
    Checkpoint.prototype.deactivate = function () {
        this.active = false;
        this.spr.setFrame(0, 0);
        this.waveTimer = 0;
    };
    return Checkpoint;
}(InteractionTarget));
export { Checkpoint };
