import { Camera } from "./camera.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";
var GameScene = /** @class */ (function () {
    function GameScene(param, ev) {
        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
        this.objects = new ObjectManager();
        this.cloudPos = (new Array(2)).fill(0);
    }
    GameScene.prototype.refresh = function (ev) {
        var CLOUD_SPEED = [0.125, 0.25];
        this.objects.update(this.cam, this.stage, ev);
        this.stage.update(ev);
        for (var i = 0; i < this.cloudPos.length; ++i) {
            this.cloudPos[i] = (this.cloudPos[i] + CLOUD_SPEED[i] * ev.step) % 256;
        }
    };
    GameScene.prototype.drawBackground = function (c) {
        c.drawBitmap(c.getBitmap("sky"), 0, 0);
        var bmpTrees = c.getBitmap("trees");
        var bmpClouds = c.getBitmap("clouds");
        var dx = Math.round(this.cam.getViewport().x / 4) % bmpTrees.width;
        var dy = Math.round(this.cam.getViewport().y / 4) % bmpTrees.height;
        for (var j = 0; j < this.cloudPos.length; ++j) {
            for (var i = 0; i < 2; ++i) {
                c.drawBitmapRegion(bmpClouds, 0, bmpClouds.height / 2 * j, bmpClouds.width, bmpClouds.height / 2, bmpClouds.width * i - this.cloudPos[j], 16);
            }
        }
        for (var i = 0; i < 3; ++i) {
            c.drawBitmap(bmpTrees, i * bmpTrees.width - dx, 16 + 192 - bmpTrees.height - dy);
        }
    };
    GameScene.prototype.redraw = function (c) {
        c.moveTo();
        this.drawBackground(c);
        this.cam.computeViewport(c);
        this.stage.restrictCamera(c, this.cam);
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
