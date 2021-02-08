var GameEvent = /** @class */ (function () {
    function GameEvent(step, core) {
        this.core = core;
        this.step = step;
    }
    return GameEvent;
}());
export { GameEvent };
var Core = /** @class */ (function () {
    function Core(canvasWidth, canvasHeight, frameSkip) {
        this.ev = new GameEvent(frameSkip + 1, this);
        this.timeSum = 0.0;
        this.oldTime = 0.0;
        this.initialized = false;
    }
    Core.prototype.loop = function (ts) {
        var _this = this;
        var MAX_REFRESH_COUNT = 5;
        var FRAME_WAIT = 16.66667 * this.ev.step;
        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;
        var refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount--) > 0) {
            console.log("Lol");
            this.timeSum -= FRAME_WAIT;
        }
        window.requestAnimationFrame(function (ts) { return _this.loop(ts); });
    };
    Core.prototype.run = function () {
        this.loop(0);
    };
    return Core;
}());
export { Core };
