import { Camera } from "./camera.js";
import { GameState } from "./gamestate.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";
import { State } from "./util.js";
var HUD_APPEAR_TIME = 15;
var HUD_TIME = 120;
var GameScene = /** @class */ (function () {
    function GameScene(param, ev) {
        this.state = new GameState();
        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
        this.objects = new ObjectManager(this.state);
        this.stage.parseObjects(this.objects);
        this.objects.setCamera(this.cam);
        this.objects.initialCameraCheck(this.cam);
        this.cloudPos = (new Array(2)).fill(0);
        this.hudAppearTimer = (new Array(2)).fill(0);
        this.hudAppearMode = (new Array(2)).fill(0);
        this.hudTimer = (new Array(2)).fill(0);
        this.paused = false;
        this.pauseWaveTimer = 0;
    }
    GameScene.prototype.updateHudTimer = function (index, condition, ev) {
        if (condition) {
            switch (this.hudAppearMode[index]) {
                case 0:
                    this.hudAppearMode[index] = 1;
                    this.hudAppearTimer[index] = HUD_APPEAR_TIME;
                    break;
                case 2:
                    this.hudAppearTimer[index] = HUD_APPEAR_TIME - this.hudAppearTimer[index];
                    this.hudAppearMode[index] = 1;
                    break;
                case 3:
                    this.hudTimer[index] = HUD_TIME;
                    break;
                default:
                    break;
            }
        }
        if (this.hudAppearMode[index] != 0) {
            if (this.hudAppearMode[index] == 3) {
                if ((this.hudTimer[index] -= ev.step) <= 0) {
                    this.hudAppearMode[index] = 2;
                    this.hudAppearTimer[index] = HUD_APPEAR_TIME;
                }
            }
            else if ((this.hudAppearTimer[index] -= ev.step) <= 0) {
                if (this.hudAppearMode[index] == 1) {
                    this.hudAppearMode[index] = 3;
                    this.hudTimer[index] = HUD_TIME;
                }
                else {
                    this.hudAppearMode[index] = 0;
                }
            }
        }
    };
    GameScene.prototype.updateHUD = function (ev) {
        this.updateHudTimer(0, this.state.hasLivesChanged(), ev);
        this.updateHudTimer(1, this.state.hasStarsChanged(), ev);
    };
    GameScene.prototype.refresh = function (ev) {
        var CLOUD_SPEED = [0.125, 0.25];
        var PAUSE_WAVE_SPEED = 0.05;
        if (ev.getAction("start") == State.Pressed) {
            for (var i = 0; i < this.hudTimer.length; ++i) {
                this.hudTimer[i] = HUD_TIME;
                this.hudAppearMode[i] = 3;
            }
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
        this.stage.update(this.cam, ev);
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
    GameScene.prototype.computeHudElementPosition = function (index) {
        if (this.hudAppearMode[index] == 0)
            return -16;
        var y = 2;
        if (this.hudAppearMode[index] == 1) {
            y = y - 16 / HUD_APPEAR_TIME * this.hudAppearTimer[index];
        }
        else if (this.hudAppearMode[index] == 2) {
            y = y - 16 / HUD_APPEAR_TIME * (HUD_APPEAR_TIME - this.hudAppearTimer[index]);
        }
        return y;
    };
    GameScene.prototype.drawHUD = function (c) {
        var fontBigger = c.getBitmap("fontBigger");
        // Lives
        var y = this.computeHudElementPosition(0);
        var str = String.fromCharCode(4) +
            String.fromCharCode(2) +
            String(this.state.getLifeCount());
        if (y > -16)
            c.drawText(fontBigger, str, 4, y, -6, 0, false);
        // Stars
        y = this.computeHudElementPosition(1);
        str = String.fromCharCode(3) +
            String.fromCharCode(2) +
            String(this.state.getStarCount()) +
            "/" + String(this.stage.starCount);
        if (y > -16)
            c.drawText(fontBigger, str, c.width / 2, y, -6, 0, true);
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
