import { Camera } from "./camera.js";
import { GameState } from "./gamestate.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";
import { State } from "./util.js";
var HUD_APPEAR_TIME = 30;
var HUD_TIME = 120;
var GameScene = /** @class */ (function () {
    function GameScene(param, ev) {
        this.state = new GameState();
        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
        this.objects = new ObjectManager(this.state);
        this.stage.parseObjects(this.objects);
        this.cloudPos = (new Array(2)).fill(0);
        this.hudAppearTimer = 0;
        this.hudAppearMode = 0;
        this.hudTimer = 0;
        this.paused = false;
        this.pauseWaveTimer = 0;
    }
    GameScene.prototype.updateHUD = function (ev) {
        //
        // All these nested ifs are so ugly, but this was the
        // easiest way to achieve this
        //
        if (this.state.hasChanged()) {
            switch (this.hudAppearMode) {
                case 0:
                    this.hudAppearMode = 1;
                    this.hudAppearTimer = HUD_APPEAR_TIME;
                    break;
                case 2:
                    this.hudAppearTimer = HUD_APPEAR_TIME - this.hudAppearTimer;
                    this.hudAppearMode = 1;
                    break;
                case 3:
                    this.hudTimer = HUD_TIME;
                    break;
                default:
                    break;
            }
        }
        if (this.hudAppearMode != 0) {
            if (this.hudAppearMode == 3) {
                if ((this.hudTimer -= ev.step) <= 0) {
                    this.hudAppearMode = 2;
                    this.hudAppearTimer = HUD_APPEAR_TIME;
                }
            }
            else if ((this.hudAppearTimer -= ev.step) <= 0) {
                if (this.hudAppearMode == 1) {
                    this.hudAppearMode = 3;
                    this.hudTimer = HUD_TIME;
                }
                else {
                    this.hudAppearMode = 0;
                }
            }
        }
    };
    GameScene.prototype.refresh = function (ev) {
        var CLOUD_SPEED = [0.125, 0.25];
        var PAUSE_WAVE_SPEED = 0.05;
        if (ev.getAction("start") == State.Pressed) {
            this.hudTimer = HUD_TIME;
            this.hudAppearMode = 3;
            this.paused = !this.paused;
            this.pauseWaveTimer = 0;
        }
        if (this.paused) {
            this.pauseWaveTimer =
                (this.pauseWaveTimer + PAUSE_WAVE_SPEED * ev.step) %
                    (Math.PI * 2);
            return;
        }
        this.objects.update(this.cam, this.stage, ev);
        this.stage.update(ev);
        for (var i = 0; i < this.cloudPos.length; ++i) {
            this.cloudPos[i] = (this.cloudPos[i] + CLOUD_SPEED[i] * ev.step) % 256;
        }
        this.updateHUD(ev);
        this.state.update();
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
    GameScene.prototype.drawHUD = function (c) {
        var fontBigger = c.getBitmap("fontBigger");
        if (this.hudAppearMode == 0)
            return;
        var y = 2;
        if (this.hudAppearMode == 1) {
            y = y - 16 / HUD_APPEAR_TIME * this.hudAppearTimer;
        }
        else if (this.hudAppearMode == 2) {
            y = y - 16 / HUD_APPEAR_TIME * (HUD_APPEAR_TIME - this.hudAppearTimer);
        }
        c.drawText(fontBigger, String.fromCharCode(3) +
            String.fromCharCode(2) +
            String(this.state.getStarCount()), c.width / 2, y, -6, 0, true);
    };
    GameScene.prototype.drawPause = function (c) {
        var TEXT_AMPLITUDE = 4;
        var PAUSE_STR = "GAME PAUSED";
        var WAVE_JUMP = Math.PI * 2 / PAUSE_STR.length;
        var font = c.getBitmap("font");
        c.setFillColor(0, 0, 0, 0.33);
        c.fillRect(0, 0, c.width, c.height);
        var yoff;
        var x = c.width / 2 - PAUSE_STR.length / 2 * 8;
        for (var i = 0; i < PAUSE_STR.length; ++i) {
            yoff = Math.sin(this.pauseWaveTimer + WAVE_JUMP * i) * TEXT_AMPLITUDE;
            yoff = Math.round(yoff);
            c.drawText(font, PAUSE_STR.charAt(i), x + i * 8, c.height / 2 - 4 + yoff);
        }
    };
    GameScene.prototype.redraw = function (c) {
        c.moveTo();
        this.drawBackground(c);
        this.cam.computeViewport(c);
        this.stage.restrictCamera(c, this.cam);
        this.cam.use(c);
        c.applyShake();
        this.stage.draw(c, this.cam);
        this.objects.draw(c);
        c.moveTo();
        if (this.paused) {
            this.drawPause(c);
        }
        this.drawHUD(c);
    };
    GameScene.prototype.dispose = function () {
        return null;
    };
    return GameScene;
}());
export { GameScene };
