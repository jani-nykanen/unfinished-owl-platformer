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
var TEXT_TIME = 60;
var Checkpoint = /** @class */ (function (_super) {
    __extends(Checkpoint, _super);
    function Checkpoint(x, y, makeActive) {
        if (makeActive === void 0) { makeActive = false; }
        var _this = _super.call(this, x, y) || this;
        _this.textTimer = 0;
        // For checking if in camera 
        // (need more height because of the
        // wave animation)
        _this.spr = new Sprite(16, 24);
        // For animation
        _this.actualSprite = new Sprite(16, 16);
        _this.hitbox = new Vector2(12, 16);
        _this.waveTimer = Math.PI / 2;
        _this.active = makeActive;
        if (makeActive)
            _this.spr.setFrame(1, 0);
        return _this;
    }
    Checkpoint.prototype.outsideCameraEvent = function () {
        this.textTimer = 0;
    };
    Checkpoint.prototype.updateLogic = function (ev) {
        var ANIM_SPEED = 6;
        var WAVE_SPEED = 0.05;
        var STOP_TEXT_MOVEMENT = 40;
        var TEXT_SPEED = 2;
        if (!this.active)
            return;
        this.actualSprite.animate(0, 1, 5, ANIM_SPEED, ev.step);
        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI * 2);
        if (this.textTimer > 0) {
            if (this.textTimer > STOP_TEXT_MOVEMENT) {
                this.textPos -= TEXT_SPEED * ev.step;
            }
            this.textTimer -= ev.step;
        }
    };
    Checkpoint.prototype.draw = function (c) {
        var AMPLITUDE = 3;
        if (!this.exist || !this.inCamera)
            return;
        var yoff = 1;
        if (this.active)
            yoff = -4 + Math.round(Math.sin(this.waveTimer) * AMPLITUDE);
        c.drawSprite(this.actualSprite, c.getBitmap("checkpoint"), Math.round(this.pos.x) - 8, Math.round(this.pos.y) - 8 + yoff);
    };
    Checkpoint.prototype.postDraw = function (c) {
        if (!this.exist || this.textTimer <= 0)
            return;
        c.drawText(c.getBitmap("font"), "CHECKPOINT", this.pos.x, this.textPos, 0, 0, true);
    };
    Checkpoint.prototype.playerCollision = function (pl, ev) {
        if (!this.exist || this.dying || !this.inCamera || pl.isDying())
            return false;
        if (!this.active &&
            pl.overlayObject(this)) {
            this.active = true;
            pl.setCheckpoint(this.pos);
            this.textTimer = TEXT_TIME;
            this.textPos = this.pos.y - 8;
            return true;
        }
        if (this.active && pl.getCheckpointRef() != this.pos) {
            this.deactivate();
        }
        return false;
    };
    Checkpoint.prototype.deactivate = function () {
        this.active = false;
        this.actualSprite.setFrame(0, 0);
        this.waveTimer = Math.PI / 2;
    };
    return Checkpoint;
}(InteractionTarget));
export { Checkpoint };
