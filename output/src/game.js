import { Camera } from "./camera.js";
import { Stage } from "./stage.js";
var GameScene = /** @class */ (function () {
    function GameScene(param, ev) {
        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
    }
    GameScene.prototype.refresh = function (ev) {
        this.stage.update(ev);
    };
    GameScene.prototype.redraw = function (c) {
        c.clear(170, 170, 170);
        this.cam.use(c);
        this.stage.draw(c, this.cam);
        c.moveTo();
    };
    GameScene.prototype.dispose = function () {
        return null;
    };
    return GameScene;
}());
export { GameScene };
