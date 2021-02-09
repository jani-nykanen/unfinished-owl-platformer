var GameScene = /** @class */ (function () {
    function GameScene(param, ev) {
        // ...
    }
    GameScene.prototype.refresh = function (ev) {
    };
    GameScene.prototype.redraw = function (c) {
        c.clear(170, 170, 170);
        c.drawBitmap(c.getBitmap("tileset"), 0, 0);
        c.drawText(c.getBitmap("font"), "Seems to work", 2, 2, 0, 0);
    };
    GameScene.prototype.dispose = function () {
        return null;
    };
    return GameScene;
}());
export { GameScene };
