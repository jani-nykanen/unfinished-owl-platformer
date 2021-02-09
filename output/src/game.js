import { Camera } from "./camera.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";
var GameScene = /** @class */ (function () {
    function GameScene(param, ev) {
        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
        this.objects = new ObjectManager();
    }
    GameScene.prototype.refresh = function (ev) {
        this.objects.update(this.cam, this.stage, ev);
        this.stage.update(ev);
    };
    GameScene.prototype.redraw = function (c) {
        c.clear(85, 85, 85);
        this.cam.computeViewport(c);
        this.stage.restrictCamera(this.cam);
        this.cam.use(c);
        this.stage.draw(c, this.cam);
        this.objects.draw(c);
        c.moveTo();
    };
    GameScene.prototype.dispose = function () {
        return null;
    };
    return GameScene;
}());
export { GameScene };
