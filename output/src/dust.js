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
var Dust = /** @class */ (function (_super) {
    __extends(Dust, _super);
    function Dust() {
        var _this = _super.call(this) || this;
        _this.exist = false;
        return _this;
    }
    Dust.prototype.spawn = function (x, y, speed, id) {
        if (id === void 0) { id = 0; }
        this.pos = new Vector2(x, y);
        this.spr = new Sprite(16, 16);
        this.speed = speed;
        this.id = id;
        this.exist = true;
    };
    Dust.prototype.update = function (ev) {
        if (!this.exist)
            return;
        this.spr.animate(this.id, 0, 4, this.speed, ev.step);
        if (this.spr.getColumn() == 4) {
            this.exist = false;
        }
    };
    Dust.prototype.draw = function (c) {
        if (!this.exist)
            return;
        var bmp = c.getBitmap("dust");
        var px = Math.round(this.pos.x) - this.spr.width / 2;
        var py = Math.round(this.pos.y) - this.spr.height / 2;
        c.drawSprite(this.spr, bmp, px, py);
    };
    return Dust;
}(ExistingObject));
export { Dust };
