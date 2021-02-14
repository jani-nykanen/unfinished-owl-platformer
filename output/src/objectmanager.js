import { getEnemyType } from "./enemytypes.js";
import { Player } from "./player.js";
import { Star } from "./star.js";
var ObjectManager = /** @class */ (function () {
    function ObjectManager(state) {
        this.player = new Player(0, 0, state);
        this.stars = new Array();
        this.enemies = new Array();
        this.checkpoints = new Array();
    }
    ObjectManager.prototype.updateInteractionTargetArray = function (arr, cam, ev) {
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var a = arr_1[_i];
            a.cameraCheck(cam);
            a.update(ev);
            a.playerCollision(this.player, ev);
        }
    };
    ObjectManager.prototype.update = function (cam, stage, ev) {
        this.updateInteractionTargetArray(this.stars, cam, ev);
        // TODO: A class that extends all this methods, so
        // we can just call "updateObjectArray" or something?
        for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
            var e = _a[_i];
            e.cameraCheck(cam);
            e.update(ev);
            e.playerCollision(this.player, ev);
            stage.objectCollisions(e, ev);
            if (!e.isDeactivated()) {
                for (var _b = 0, _c = this.enemies; _b < _c.length; _b++) {
                    var e2 = _c[_b];
                    if (e2 != e) {
                        e.enemyCollision(e2, ev);
                    }
                }
            }
        }
        this.player.update(ev);
        cam.followObject(this.player, ev);
        stage.objectCollisions(this.player, ev);
    };
    ObjectManager.prototype.draw = function (c) {
        for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
            var e = _a[_i];
            e.preDraw(c);
        }
        for (var _b = 0, _c = this.stars; _b < _c.length; _b++) {
            var s = _c[_b];
            s.draw(c);
        }
        for (var _d = 0, _e = this.enemies; _d < _e.length; _d++) {
            var e = _e[_d];
            e.draw(c);
        }
        this.player.preDraw(c);
        this.player.draw(c);
    };
    ObjectManager.prototype.setCamera = function (cam) {
        cam.setPosition(this.player.getPos());
    };
    ObjectManager.prototype.setPlayerPosition = function (x, y) {
        this.player.setPosition(x * 16 + 8, y * 16 + 8);
    };
    ObjectManager.prototype.addStar = function (x, y) {
        this.stars.push(new Star(x * 16 + 8, y * 16 + 8));
    };
    ObjectManager.prototype.addEnemy = function (x, y, id) {
        this.enemies.push(new (getEnemyType(id))
            .prototype
            .constructor(x * 16 + 8, y * 16 + 8));
    };
    return ObjectManager;
}());
export { ObjectManager };
