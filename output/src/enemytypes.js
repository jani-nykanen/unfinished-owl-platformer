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
    return [Turtle][id];
};
var Turtle = /** @class */ (function (_super) {
    __extends(Turtle, _super);
    function Turtle(x, y) {
        var _this = this;
        var BASE_GRAVITY = 4.0;
        _this = _super.call(this, x, y, 0) || this;
        _this.dir = (-1 + 2 * ((x / 16 | 0) % 2));
        _this.target.y = BASE_GRAVITY;
        _this.hitbox = new Vector2(16, 12);
        _this.collisionBox = new Vector2(14, 10);
        _this.center.y = 4;
        return _this;
    }
    Turtle.prototype.updateAI = function (ev) {
        var BASE_SPEED = 0.25;
        this.target.x = computeFriction(this.dir * BASE_SPEED, this.slopeFriction);
        this.speed.x = this.target.x;
        this.spr.animate(this.id, 0, 3, 6, ev.step);
        this.flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;
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
