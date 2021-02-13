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
import { ExistingObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";
var Particle = /** @class */ (function (_super) {
    __extends(Particle, _super);
    function Particle() {
        var _this = _super.call(this) || this;
        _this.exist = false;
        return _this;
    }
    Particle.prototype.spawn = function (x, y, speed, time, animSpeed, gravity, id) {
        if (gravity === void 0) { gravity = 0; }
        if (id === void 0) { id = 0; }
        this.pos = new Vector2(x, y);
        this.speed = speed.clone();
        this.gravity = gravity;
        this.timer = time;
        this.animSpeed = animSpeed;
        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, id);
        this.id = id;
        this.exist = true;
    };
    Particle.prototype.update = function (ev) {
        if (!this.exist)
            return;
        this.speed.y += this.gravity * ev.step;
        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
        if ((this.timer -= ev.step) <= 0) {
            this.exist = false;
        }
        this.spr.animate(this.id, 0, 3, this.animSpeed, ev.step);
    };
    Particle.prototype.draw = function (c) {
        if (!this.exist)
            return;
        c.drawSprite(this.spr, c.getBitmap("particles"), Math.round(this.pos.x) - 8, Math.round(this.pos.y) - 8);
    };
    return Particle;
}(ExistingObject));
export { Particle };
