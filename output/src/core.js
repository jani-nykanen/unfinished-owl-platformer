import { AssetManager } from "./assets.js";
import { Canvas } from "./canvas.js";
import { InputManager } from "./input.js";
var GameEvent = /** @class */ (function () {
    function GameEvent(step, core, input, assets) {
        this.core = core;
        this.step = step;
        this.input = input;
        this.assets = assets;
    }
    GameEvent.prototype.getStick = function () {
        return this.input.getStick();
    };
    GameEvent.prototype.getAction = function (name) {
        return this.input.getAction(name);
    };
    GameEvent.prototype.getTilemap = function (name) {
        return this.assets.getTilemap(name);
    };
    GameEvent.prototype.changeScene = function (newScene) {
        this.core.changeScene(newScene);
    };
    return GameEvent;
}());
export { GameEvent };
var Core = /** @class */ (function () {
    function Core(canvasWidth, canvasHeight, frameSkip) {
        this.assets = new AssetManager();
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.assets);
        this.input = new InputManager();
        this.input.addAction("left", "ArrowLeft", 14)
            .addAction("up", "ArrowUp", 12)
            .addAction("right", "ArrowRight", 15)
            .addAction("down", "ArrowDown", 13),
            this.ev = new GameEvent(frameSkip + 1, this, this.input, this.assets);
        this.timeSum = 0.0;
        this.oldTime = 0.0;
        this.initialized = false;
        this.activeScene = null;
        this.activeSceneType = null;
    }
    Core.prototype.drawLoadingScreen = function (c) {
        var barWidth = c.width / 4;
        var barHeight = barWidth / 8;
        c.clear(0, 0, 0);
        var t = this.assets.dataLoadedUnit();
        var x = c.width / 2 - barWidth / 2;
        var y = c.height / 2 - barHeight / 2;
        x |= 0;
        y |= 0;
        // Outlines
        c.setFillColor(255);
        c.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
        c.setFillColor(0);
        c.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
        // Bar
        var w = (barWidth * t) | 0;
        c.setFillColor(255);
        c.fillRect(x, y, w, barHeight);
    };
    Core.prototype.loop = function (ts) {
        var _this = this;
        var MAX_REFRESH_COUNT = 5;
        var FRAME_WAIT = 16.66667 * this.ev.step;
        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;
        var refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount--) > 0) {
            if (!this.initialized && this.assets.hasLoaded()) {
                if (this.activeSceneType != null)
                    this.activeScene = new this.activeSceneType.prototype.constructor(null, this.ev);
                this.initialized = true;
            }
            this.input.preUpdate();
            if (this.initialized && this.activeScene != null) {
                this.activeScene.refresh(this.ev);
            }
            this.canvas.update(this.ev);
            this.input.postUpdate();
            this.timeSum -= FRAME_WAIT;
        }
        if (this.initialized) {
            if (this.activeScene != null)
                this.activeScene.redraw(this.canvas);
        }
        else {
            this.drawLoadingScreen(this.canvas);
        }
        window.requestAnimationFrame(function (ts) { return _this.loop(ts); });
    };
    Core.prototype.addInputAction = function (name, key, button1, button2) {
        if (button2 === void 0) { button2 = -1; }
        this.input.addAction(name, key, button1, button2);
        return this;
    };
    Core.prototype.loadAssets = function (indexFilePath) {
        this.assets.parseAssetIndexFile(indexFilePath);
        return this;
    };
    Core.prototype.run = function (initialScene) {
        this.activeSceneType = initialScene;
        this.loop(0);
    };
    Core.prototype.changeScene = function (newScene) {
        var param = this.activeScene.dispose();
        this.activeScene = new newScene.prototype.constructor(param, this.ev);
    };
    return Core;
}());
export { Core };
