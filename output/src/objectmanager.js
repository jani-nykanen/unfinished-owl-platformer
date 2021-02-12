import { Player } from "./player.js";
var ObjectManager = /** @class */ (function () {
    function ObjectManager() {
        this.player = new Player(128, 96);
    }
    ObjectManager.prototype.update = function (cam, stage, ev) {
        this.player.update(ev);
        cam.followObject(this.player, ev);
        stage.objectCollisions(this.player, ev);
    };
    ObjectManager.prototype.draw = function (c) {
        this.player.preDraw(c);
        this.player.draw(c);
    };
    return ObjectManager;
}());
export { ObjectManager };
