import { Player } from "./player.js";
import { Star } from "./star.js";
var ObjectManager = /** @class */ (function () {
    function ObjectManager(state) {
        this.player = new Player(128, 96, state);
        this.stars = new Array();
    }
    ObjectManager.prototype.update = function (cam, stage, ev) {
        for (var _i = 0, _a = this.stars; _i < _a.length; _i++) {
            var s = _a[_i];
            s.cameraCheck(cam);
            s.update(ev);
            s.playerCollision(this.player);
        }
        this.player.update(ev);
        cam.followObject(this.player, ev);
        stage.objectCollisions(this.player, ev);
    };
    ObjectManager.prototype.draw = function (c) {
        for (var _i = 0, _a = this.stars; _i < _a.length; _i++) {
            var s = _a[_i];
            s.draw(c);
        }
        this.player.preDraw(c);
        this.player.draw(c);
    };
    ObjectManager.prototype.addStar = function (x, y) {
        this.stars.push(new Star(x * 16 + 8, y * 16 + 8));
    };
    return ObjectManager;
}());
export { ObjectManager };
